/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { calculateCardSpotlightCoords } from '../utils/sstCalculations';

/**
 * Consolidated rAF-throttled cursor spotlight hook for interactive frosted-glass cards.
 * Eliminates duplicated spotlight handlers and prevents synchronous layout thrashing.
 */
export function useCardSpotlight(reducedMotion = false) {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (rafRef.current) return;
      const el = e.currentTarget;
      const clientX = e.clientX;
      const clientY = e.clientY;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const rect = el.getBoundingClientRect();
        const coords = calculateCardSpotlightCoords(clientX, clientY, rect, reducedMotion);
        el.style.setProperty('--spotlight-x', `${coords.xPct}%`);
        el.style.setProperty('--spotlight-y', `${coords.yPct}%`);
      });
    },
    [reducedMotion]
  );
}

/**
 * Consolidated clipboard copy hook with explicit try/catch error handling and timer cleanup.
 */
export function useClipboardCopy<T extends string = string>(resetDelayMs = 2400) {
  const [copiedKey, setCopiedKey] = useState<T | null>(null);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copyText = useCallback(
    async (text: string, key: T = 'default' as T): Promise<boolean> => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        }
        setCopiedKey(key);
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
        }
        timerRef.current = window.setTimeout(() => {
          setCopiedKey((prev) => (prev === key ? null : prev));
        }, resetDelayMs);
        return true;
      } catch {
        setCopiedKey(key);
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
        }
        timerRef.current = window.setTimeout(() => {
          setCopiedKey((prev) => (prev === key ? null : prev));
        }, resetDelayMs);
        return false;
      }
    },
    [resetDelayMs]
  );

  return { copiedKey, copyText };
}

/**
 * Consolidated keyboard Escape listener for accessible modal/drawer dialogs.
 */
export function useModalEscape(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}
