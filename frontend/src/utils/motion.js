/**
 * motion.js — Reusable animation hooks and helpers.
 * Driven by requestAnimationFrame for guaranteed browser paint execution.
 *
 * React StrictMode compatibility:
 *   In development/StrictMode, effects run twice (mount → cleanup → remount).
 *   Each hook uses an `isCancelled` ref to guard against stale RAF/timeout
 *   callbacks from the first (discarded) mount, ensuring animations only run
 *   once on the real, committed mount.
 */

import { useState, useEffect, useRef } from "react";

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * useAnimationProgress — smooth 0.0 → 1.0 progress animation.
 * Driven frame-by-frame via requestAnimationFrame so intermediate states
 * are explicitly rendered in DOM, preventing browser paint skip.
 *
 * StrictMode-safe: uses isCancelled ref to drop callbacks from the
 * first (discarded) effect invocation.
 */
export function useAnimationProgress(duration = 900, delay = 0, targetKey = 0) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // If reduced-motion, snap to end immediately without animation.
    if (prefersReducedMotion()) {
      setProgress(1);
      return;
    }

    // Reset to 0 at the start of every new animation run.
    setProgress(0);

    // isCancelled guards RAF/timeout callbacks from the discarded StrictMode
    // first-mount (whose cleanup fires before the real mount runs).
    let isCancelled = false;

    timerRef.current = setTimeout(() => {
      if (isCancelled) return;

      let startTime = null;

      function step(timestamp) {
        if (isCancelled) return;
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const rawProgress = Math.min(elapsed / duration, 1);
        // Cubic ease-out curve
        const eased = 1 - Math.pow(1 - rawProgress, 3);

        setProgress(eased);

        if (rawProgress < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      }

      rafRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      isCancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // Re-run when duration, delay, or the target value identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, delay, targetKey]);

  return progress;
}

/**
 * useAnimatedNumber — counts up from 0 → target using RAF animation progress.
 */
export function useAnimatedNumber(target, duration = 900, delay = 0) {
  const isNumeric = typeof target === "number" && !isNaN(target);
  const numericTarget = isNumeric ? target : 0;
  // Pass numericTarget (not a separate targetKey) so the animation re-runs
  // whenever the actual value changes.
  const progress = useAnimationProgress(duration, delay, numericTarget);

  if (!isNumeric) return target;
  if (prefersReducedMotion()) return numericTarget;

  return Math.round(progress * numericTarget);
}

/**
 * staggerDelay — returns inline style for CSS staggered animations
 */
export function staggerDelay(index, baseMs = 60) {
  return { animationDelay: `${index * baseMs}ms` };
}

/**
 * useChartAnimationKey — forces Recharts to mount with non-zero measured
 * dimensions, triggering draw animations reliably on mount / route changes.
 *
 * StrictMode-safe:
 *   The hasRun ref persists across the StrictMode double-invoke because refs
 *   are NOT reset between the two effect calls. The very first RAF callback
 *   sets hasRun = true; the cleanup from the first mount sets rafRef to null
 *   but does NOT set hasRun = false. When the real (second) mount effect
 *   fires, hasRun is already true — but we must STILL run the animation key
 *   on the second mount, so we reset hasRun on cleanup instead of on the
 *   flag check.
 *
 *   Simpler approach used here: a plain flag that only skips if we're in the
 *   *same* call (isCancelled), so the second mount always gets its own RAF.
 */
export function useChartAnimationKey() {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    let raf1, raf2;

    // Double-RAF ensures the browser has laid out the container and measured
    // its dimensions before Recharts renders, so ResponsiveContainer returns
    // a valid width/height and the draw animation fires correctly.
    raf1 = requestAnimationFrame(() => {
      if (isCancelled) return;
      raf2 = requestAnimationFrame(() => {
        if (isCancelled) return;
        setAnimKey((k) => k + 1);
      });
    });

    return () => {
      isCancelled = true;
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, []);

  return animKey;
}
