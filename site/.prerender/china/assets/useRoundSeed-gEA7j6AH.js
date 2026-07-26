import { useCallback, useMemo, useState } from "react";
//#region src/components/games/runtime/random.ts
var UINT32_RANGE = 4294967296;
var browserRandom = () => {
	if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
		const value = /* @__PURE__ */ new Uint32Array(1);
		globalThis.crypto.getRandomValues(value);
		return value[0] / UINT32_RANGE;
	}
	return Math.random();
};
function createRandomSeed(random) {
	return randomInt(random, 0, UINT32_RANGE - 1);
}
/** Mulberry32：只用于可复现的教学局面，不用于密码学。 */
function createSeededRandom(seed) {
	let state = Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 0;
	return () => {
		state = state + 1831565813 >>> 0;
		let value = state;
		value = Math.imul(value ^ value >>> 15, value | 1);
		value ^= value + Math.imul(value ^ value >>> 7, value | 61);
		return ((value ^ value >>> 14) >>> 0) / UINT32_RANGE;
	};
}
function randomInt(random, min, maxInclusive) {
	if (!Number.isInteger(min) || !Number.isInteger(maxInclusive) || min > maxInclusive) throw new RangeError("randomInt bounds must be ordered integers");
	const value = random();
	if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError("RandomSource must return a value inside [0, 1)");
	return min + Math.floor(value * (maxInclusive - min + 1));
}
//#endregion
//#region src/components/games/runtime/useRoundSeed.ts
function normalizeSeed(seed) {
	return Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 0;
}
function useRoundSeed() {
	const [round, setRound] = useState(() => ({
		seed: createRandomSeed(browserRandom),
		revision: 0
	}));
	const next = useCallback(() => {
		setRound((current) => ({
			seed: createRandomSeed(browserRandom),
			revision: current.revision + 1
		}));
	}, []);
	const replay = useCallback((seed) => {
		setRound((current) => ({
			seed: normalizeSeed(seed),
			revision: current.revision + 1
		}));
	}, []);
	return useMemo(() => ({
		seed: round.seed,
		next,
		replay
	}), [
		next,
		replay,
		round
	]);
}
//#endregion
export { createSeededRandom as n, randomInt as r, useRoundSeed as t };
