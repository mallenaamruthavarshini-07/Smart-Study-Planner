import confetti from 'canvas-confetti';

export function triggerCelebration(intensity: 'subtle' | 'milestone' = 'subtle') {
  if (typeof window === 'undefined') return;

  if (intensity === 'subtle') {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#8066C5', '#687386', '#D98B70', '#C6A83D', '#10B981'],
      disableForReducedMotion: true,
    });
  } else {
    // Grand celebration for badges or high streak
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8066C5', '#D98B70', '#10B981', '#F59E0B'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8066C5', '#D98B70', '#10B981', '#F59E0B'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }
}
