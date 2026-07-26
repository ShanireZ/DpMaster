import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
//#region src/algorithms/stone-merge/internal.ts
function executeStoneMerge(values, objective, emit) {
	for (const value of values) if (!Number.isFinite(value)) throw new RangeError("stone values must be finite");
	const size = values.length;
	const prefix = Array(size + 1).fill(0);
	for (let index = 0; index < size; index++) prefix[index + 1] = prefix[index] + values[index];
	const rangeSum = (left, right) => prefix[right + 1] - prefix[left];
	const costs = Array.from({ length: size }, () => Array(size).fill(null));
	const splits = Array.from({ length: size }, () => Array(size).fill(-1));
	for (let index = 0; index < size; index++) costs[index][index] = 0;
	for (let length = 2; length <= size; length++) for (let left = 0; left + length - 1 < size; left++) {
		const right = left + length - 1;
		const candidates = [];
		let bestBase = objective === "min" ? Infinity : -Infinity;
		let bestSplit = left;
		for (let split = left; split < right; split++) {
			const candidate = costs[left][split] + costs[split + 1][right];
			candidates.push(candidate);
			if (objective === "min" ? candidate < bestBase : candidate > bestBase) {
				bestBase = candidate;
				bestSplit = split;
			}
		}
		const sum = rangeSum(left, right);
		const cost = bestBase + sum;
		costs[left][right] = cost;
		splits[left][right] = bestSplit;
		emit({
			type: "interval",
			length,
			left,
			right,
			sum,
			candidates,
			bestBase,
			bestSplit,
			cost
		});
	}
	return {
		cost: size < 2 ? 0 : costs[0][size - 1],
		objective,
		costs,
		splits
	};
}
function recordStoneMerge(values, objective = "min") {
	const events = [];
	return {
		result: executeStoneMerge(values, objective, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/algorithms/stone-merge/index.ts
function solveStoneMerge(values, objective = "min") {
	return executeStoneMerge(values, objective, ignoreEvents);
}
//#endregion
export { recordStoneMerge as n, solveStoneMerge as t };
