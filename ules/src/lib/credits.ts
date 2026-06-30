import type { Entry } from '../types';

export function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

export function calcCredits(e: Pick<Entry, 'm1' | 'm2' | 'm3' | 'rate' | 'units' | 'date'>): number {
  const mult = Math.min(e.m1 * e.m2 * e.m3, 1.5);
  const stale = daysSince(e.date) > 14 ? 0.5 : 1;
  return e.rate * e.units * mult * stale;
}

export function fmt(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

export function isStale(date: string): boolean {
  return daysSince(date) > 14;
}
