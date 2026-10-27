'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  clampScrollExpand,
  smoothstepScrollExpand,
} from '../utils/sstCalculations';

type ConfigKey =
  | 'startWidth'
  | 'startHeight'
  | 'startRadius'
  | 'endRadius'
  | 'mediaZoom'
  | 'scrollDistance'
  | 'holdDistance'
  | 'smoothing'
  | 'overlayScrim'
  | 'useWindowScroll'
  | 'enabled';

export interface ScrollExpandFooterCaption {
  code?: string;
  title: string;
  description: string;
  normativeRef?: string;
  technicalSpec?: string;
}

export interface ScrollExpandProps {
  src?: string;
  mediaType?: 'image' | 'video';
  poster?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  footerCaption?: ScrollExpandFooterCaption;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const ScrollExpand: React.FC<ScrollExpandProps> = ({
  src = '',
  mediaType = 'image',
  poster = '',
  alt = '',
  title = '',
  scrollHint = 'Role para expandir',
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.08,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  footerCaption,
  children,
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isExpandedEnough, setIsExpandedEnough] = useState(false);
  const expandedReadyRef = useRef(false);

  const configRef = useRef({
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
  });

  const stateRef = useRef({
    target: 0,
    current: -1,
    rafId: 0,
    resizeRafId: 0,
    lastTime: 0,
    stageHeight: 0,
    trackTopDoc: 0,
    maxScrollPx: 1,
    needsScrollRead: true,
  });

  const applyFrame = useCallback((p: number) => {
    const container = containerRef.current;
    if (!container) return;

    const cfg = configRef.current;
    const totalUnits = Math.max(0.2, cfg.scrollDistance) + Math.max(0, cfg.holdDistance);
    const expandRatio = Math.max(0.2, cfg.scrollDistance) / (totalUnits || 1);
    const expandT = smoothstepScrollExpand(0, expandRatio, p);

    const w = cfg.startWidth + (100 - cfg.startWidth) * expandT;
    const h = cfg.startHeight + (100 - cfg.startHeight) * expandT;
    const insetX = (100 - w) * 0.5;
    const insetY = (100 - h) * 0.5;
    const radius = cfg.startRadius + (cfg.endRadius - cfg.startRadius) * expandT;
    const zoom = cfg.mediaZoom + (1 - cfg.mediaZoom) * expandT;
    const scrim = smoothstepScrollExpand(0.35, 0.9, expandT) * cfg.overlayScrim;
    const overlay = smoothstepScrollExpand(0.65, 1, expandT);
    const titleAlpha = 1 - smoothstepScrollExpand(0.05, 0.55, expandT);
    const hintAlpha = 1 - smoothstepScrollExpand(0, 0.2, expandT);

    container.style.setProperty('--se-progress', p.toFixed(4));
    container.style.setProperty('--se-w', `${w.toFixed(2)}%`);
    container.style.setProperty('--se-h', `${h.toFixed(2)}%`);
    container.style.setProperty('--se-inset-x', `${insetX.toFixed(2)}%`);
    container.style.setProperty('--se-inset-y', `${insetY.toFixed(2)}%`);
    container.style.setProperty('--se-radius', `${radius.toFixed(2)}px`);
    container.style.setProperty('--se-zoom', zoom.toFixed(4));
    container.style.setProperty('--se-scrim', scrim.toFixed(4));
    container.style.setProperty('--se-overlay', overlay.toFixed(4));
    container.style.setProperty('--se-title', titleAlpha.toFixed(4));
    container.style.setProperty('--se-hint', hintAlpha.toFixed(4));

    const expandedReady = expandT >= 0.25;
    if (expandedReady !== expandedReadyRef.current) {
      expandedReadyRef.current = expandedReady;
      setIsExpandedEnough(expandedReady);
    }
  }, []);

  const updateTrackHeight = useCallback(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const container = containerRef.current;
    if (!track || !stage || !container) return;

    const cfg = configRef.current;
    if (!cfg.enabled) {
      track.style.height = 'auto';
      return;
    }

    const baseH = cfg.useWindowScroll
      ? window.innerHeight
      : container.clientHeight || stage.offsetHeight || 600;
    const totalScrollUnits = 1 + Math.max(0.2, cfg.scrollDistance) + Math.max(0, cfg.holdDistance);
    const trackHeightPx = Math.round(baseH * totalScrollUnits);
    track.style.height = `${trackHeightPx}px`;

    const rect = track.getBoundingClientRect();
    stateRef.current.stageHeight = baseH;
    stateRef.current.trackTopDoc = rect.top + window.scrollY;
    stateRef.current.maxScrollPx = Math.max(1, trackHeightPx - baseH);
    stateRef.current.needsScrollRead = true;
  }, []);

