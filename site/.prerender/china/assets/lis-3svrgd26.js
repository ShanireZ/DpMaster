import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
//#region src/algorithms/lis/internal.ts
function executeLis(values, emit) {
	for (const value of values) if (!Number.isFinite(value)) throw new RangeError("LIS values must be finite");
	const lengths = Array(values.length).fill(1);
	const previous = Array(values.length).fill(-1);
	for (let index = 0; index < values.length; index++) {
		emit({
			type: "initialized",
			index
		});
		for (let previousIndex = 0; previousIndex < index; previousIndex++) {
			const canExtend = values[previousIndex] < values[index];
			const candidate = lengths[previousIndex] + 1;
			const before = lengths[index];
			const chosen = canExtend && candidate > before;
			if (chosen) {
				lengths[index] = candidate;
				previous[index] = previousIndex;
			}
			emit({
				type: "compared",
				index,
				previousIndex,
				canExtend,
				candidate,
				before,
				after: lengths[index],
				chosen
			});
		}
		emit({
			type: "settled",
			index,
			predecessor: previous[index]
		});
	}
	let endIndex = null;
	for (let index = 0; index < values.length; index++) if (endIndex === null || lengths[index] > lengths[endIndex]) endIndex = index;
	const indices = [];
	for (let index = endIndex; index !== null && index >= 0; index = previous[index]) indices.push(index);
	indices.reverse();
	const pick = Array(values.length).fill(false);
	for (const index of indices) pick[index] = true;
	return {
		length: endIndex === null ? 0 : lengths[endIndex],
		pick,
		indices,
		lengths,
		previous,
		endIndex
	};
}
function recordLis(values) {
	const events = [];
	return {
		result: executeLis(values, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/algorithms/lis/index.ts
function solveLis(values) {
	return executeLis(values, ignoreEvents);
}
//#endregion
export { recordLis as n, solveLis as t };
