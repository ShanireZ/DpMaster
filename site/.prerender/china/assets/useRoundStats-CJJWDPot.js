import { useCallback, useMemo, useState } from "react";
//#region src/components/games/runtime/audio.ts
var sharedContext = null;
function playGameTone({ frequency, duration = .08, type = "triangle" }, muted = false) {
	if (muted || typeof window === "undefined") return;
	const audioWindow = window;
	const AudioContextConstructor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
	if (!AudioContextConstructor) return;
	try {
		const context = sharedContext ??= new AudioContextConstructor();
		if (context.state === "suspended") context.resume().catch(() => void 0);
		const now = context.currentTime;
		const length = Math.max(.02, Math.min(duration, 1));
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		oscillator.type = type;
		oscillator.frequency.setValueAtTime(Math.max(40, frequency), now);
		gain.gain.setValueAtTime(.1, now);
		gain.gain.exponentialRampToValueAtTime(.001, now + length);
		oscillator.connect(gain);
		gain.connect(context.destination);
		oscillator.start(now);
		oscillator.stop(now + length);
	} catch {}
}
//#endregion
//#region src/components/games/runtime/round.ts
var INITIAL_ROUND_STATS = {
	played: 0,
	matched: 0,
	counted: false
};
function recordRound(state, matched) {
	if (state.counted) return state;
	return {
		played: state.played + 1,
		matched: state.matched + (matched ? 1 : 0),
		counted: true
	};
}
function startRound(state) {
	if (!state.counted) return state;
	return {
		...state,
		counted: false
	};
}
//#endregion
//#region src/components/games/runtime/useRoundStats.ts
function useRoundStats() {
	const [stats, setStats] = useState({ ...INITIAL_ROUND_STATS });
	const record = useCallback((matched) => {
		setStats((current) => recordRound(current, matched));
	}, []);
	const start = useCallback(() => {
		setStats((current) => startRound(current));
	}, []);
	return useMemo(() => ({
		stats,
		record,
		start
	}), [
		record,
		start,
		stats
	]);
}
//#endregion
export { playGameTone as n, useRoundStats as t };
