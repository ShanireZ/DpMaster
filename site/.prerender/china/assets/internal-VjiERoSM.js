//#region src/algorithms/knapsack/internal.ts
function validateInput(items, capacity) {
	if (!Number.isInteger(capacity) || capacity < 0) throw new RangeError("capacity must be a non-negative integer");
	for (const item of items) {
		if (!Number.isInteger(item.w) || item.w <= 0) throw new RangeError("item weight must be a positive integer");
		if (!Number.isFinite(item.v)) throw new RangeError("item value must be finite");
	}
}
function executeZeroOneKnapsack(items, capacity, emit) {
	validateInput(items, capacity);
	const table = Array.from({ length: items.length + 1 }, () => Array(capacity + 1).fill(0));
	for (let itemIndex = 1; itemIndex <= items.length; itemIndex++) {
		const item = items[itemIndex - 1];
		for (let currentCapacity = 0; currentCapacity <= capacity; currentCapacity++) {
			const notTake = table[itemIndex - 1][currentCapacity];
			const take = currentCapacity >= item.w ? table[itemIndex - 1][currentCapacity - item.w] + item.v : null;
			const takeBetter = take !== null && take > notTake;
			const best = takeBetter ? take : notTake;
			table[itemIndex][currentCapacity] = best;
			emit({
				type: "cell",
				itemIndex,
				capacity: currentCapacity,
				item,
				notTake,
				take,
				best,
				takeBetter
			});
		}
	}
	const pick = Array(items.length).fill(false);
	let remaining = capacity;
	for (let itemIndex = items.length; itemIndex >= 1; itemIndex--) {
		if (table[itemIndex][remaining] === table[itemIndex - 1][remaining]) continue;
		pick[itemIndex - 1] = true;
		remaining -= items[itemIndex - 1].w;
	}
	return {
		value: table[items.length][capacity],
		pick,
		table
	};
}
function recordZeroOneKnapsack(items, capacity) {
	const events = [];
	return {
		result: executeZeroOneKnapsack(items, capacity, (event) => events.push(event)),
		events
	};
}
//#endregion
export { recordZeroOneKnapsack as n, executeZeroOneKnapsack as t };
