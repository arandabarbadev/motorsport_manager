import type { CareerState } from './career';
import { getSponsor } from './sponsors';

// ============================================================
// RACE FINANCE: income per race (prizes + sponsor) minus the
// running costs (driver salaries, staff salaries, facilities
// rent). Approved scale: ~20 M€ of costs at the start.
//   drivers: 4 M€ each (8 total) · rent: 6 M€ · staff: 2 M€/level
// ============================================================

export const DRIVER_SALARY = 4; // M€ per driver per race
export const RENT_PER_RACE = 6; // M€ facilities rent per race
export const STAFF_SALARY_PER_LEVEL = 2; // M€ per staff level per race

export interface RaceFinance {
  prize: number;
  sponsor: number;
  driversCost: number;
  staffCost: number;
  rentCost: number;
  net: number;
}

// Sponsor income with the commercial staff bonus (+5% per level).
export function sponsorIncome(career: CareerState): number {
  const sponsor = getSponsor(career.sponsorId);
  if (!sponsor) return 0;
  const bonus = 1 + 0.05 * (career.staff.commercial - 1);
  return Math.round(sponsor.payPerRace * bonus * 10) / 10;
}

export function computeRaceFinance(prize: number, career: CareerState): RaceFinance {
  const sponsor = sponsorIncome(career);
  const driversCost = 2 * DRIVER_SALARY;
  const staffCost =
    (career.staff.mechanics + career.staff.engineers + career.staff.commercial) *
    STAFF_SALARY_PER_LEVEL;
  const rentCost = RENT_PER_RACE;
  return {
    prize,
    sponsor,
    driversCost,
    staffCost,
    rentCost,
    net: prize + sponsor - driversCost - staffCost - rentCost,
  };
}
