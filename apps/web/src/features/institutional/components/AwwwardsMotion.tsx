/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { motion, Variants } from 'motion/react';
import { calculateMagneticPull, tokenizeSplitText } from '../utils/sstCalculations';

export const EASE_AWWWARDS: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface SplitTextRevealProps {
  text: string;
  highlightText?: string;
  className?: string;
  highlightClassName?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span';
  delay?: number;
  charStagger?: number;
}

/**
 * Character-level SplitText Reveal using Framer Motion:
 * Wraps each individual character in a `<motion.span>` inside word groups and reveals
 * each character with a staggered Y-axis slide (strictly orthogonal).
 */
export const SplitTextReveal: React.FC<SplitTextRevealProps> = ({
  text,
  highlightText,
  className = '',
  highlightClassName = 'italic font-normal',
  as: Tag = 'h2',
  delay = 0,
  charStagger = 0.015,
}) => {
  const wordTokens = useMemo(
    () => tokenizeSplitText(text, highlightText),
    [text, highlightText]
  );

  const fullAccessibleText = highlightText ? `${text} ${highlightText}` : text;

  const containerVars: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: charStagger,
        delayChildren: delay,
      },
    },
  };

  const charVars: Variants = {
    hidden: {
      y: '55%',
      opacity: 0,
    },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.62,
        ease: EASE_AWWWARDS,
      },
    },
  };

  return (
    <Tag aria-label={fullAccessibleText} className={className}>
      <motion.span
        aria-hidden="true"
        variants={containerVars}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="inline"
      >
        {wordTokens.map((wordObj, wIdx) => (
          <span
            key={`word-${wIdx}`}
            data-split-word={wordObj.word}
            className={`inline-block whitespace-nowrap mr-[0.26em] ${
              wordObj.isHighlight
                ? `${highlightClassName} text-[var(--accent-editorial)]`
                : ''
            }`}
          >
            {wordObj.chars.map((charObj) => (
              <span
                key={`char-${charObj.globalIndex}`}
                className="inline-block overflow-visible align-baseline"
              >
                <motion.span
                  variants={charVars}
                  data-split-char={charObj.char}
                  className="inline-block"
                >
                  {charObj.char}
                </motion.span>
              </span>
            ))}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
};

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticWrapper: React.FC<MagneticProps> = ({
  children,
  strength = 0.24,
  className = 'inline-block',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const quickXRef = useRef<gsap.QuickToFunc | null>(null);
  const quickYRef = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    quickXRef.current = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    quickYRef.current = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const pull = calculateMagneticPull(e.clientX, e.clientY, centerX, centerY, strength);
    quickXRef.current?.(pull.x);
    quickYRef.current?.(pull.y);
  };

  const handleMouseLeave = () => {
    quickXRef.current?.(0);
    quickYRef.current?.(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${className} will-change-transform`}
    >
      {children}
    </div>
  );
};
