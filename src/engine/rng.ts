import type { RandomSource } from "../domain/types.js";

/**
 * Seeded pseudo-random number generator using the Mulberry32 algorithm.
 *
 * Chosen for:
 * - simplicity (one 32-bit state word)
 * - zero dependencies
 * - strong enough for name generation purposes
 * - reproducibility across JS engines
 *
 * Same seed always produces the same sequence.
 */
export function createSeededRng(seed: number): RandomSource {
  // Force to unsigned 32-bit integer to normalise the starting state.
  let state = seed >>> 0;

  return {
    next(): number {
      // Mulberry32 step
      state = (state + 0x6d2b79f5) >>> 0;
      let z = Math.imul(state ^ (state >>> 15), 1 | state);
      z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    },

    nextInt(max: number): number {
      return Math.floor(this.next() * max);
    },
  };
}

/**
 * Returns a non-deterministic seed suitable for unseeded generation.
 * Uses `Math.random` combined with a millisecond timestamp for reasonable entropy.
 */
export function randomSeed(): number {
  return ((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0);
}
