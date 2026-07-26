import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/dp-engine/playback/PlaybackControls.tsx
var SPEEDS$1 = [
	.5,
	1,
	2
];
function isEditableTarget(target) {
	if (!(target instanceof HTMLElement)) return false;
	return target.isContentEditable || [
		"INPUT",
		"TEXTAREA",
		"SELECT"
	].includes(target.tagName);
}
function PlaybackControls({ player, variant = "full", label = "逐帧播放控制", className = "" }) {
	const current = player.count === 0 ? 0 : player.index + 1;
	const status = `${player.playing ? "播放中" : "已暂停"}，第 ${current} 步，共 ${player.count} 步，${player.speed} 倍速`;
	const onKeyDown = (event) => {
		if (isEditableTarget(event.target)) return;
		if (event.target instanceof HTMLButtonElement && (event.key === " " || event.key === "Enter")) return;
		if (event.key === "Home") {
			event.preventDefault();
			player.reset();
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			player.previous();
		} else if (event.key === " ") {
			event.preventDefault();
			player.toggle();
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			player.next();
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: `playback playback--${variant}${className ? ` ${className}` : ""}`,
		role: "group",
		"aria-label": label,
		"aria-keyshortcuts": "Home ArrowLeft Space ArrowRight",
		tabIndex: 0,
		onKeyDown,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "playback__transport",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: player.reset,
						disabled: player.index === 0 && !player.playing,
						"aria-label": "重置",
						title: "重置（Home）",
						children: /* @__PURE__ */ jsx(RotateCcw, { size: variant === "compact" ? 16 : 18 })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: player.previous,
						disabled: !player.canPrevious,
						"aria-label": "上一步",
						title: "上一步（←）",
						children: /* @__PURE__ */ jsx(ChevronLeft, { size: variant === "compact" ? 18 : 20 })
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "playback__primary",
						onClick: player.toggle,
						disabled: !player.canPlay,
						"aria-label": player.playing ? "暂停" : "播放",
						title: `${player.playing ? "暂停" : "播放"}（空格）`,
						children: [player.playing ? /* @__PURE__ */ jsx(Pause, { size: variant === "compact" ? 17 : 20 }) : /* @__PURE__ */ jsx(Play, { size: variant === "compact" ? 17 : 20 }), variant === "full" && /* @__PURE__ */ jsx("span", { children: player.playing ? "暂停" : "播放" })]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: player.next,
						disabled: !player.canNext,
						"aria-label": "下一步",
						title: "下一步（→）",
						children: /* @__PURE__ */ jsx(ChevronRight, { size: variant === "compact" ? 18 : 20 })
					})
				]
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "playback__progress",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "playback__sr",
						children: "进度"
					}),
					/* @__PURE__ */ jsx("input", {
						type: "range",
						min: 0,
						max: Math.max(0, player.count - 1),
						value: player.index,
						disabled: player.count <= 1,
						onChange: (event) => {
							player.pause();
							player.setIndex(Number(event.target.value));
						},
						"aria-label": "进度",
						"aria-valuetext": `第 ${current} 步，共 ${player.count} 步`
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "playback__count",
						"aria-hidden": "true",
						children: [
							current,
							"/",
							player.count
						]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "playback__speed",
				role: "group",
				"aria-label": "速度",
				children: SPEEDS$1.map((speed) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: player.speed === speed ? "is-active" : "",
					"aria-pressed": player.speed === speed,
					"aria-label": `速度 ${speed} 倍`,
					onClick: () => player.setSpeed(speed),
					children: [speed, "×"]
				}, speed))
			}),
			/* @__PURE__ */ jsx("span", {
				className: "playback__sr",
				"aria-live": "polite",
				children: status
			})
		]
	});
}
//#endregion
//#region src/components/dp-engine/playback/state.ts
var SPEEDS = [
	.5,
	1,
	2
];
function frameCount(count) {
	return Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
}
function clampPlaybackIndex(index, count) {
	const last = Math.max(0, frameCount(count) - 1);
	return Math.max(0, Math.min(last, Number.isFinite(index) ? Math.trunc(index) : 0));
}
function nextPlaybackIndex(index, count) {
	return clampPlaybackIndex(index + 1, count);
}
function previousPlaybackIndex(index, count) {
	return clampPlaybackIndex(index - 1, count);
}
function normalizePlaybackSpeed(value) {
	return SPEEDS.includes(value) ? value : 1;
}
//#endregion
//#region src/components/dp-engine/playback/useStepPlayer.ts
/** 逐帧教学播放：统一单步、进度、调速、结尾重播与输入变更处理。 */
function useStepPlayer(count) {
	const safeCount = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
	const hasFrames = count > 0;
	const [index, setIndexRaw] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [speed, setSpeedRaw] = useState(1);
	const setIndex = useCallback((nextIndex) => setIndexRaw(clampPlaybackIndex(nextIndex, safeCount)), [safeCount]);
	const pause = useCallback(() => setPlaying(false), []);
	const previous = useCallback(() => {
		setPlaying(false);
		setIndexRaw((current) => previousPlaybackIndex(current, safeCount));
	}, [safeCount]);
	const next = useCallback(() => {
		setPlaying(false);
		setIndexRaw((current) => nextPlaybackIndex(current, safeCount));
	}, [safeCount]);
	const reset = useCallback(() => {
		setPlaying(false);
		setIndexRaw(0);
	}, []);
	const play = useCallback(() => {
		if (safeCount <= 1) {
			setPlaying(false);
			return;
		}
		setIndexRaw((current) => current >= safeCount - 1 ? 0 : current);
		setPlaying(true);
	}, [safeCount]);
	const toggle = useCallback(() => {
		if (playing) pause();
		else play();
	}, [
		pause,
		play,
		playing
	]);
	const setSpeed = useCallback((nextSpeed) => {
		setSpeedRaw(normalizePlaybackSpeed(nextSpeed));
	}, []);
	useEffect(() => {
		if (!playing) return;
		if (index >= safeCount - 1 || safeCount <= 1) {
			setPlaying(false);
			return;
		}
		const timer = window.setTimeout(() => {
			setIndexRaw((current) => nextPlaybackIndex(current, safeCount));
		}, 640 / speed);
		return () => window.clearTimeout(timer);
	}, [
		index,
		playing,
		safeCount,
		speed
	]);
	useEffect(() => {
		setPlaying(false);
		setIndexRaw((current) => clampPlaybackIndex(current, safeCount));
	}, [safeCount]);
	return useMemo(() => ({
		index,
		count: safeCount,
		playing,
		speed,
		canPrevious: hasFrames && index > 0,
		canNext: hasFrames && index < safeCount - 1,
		canPlay: safeCount > 1,
		setIndex,
		previous,
		next,
		reset,
		play,
		pause,
		toggle,
		setSpeed
	}), [
		hasFrames,
		index,
		next,
		pause,
		play,
		playing,
		previous,
		reset,
		safeCount,
		setIndex,
		setSpeed,
		speed,
		toggle
	]);
}
//#endregion
export { PlaybackControls as n, useStepPlayer as t };
