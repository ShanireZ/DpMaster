import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
//#region src/algorithms/tree-dp/internal.ts
var INF = Number.POSITIVE_INFINITY;
function executeTreeIndependentSet(tree, emit) {
	const dp0 = Array(tree.n).fill(0);
	const dp1 = Array(tree.n).fill(0);
	const settled = [];
	for (const node of tree.postorder) {
		dp1[node] = tree.weight[node];
		for (const child of tree.children[node]) {
			dp0[node] += Math.max(dp0[child], dp1[child]);
			dp1[node] += dp0[child];
		}
		settled.push(node);
		emit({
			type: "settled",
			node,
			dp0: dp0[node],
			dp1: dp1[node],
			settled: settled.slice(),
			leaf: tree.children[node].length === 0
		});
	}
	const chosen = /* @__PURE__ */ new Set();
	const stack = [[tree.root, false]];
	while (stack.length > 0) {
		const [node, parentChosen] = stack.pop();
		const take = !parentChosen && dp1[node] >= dp0[node];
		if (take) chosen.add(node);
		for (const child of tree.children[node]) stack.push([child, take]);
	}
	return {
		dp0,
		dp1,
		ans: Math.max(dp0[tree.root], dp1[tree.root]),
		chosen
	};
}
function recordTreeIndependentSet(tree) {
	const events = [];
	return {
		result: executeTreeIndependentSet(tree, (event) => events.push(event)),
		events
	};
}
function executeTreeDominatingSet(tree, emit) {
	const d0 = Array(tree.n).fill(0);
	const d1 = Array(tree.n).fill(0);
	const d2 = Array(tree.n).fill(0);
	const settled = [];
	for (const node of tree.postorder) {
		const children = tree.children[node];
		if (children.length === 0) {
			d0[node] = tree.weight[node];
			d1[node] = INF;
		} else {
			d0[node] = tree.weight[node];
			d2[node] = 0;
			let base = 0;
			let extra = INF;
			for (const child of children) {
				d0[node] += Math.min(d0[child], d1[child], d2[child]);
				d2[node] += Math.min(d0[child], d1[child]);
				base += Math.min(d0[child], d1[child]);
				extra = Math.min(extra, d0[child] - Math.min(d0[child], d1[child]));
			}
			d1[node] = base + extra;
		}
		settled.push(node);
		emit({
			type: "settled",
			node,
			d0: d0[node],
			d1: d1[node],
			d2: d2[node],
			settled: settled.slice(),
			leaf: children.length === 0
		});
	}
	const guards = /* @__PURE__ */ new Set();
	const pick = (node, requirement) => {
		const children = tree.children[node];
		let state;
		if (requirement === "guard") state = 0;
		else if (requirement === "covered") state = d0[node] <= d1[node] ? 0 : 1;
		else {
			const minimum = Math.min(d0[node], d1[node], d2[node]);
			state = minimum === d0[node] ? 0 : minimum === d1[node] ? 1 : 2;
		}
		if (state === 0) {
			guards.add(node);
			for (const child of children) pick(child, "free");
		} else if (state === 1) {
			let bestChild = -1;
			let bestExtra = INF;
			for (const child of children) {
				const extra = d0[child] - Math.min(d0[child], d1[child]);
				if (extra < bestExtra) {
					bestExtra = extra;
					bestChild = child;
				}
			}
			for (const child of children) pick(child, child === bestChild ? "guard" : "covered");
		} else for (const child of children) pick(child, "covered");
	};
	pick(tree.root, "covered");
	return {
		d0,
		d1,
		d2,
		ans: Math.min(d0[tree.root], d1[tree.root]),
		guards
	};
}
function recordTreeDominatingSet(tree) {
	const events = [];
	return {
		result: executeTreeDominatingSet(tree, (event) => events.push(event)),
		events
	};
}
function executeTreeMaxSubtreeChain(tree, emit) {
	const down = Array(tree.n).fill(0);
	const through = Array(tree.n).fill(0);
	const settled = [];
	for (const node of tree.postorder) {
		let best1 = 0;
		let best2 = 0;
		for (const child of tree.children[node]) {
			const gain = Math.max(0, down[child]);
			if (gain > best1) {
				best2 = best1;
				best1 = gain;
			} else if (gain > best2) best2 = gain;
		}
		down[node] = tree.weight[node] + best1;
		through[node] = tree.weight[node] + best1 + best2;
		settled.push(node);
		emit({
			type: "settled",
			node,
			down: down[node],
			best1,
			best2,
			through: through[node],
			settled: settled.slice()
		});
	}
	let ans = Number.NEGATIVE_INFINITY;
	let diameter = Number.NEGATIVE_INFINITY;
	let argMax = tree.root;
	let argThrough = tree.root;
	for (let node = 0; node < tree.n; node++) {
		if (down[node] > ans) {
			ans = down[node];
			argMax = node;
		}
		if (through[node] > diameter) {
			diameter = through[node];
			argThrough = node;
		}
	}
	return {
		down,
		through,
		ans,
		diameter,
		argMax,
		argThrough
	};
}
function recordTreeMaxSubtreeChain(tree) {
	const events = [];
	return {
		result: executeTreeMaxSubtreeChain(tree, (event) => events.push(event)),
		events
	};
}
function executeTreeKnapsack(tree, parentEdge, edgeLimit, emit) {
	if (parentEdge.length !== tree.n) throw new RangeError("tree edge weights must match tree size");
	if (!Number.isInteger(edgeLimit) || edgeLimit < 0) throw new RangeError("tree edge limit must be non-negative");
	if (edgeLimit > tree.n - 1) throw new RangeError("tree edge limit cannot exceed the tree edge count");
	for (const value of parentEdge) {
		if (!Number.isFinite(value)) throw new RangeError("tree edge weights must be finite");
		if (value < 0) throw new RangeError("tree edge weights must be non-negative");
	}
	const sizeEdges = Array(tree.n).fill(0);
	const dp = Array.from({ length: tree.n }, () => Array(edgeLimit + 1).fill(0));
	for (const node of tree.postorder) {
		let capacity = 0;
		for (const child of tree.children[node]) {
			capacity += sizeEdges[child] + 1;
			for (let used = Math.min(capacity, edgeLimit); used >= 1; used--) for (let childEdges = 1; childEdges <= sizeEdges[child] + 1 && childEdges <= used; childEdges++) {
				const candidate = dp[node][used - childEdges] + parentEdge[child] + dp[child][childEdges - 1];
				dp[node][used] = Math.max(dp[node][used], candidate);
			}
		}
		sizeEdges[node] = capacity;
		emit({
			type: "settled",
			node,
			sizeEdges: capacity,
			values: dp[node].slice()
		});
	}
	return {
		dp,
		sizeEdges,
		ans: dp[tree.root][Math.min(edgeLimit, sizeEdges[tree.root])],
		order: tree.postorder.slice()
	};
}
function recordTreeKnapsack(tree, parentEdge, edgeLimit) {
	const events = [];
	return {
		result: executeTreeKnapsack(tree, parentEdge, edgeLimit, (event) => events.push(event)),
		events
	};
}
function executeTreeJointWeight(tree, emit) {
	for (const value of tree.weight) {
		if (!Number.isFinite(value)) throw new RangeError("tree joint weights must be finite");
		if (value < 0) throw new RangeError("tree joint weights must be non-negative");
	}
	const neighbors = Array.from({ length: tree.n }, () => []);
	for (let node = 0; node < tree.n; node++) {
		if (tree.parent[node] >= 0) neighbors[node].push(tree.parent[node]);
		neighbors[node].push(...tree.children[node]);
	}
	const midSum = Array(tree.n).fill(0);
	const midMax = Array(tree.n).fill(0);
	let totalSum = 0;
	let globalMax = 0;
	for (let node = 0; node < tree.n; node++) {
		let sum = 0;
		let squareSum = 0;
		let greatest = 0;
		let second = 0;
		for (const neighbor of neighbors[node]) {
			const value = tree.weight[neighbor];
			sum += value;
			squareSum += value * value;
			if (value > greatest) {
				second = greatest;
				greatest = value;
			} else if (value > second) second = value;
		}
		if (neighbors[node].length >= 2) {
			midSum[node] = sum * sum - squareSum;
			midMax[node] = greatest * second;
		}
		totalSum += midSum[node];
		globalMax = Math.max(globalMax, midMax[node]);
		emit({
			type: "settled",
			node,
			neighbors: neighbors[node].slice(),
			sum: midSum[node],
			maximum: midMax[node]
		});
	}
	return {
		neighbors,
		midSum,
		midMax,
		totalSum,
		globalMax
	};
}
function recordTreeJointWeight(tree) {
	const events = [];
	return {
		result: executeTreeJointWeight(tree, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/algorithms/tree-dp/index.ts
function buildRootedTree(parent, weight) {
	if (parent.length === 0 || parent.length !== weight.length) throw new RangeError("tree parent and weight arrays must be non-empty and equally sized");
	const n = parent.length;
	const children = Array.from({ length: n }, () => []);
	let root = -1;
	for (let node = 0; node < n; node++) {
		if (!Number.isFinite(weight[node])) throw new RangeError("tree weights must be finite");
		if (parent[node] < 0) {
			if (root !== -1) throw new RangeError("tree must have exactly one root");
			root = node;
		} else {
			if (parent[node] >= n || parent[node] === node) throw new RangeError("tree parent is out of range");
			children[parent[node]].push(node);
		}
	}
	if (root === -1) throw new RangeError("tree must have a root");
	const postorder = [];
	const stack = [[root, false]];
	const seen = /* @__PURE__ */ new Set();
	while (stack.length > 0) {
		const [node, visited] = stack.pop();
		if (visited) {
			postorder.push(node);
			continue;
		}
		if (seen.has(node)) throw new RangeError("tree parent array must be acyclic");
		seen.add(node);
		stack.push([node, true]);
		for (let index = children[node].length - 1; index >= 0; index--) stack.push([children[node][index], false]);
	}
	if (seen.size !== n) throw new RangeError("tree parent array must be connected");
	return {
		n,
		root,
		parent: [...parent],
		children,
		postorder,
		weight: [...weight]
	};
}
function layoutRootedTree(tree) {
	const depth = Array(tree.n).fill(0);
	const x = Array(tree.n).fill(0);
	let leafCursor = 0;
	const leafCount = tree.children.filter((children) => children.length === 0).length;
	const span = Math.max(1, leafCount - 1);
	const place = (node, level) => {
		depth[node] = level;
		if (tree.children[node].length === 0) {
			x[node] = leafCount === 1 ? .5 : leafCursor / span;
			leafCursor++;
			return x[node];
		}
		x[node] = tree.children[node].reduce((sum, child) => sum + place(child, level + 1), 0) / tree.children[node].length;
		return x[node];
	};
	place(tree.root, 0);
	const nodes = Array.from({ length: tree.n }, (_, id) => ({
		id,
		x: x[id],
		depth: depth[id]
	}));
	const byId = new Map(nodes.map((node) => [node.id, node]));
	const edges = [];
	for (let node = 0; node < tree.n; node++) for (const child of tree.children[node]) edges.push({
		a: node,
		b: child
	});
	return {
		nodes,
		byId,
		maxDepth: Math.max(...depth),
		edges
	};
}
function solveTreeIndependentSet(tree) {
	return executeTreeIndependentSet(tree, ignoreEvents);
}
//#endregion
export { recordTreeIndependentSet as a, recordTreeMaxSubtreeChain as c, recordTreeDominatingSet as i, layoutRootedTree as n, recordTreeJointWeight as o, solveTreeIndependentSet as r, recordTreeKnapsack as s, buildRootedTree as t };
