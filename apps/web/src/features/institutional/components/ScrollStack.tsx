'use client';

import React, {
  Children,
  Fragment,
  isValidElement,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  resolveScrollStackOffset,
  calculateScrollStackCardTransform,
} from '../utils/sstCalculations';

export interface ScrollStackItemProps {
  children?: ReactNode;
  itemClassName?: string;
  style?: CSSProperties;
}

export interface ScrollStackProps {
  children?: ReactNode;
  className?: string;
  itemDistance?: number;
  itemStackDistance?: number;
  stackPosition?: number | string;
  itemScale?: number;
  baseScale?: number;
  dimAmount?: number;
  blurAmount?: number;
  tiltAmount?: number;
  rotationAmount?: number;
  holdDistance?: number;
  smoothScroll?: boolean;
  snap?: boolean;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

interface StackSettings {
  itemDistance: number;
  itemStackDistance: number;
  stackPosition: number | string;
  itemScale: number;
  baseScale: number;
  dimAmount: number;
  blurAmount: number;
  tiltAmount: number;
  rotationAmount: number;
  holdDistance: number;
  smoothScroll: boolean;
  snap: boolean;
  onStackComplete?: () => void;
}

const toLength = (value: number | string) =>
  typeof value === 'number' ? `${value}px` : value;

const scrollsInside = (node: Element | null, stop: Element, delta: number) => {
  for (
    let element: Element | null = node;
    element && element !== stop;
    element = element.parentElement
  ) {
    if (element.scrollHeight <= element.clientHeight + 1) continue;
    const overflow = getComputedStyle(element).overflowY;
    if (overflow !== 'auto' && overflow !== 'scroll') continue;
    if (
      delta > 0
        ? element.scrollTop + element.clientHeight < element.scrollHeight - 1
        : element.scrollTop > 0
    ) {
      return true;
    }
  }
  return false;
};

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = '',
  style,
}) => (
  <div
    data-testid="scroll-stack-card"
    className={`scroll-stack-card ${itemClassName}`.trim()}
    style={style}
  >
    {children}
    <span className="scroll-stack-card__shade" aria-hidden="true" />
  </div>
);

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 100,
  itemStackDistance = 24,
  stackPosition = '15%',
  itemScale = 0.05,
  baseScale = 0.8,
  dimAmount = 0.2,
  blurAmount = 0,
  tiltAmount = 0,
  rotationAmount = 0,
  holdDistance = 200,
  smoothScroll = false,
  snap = false,
  useWindowScroll = false,
  onStackComplete,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<StackSettings | null>(null);
  const scheduleMeasureRef = useRef<(() => void) | null>(null);
  const items = Children.toArray(children);

  useLayoutEffect(() => {
    settingsRef.current = {
      itemDistance,
      itemStackDistance,
      stackPosition,
      itemScale,
      baseScale,
      dimAmount,
      blurAmount,
      tiltAmount,
      rotationAmount,
      holdDistance,
      smoothScroll,
      snap,
      onStackComplete,
    };
    scheduleMeasureRef.current?.();
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    const end = endRef.current;
    if (!root || !inner || !end) return undefined;

    const windowed = useWindowScroll;
    const target = windowed ? window : root;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cache = new Map<string, string | number>();

    let frame = 0;
    let measureFrame = 0;
    let glide = 0;
    let rest = 0;
    let complete = false;
    let gliding = false;
    let pressed = false;
    let current = 0;
    let goal = 0;
    let written = 0;
    let last = 0;
    let points: number[] = [];
    let reach = 0;

    // Cached layout metrics (updated only on mount/resize, never during scroll frames)
    let cachedSlots: HTMLElement[] = [];
    let cachedCards: (HTMLElement | null)[] = [];
    let cachedHeights: number[] = [];
    let cachedNaturalTopsDoc: number[] = [];
    let cachedViewHeight = window.innerHeight;
    let cachedStackTop = 0;

    const readScroll = () => (windowed ? window.scrollY : root.scrollTop);
    const maxScroll = () =>
      windowed
        ? document.documentElement.scrollHeight - window.innerHeight
        : root.scrollHeight - root.clientHeight;
    const writeScroll = (value: number) => {
      written = value;
      target.scrollTo({ top: value, behavior: 'instant' });
    };

    const write = <T extends string | number>(
      key: string,
      value: T,
      apply: (value: T) => void
    ) => {
      if (cache.get(key) === value) return false;
      cache.set(key, value);
      apply(value);
      return true;
    };

    const measureLayout = () => {
      measureFrame = 0;
      const settings = settingsRef.current;
      cachedSlots = (Array.from(inner.children) as HTMLElement[]).filter((child) =>
        child.hasAttribute('data-stack-slot')
      );
      if (!settings || !cachedSlots.length) return;

      cachedCards = cachedSlots.map(
        (slot) => slot.firstElementChild as HTMLElement | null
      );
      cachedViewHeight = windowed ? window.innerHeight : root.clientHeight;
      const viewTop = windowed ? 0 : root.getBoundingClientRect().top + root.clientTop;
      cachedStackTop = resolveScrollStackOffset(settings.stackPosition, cachedViewHeight);
      const offset = settings.itemStackDistance;

      cachedHeights = cachedSlots.map((slot) => slot.offsetHeight);
      const lastPin = cachedStackTop + (cachedSlots.length - 1) * offset;
      const padTop = windowed ? 0 : cachedStackTop;
      const endHeight =
        settings.holdDistance +
        (windowed
          ? 0
          : Math.max(
              0,
              cachedViewHeight - lastPin - cachedHeights[cachedHeights.length - 1]
            ));

      write('padTop', padTop, (value) => {
        inner.style.paddingTop = `${value}px`;
      });
      write('endHeight', endHeight, (value) => {
        end.style.height = `${value}px`;
      });

      const innerTopDoc =
        inner.getBoundingClientRect().top - viewTop + readScroll() + padTop;
      let flow = innerTopDoc;
      cachedNaturalTopsDoc = [];
      points = cachedHeights.map((height, i) => {
        cachedNaturalTopsDoc.push(flow);
        const point = flow - cachedStackTop - i * offset;
        flow += height + settings.itemDistance;
        return point;
      });
      reach = Math.max(40, (cachedHeights[0] + settings.itemDistance - offset) / 2);

      update();
    };

    const update = () => {
      frame = 0;
      const settings = settingsRef.current;
      if (!settings || !cachedSlots.length) return;

      const scrollPos = readScroll();
      const offset = settings.itemStackDistance;

      const coverList = cachedSlots.slice(1).map((_, idx) => {
        const j = idx + 1;
        const pinBefore = cachedStackTop + (j - 1) * offset;
        const start = pinBefore + cachedHeights[j - 1];
        const span = Math.max(1, start - pinBefore - offset);
        const pinSelf = cachedStackTop + j * offset;
        const currentSlotTop = Math.max(
          pinSelf,
          (cachedNaturalTopsDoc[j] ?? 0) - scrollPos
        );
        return Math.min(1, Math.max(0, (start - currentSlotTop) / span));
      });

      const lastCover = coverList.length > 0 ? coverList[coverList.length - 1] : 0;
      const depths = cachedSlots.map((_, i) =>
        coverList.slice(i).reduce((sum, c) => sum + c, 0)
      );

      cachedCards.forEach((card, i) => {
        if (!card) return;
        const depth = depths[i];
        const visual = calculateScrollStackCardTransform(depth, i, {
          itemScale: settings.itemScale,
          baseScale: settings.baseScale,
          dimAmount: settings.dimAmount,
          tiltAmount: settings.tiltAmount,
          rotationAmount: settings.rotationAmount,
        });

        write(`transform${i}`, visual.transformCss, (value) => {
          card.style.transform = value;
        });

        if (settings.blurAmount > 0) {
          const blur = depth * settings.blurAmount;
          write(
            `filter${i}`,
            blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : '',
            (value) => {
              card.style.filter = value;
            }
          );
        }

        write(`dim${i}`, visual.dim.toFixed(3), (value) => {
          card.style.setProperty('--scroll-stack-dim', value);
        });
      });

      const done = cachedSlots.length > 1 && lastCover >= 0.999;
      if (done !== complete) {
        complete = done;
        if (done) settings.onStackComplete?.();
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const scheduleMeasure = () => {
      if (!measureFrame) measureFrame = requestAnimationFrame(measureLayout);
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (Math.abs(readScroll() - written) > 2) {
        gliding = false;
        glide = 0;
        settleSoon();
        return;
      }
      current += (goal - current) * (1 - Math.pow(0.9, dt * 60));
      if (Math.abs(goal - current) < 0.5) current = goal;
      writeScroll(current);
      if (current === goal) {
        gliding = false;
        glide = 0;
        settleSoon();
        return;
      }
      glide = requestAnimationFrame(step);
    };

    const glideTo = (value: number) => {
      goal = Math.min(Math.max(value, 0), maxScroll());
      if (motion.matches) {
        writeScroll(goal);
        return;
      }
      if (gliding) return;
      gliding = true;
      current = readScroll();
      written = current;
      last = performance.now();
      glide = requestAnimationFrame(step);
    };

    const settle = () => {
      rest = 0;
      if (!settingsRef.current?.snap || gliding || pressed || !points.length) return;
      const now = readScroll();
      const nearest = points.reduce((best, point) =>
        Math.abs(point - now) < Math.abs(best - now) ? point : best
      );
      const gap = Math.abs(nearest - now);
      if (gap > 1 && gap < reach) glideTo(nearest);
    };

    const settleSoon = () => {
      window.clearTimeout(rest);
      rest = window.setTimeout(settle, 140);
    };

    const onScroll = () => {
      schedule();
      if (settingsRef.current?.snap && !gliding) settleSoon();
    };

    const onWheel = (input: Event) => {
      const event = input as WheelEvent;
      if (
        !settingsRef.current?.smoothScroll ||
        motion.matches ||
        event.defaultPrevented ||
        event.ctrlKey
      )
        return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const page = windowed ? window.innerHeight : root.clientHeight;
      const delta =
        event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page : 1);
      if (
        !delta ||
        scrollsInside(
          event.target as Element | null,
          windowed ? document.body : root,
          delta
        )
      )
        return;
      const base = gliding ? goal : readScroll();
      if ((delta < 0 && base <= 0) || (delta > 0 && base >= maxScroll() - 0.5)) return;
      event.preventDefault();
      window.clearTimeout(rest);
      glideTo(base + delta);
    };

    const onPress = () => {
      pressed = true;
      window.clearTimeout(rest);
    };

    const onRelease = () => {
      if (!pressed) return;
      pressed = false;
      settleSoon();
    };

    target.addEventListener('scroll', onScroll, { passive: true });
    if (settingsRef.current?.smoothScroll) {
      target.addEventListener('wheel', onWheel, { passive: false });
    }
    target.addEventListener('pointerdown', onPress, { passive: true });
    window.addEventListener('pointerup', onRelease, { passive: true });
    window.addEventListener('pointercancel', onRelease, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    scheduleMeasureRef.current = scheduleMeasure;
    measureLayout();

    const syncTimer = window.setTimeout(scheduleMeasure, 300);

    return () => {
      window.clearTimeout(syncTimer);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      cancelAnimationFrame(glide);
      window.clearTimeout(rest);
      target.removeEventListener('scroll', onScroll);
      target.removeEventListener('wheel', onWheel);
      target.removeEventListener('pointerdown', onPress);
      window.removeEventListener('pointerup', onRelease);
      window.removeEventListener('pointercancel', onRelease);
      window.removeEventListener('resize', scheduleMeasure);
      scheduleMeasureRef.current = null;
    };
  }, [useWindowScroll]);

  return (
    <div
      ref={rootRef}
      data-testid="scroll-stack-root"
      className={`scroll-stack ${
        useWindowScroll ? 'scroll-stack--window' : 'scroll-stack--contained'
      } ${className}`.trim()}
    >
      <div ref={innerRef} className="scroll-stack__inner">
        {items.map((child, index) => {
          const gap = itemDistance - (items.length - index) * itemStackDistance;
          const mb = (items.length - 1 - index) * itemStackDistance;
          return (
            <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
              {index > 0 && gap !== 0 && (
                <div
                  aria-hidden="true"
                  style={{ height: Math.max(0, gap), marginTop: Math.min(0, gap) }}
                />
              )}
              <div
                data-stack-slot=""
                className="scroll-stack__slot"
                style={{
                  top: `calc(${toLength(stackPosition)} + ${index * itemStackDistance}px)`,
                  marginBottom: mb > 0 ? mb : 0,
                  zIndex: index + 1,
                }}
              >
                {child}
              </div>
            </Fragment>
          );
        })}
        <div ref={endRef} className="scroll-stack__end" aria-hidden="true" />
      </div>
    </div>
  );
};

export default ScrollStack;
