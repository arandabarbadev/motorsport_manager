// ============================================================
// PRIZE TABLE (Phase 4): prize money in M€ by finishing position,
// paid for EACH of the player's two cars. Starting numbers from
// the design doc (1st=100, 2nd=80, 3rd=65... decreasing) — they
// are meant to be re-tuned by playtesting.
// ============================================================

export const PRIZE_TABLE: readonly number[] = [
  100, 80, 65, 52, 45, 38, 32, 27, 23, 19,
  15, 12, 10, 8, 6, 5, 4, 3, 2, 1,
];

export function prizeForPosition(position: number): number {
  const index = Math.min(Math.max(position, 1), PRIZE_TABLE.length) - 1;
  return PRIZE_TABLE[index];
}
