import type { GraphicsSettings } from '@/types/rally';
import { animationDuration } from './graphicsStyle';

export const springEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function useAnimDur(settings: GraphicsSettings) {
  return animationDuration(settings);
}

/** Cascading stagger variants for lists */
export const staggerContainer = (delay: number = 0.15) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: delay } },
});

/** Slide in from left with spring ease */
export const slideLeft = (dur: number) => ({
  hidden: { x: -80, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: dur, ease: springEase } },
});

/** Slide in from right */
export const slideRight = (dur: number) => ({
  hidden: { x: 80, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: dur, ease: springEase } },
});

/** Fade + slide up (for rows, items) */
export const fadeUp = (dur: number) => ({
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: dur, ease: springEase } },
});

/** Scale bounce entrance */
export const scaleIn = (dur: number) => ({
  hidden: { scale: 0.6, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: dur, ease: springEase } },
});