  const readScrollInFrame = useCallback((): number => {
    const cfg = configRef.current;
    if (!cfg.enabled) return 0;

    if (cfg.useWindowScroll) {
      const scrolled = window.scrollY - stateRef.current.trackTopDoc;
      return clampScrollExpand(scrolled / stateRef.current.maxScrollPx, 0, 1);
    }

    const container = containerRef.current;
    if (!container) return 0;
    const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight);
    return clampScrollExpand(container.scrollTop / maxScroll, 0, 1);
  }, []);

  const tick = useCallback(
    (now: number) => {
      const st = stateRef.current;
      const cfg = configRef.current;

      // Perform scroll position calculation inside requestAnimationFrame
      if (st.needsScrollRead) {
        st.target = readScrollInFrame();
        st.needsScrollRead = false;
      }

      // Fast exit when scroll progress is settled at boundary (0 or 1)
      if (Math.abs(st.target - st.current) < 0.0005) {
        if (st.current !== st.target) {
          st.current = st.target;
          applyFrame(st.current);
        }
        st.rafId = 0;
        st.lastTime = 0;
        return;
      }

      const dt = st.lastTime ? Math.min(0.1, (now - st.lastTime) / 1000) : 1 / 60;
      st.lastTime = now;

      if (cfg.smoothing <= 0 || st.current < 0) {
        st.current = st.target;
      } else {
        const alpha = 1 - Math.exp(-dt / Math.max(0.001, cfg.smoothing));
        st.current += (st.target - st.current) * alpha;
      }

      if (Math.abs(st.target - st.current) < 0.0008) {
        st.current = st.target;
        st.rafId = 0;
        st.lastTime = 0;
        applyFrame(st.current);
        return;
      }

      applyFrame(st.current);
      st.rafId = requestAnimationFrame(tick);
    },
    [applyFrame, readScrollInFrame]
  );

  const scheduleUpdate = useCallback(() => {
    const st = stateRef.current;
    st.needsScrollRead = true;
    if (!st.rafId) {
      st.lastTime = 0;
      st.rafId = requestAnimationFrame(tick);
    }
  }, [tick]);

  useEffect(() => {
    const prev = configRef.current;
    const next = {
      startWidth,
      startHeight,
      startRadius,
      endRadius,
      mediaZoom,
      scrollDistance,
      holdDistance,
      smoothing,
      overlayScrim,
      useWindowScroll,
      enabled,
    };

    const changedKeys = (Object.keys(next) as ConfigKey[]).filter(
      (k) => prev[k] !== next[k]
    );
    configRef.current = next;

    if (
      changedKeys.includes('scrollDistance') ||
      changedKeys.includes('holdDistance') ||
      changedKeys.includes('useWindowScroll') ||
      changedKeys.includes('enabled')
    ) {
      updateTrackHeight();
    }

    scheduleUpdate();
  }, [
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
    updateTrackHeight,
    scheduleUpdate,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateTrackHeight();
    const initial = readScrollInFrame();
    stateRef.current.target = initial;
    stateRef.current.current = initial;
    stateRef.current.needsScrollRead = false;
    applyFrame(initial);

    const onScroll = () => {
      scheduleUpdate();
    };

    const onResize = () => {
      const st = stateRef.current;
      if (st.resizeRafId) cancelAnimationFrame(st.resizeRafId);
      st.resizeRafId = requestAnimationFrame(() => {
        st.resizeRafId = 0;
        updateTrackHeight();
        scheduleUpdate();
      });
    };

    const scrollTarget: HTMLElement | Window = useWindowScroll ? window : container;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Re-sync cached track offset inside requestAnimationFrame once layout settles
    const syncTimer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        updateTrackHeight();
        scheduleUpdate();
      });
    }, 250);

    return () => {
      window.clearTimeout(syncTimer);
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (stateRef.current.rafId) {
        cancelAnimationFrame(stateRef.current.rafId);
        stateRef.current.rafId = 0;
      }
      if (stateRef.current.resizeRafId) {
        cancelAnimationFrame(stateRef.current.resizeRafId);
        stateRef.current.resizeRafId = 0;
      }
    };
  }, [useWindowScroll, updateTrackHeight, readScrollInFrame, applyFrame, scheduleUpdate]);

  const rootClassName = [
    'scroll-expand',
    useWindowScroll ? 'scroll-expand--window' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const showFooterCaption = Boolean(footerCaption) && isHovered;

  return (
    <div
      ref={containerRef}
      data-testid="scroll-expand-root"
      className={rootClassName}
      style={style}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div
            ref={frameRef}
            tabIndex={0}
            data-testid="scroll-expand-frame"
            data-expanded={isExpandedEnough ? 'true' : 'false'}
            data-caption-visible={showFooterCaption ? 'true' : 'false'}
            onMouseEnter={() => setIsHovered(true)}
            onPointerEnter={() => setIsHovered(true)}
            onFocus={() => setIsHovered(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setIsHovered(false);
              }
            }}
            onMouseMove={() => {
              if (!isHovered) setIsHovered(true);
            }}
            onMouseLeave={() => setIsHovered(false)}
            className="scroll-expand__frame group focus-visible:outline-none"
          >
            {mediaType === 'video' ? (
              <video
                className="scroll-expand__media"
                src={src}
                poster={poster}
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              src && (
                <img
                  className="scroll-expand__media"
                  src={src}
                  alt={alt}
                  draggable={false}
                />
              )
            )}
            <div className="scroll-expand__scrim" />
            {children && <div className="scroll-expand__overlay">{children}</div>}

            {/* Subtle Hover Prompt Pill at Bottom Right when Expanded and Not Yet Hovered */}
            {footerCaption && isExpandedEnough && !isHovered && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-5 right-6 z-[3] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0F14]/85 border border-white/15 text-[11px] font-tabular uppercase tracking-[0.16em] text-white/85 transition-opacity duration-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#68B2A0]" />
                <span>Passe o mouse para ver a legenda técnica</span>
              </div>
            )}

            {/* Hover-Revealed Footer Caption Bar at the Bottom of the Image */}
            {footerCaption && (
              <div
                data-testid="scroll-expand-footer-caption"
                role="region"
                aria-label={`Legenda da imagem: ${footerCaption.title}`}
                className="scroll-expand__footer-caption"
              >
                <div className="max-w-[1680px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl text-left">
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-tabular uppercase tracking-[0.18em] text-[#68B2A0]">
                      {footerCaption.code && <span>{footerCaption.code}</span>}
                      {footerCaption.normativeRef && (
                        <>
                          <span aria-hidden="true" className="text-white/30">
                            ·
                          </span>
                          <span className="text-white/80">{footerCaption.normativeRef}</span>
                        </>
                      )}
                    </div>
                    <h4 className="font-editorial text-xl sm:text-2xl font-normal text-white leading-snug">
                      {footerCaption.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                      {footerCaption.description}
                    </p>
                  </div>

                  {footerCaption.technicalSpec && (
                    <div className="shrink-0 flex items-center gap-2 text-[11px] font-tabular text-white/70 border-t lg:border-t-0 border-white/10 pt-2.5 lg:pt-0">
                      <span className="w-2 h-2 rounded-full bg-[#68B2A0]" />
                      <span>{footerCaption.technicalSpec}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {title && <h2 className="scroll-expand__title">{title}</h2>}
          {scrollHint && (
            <div className="scroll-expand__hint">
              <span className="scroll-expand__hint-dot" />
              <span>{scrollHint}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrollExpand;
