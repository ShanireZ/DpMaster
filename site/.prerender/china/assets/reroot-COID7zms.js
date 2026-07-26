import { t as ignoreEvents } from "./contracts-DWRIBQVD.js";
//#region src/algorithms/reroot/internal.ts
function edgeWeight(tree, node, parent) {
	return tree.adj[node].find(({ to }) => to === parent)?.w ?? 1;
}
function executeRerootDistance(tree, mode, emit) {
	const weights = mode === "nodeWeighted" ? tree.weight : Array(tree.n).fill(1);
	const totalW = weights.reduce((sum, value) => sum + value, 0);
	const sz = Array(tree.n).fill(0);
	const down = Array(tree.n).fill(0);
	for (let index = tree.order.length - 1; index >= 0; index--) {
		const node = tree.order[index];
		sz[node] = weights[node];
		for (const child of tree.children[node]) {
			const weight = edgeWeight(tree, child, node);
			sz[node] += sz[child];
			down[node] += down[child] + weight * sz[child];
		}
		emit({
			type: "subtree-settled",
			node,
			subtreeWeight: sz[node],
			down: down[node]
		});
	}
	const dist = Array(tree.n).fill(0);
	const coef = Array(tree.n).fill(0);
	dist[tree.root] = down[tree.root];
	for (const node of tree.order) for (const child of tree.children[node]) {
		coef[child] = totalW - 2 * sz[child];
		dist[child] = dist[node] + edgeWeight(tree, child, node) * coef[child];
		emit({
			type: "root-shifted",
			node: child,
			parent: node,
			coefficient: coef[child],
			distance: dist[child]
		});
	}
	let best = Number.POSITIVE_INFINITY;
	let bestNode = tree.root;
	for (let node = 0; node < tree.n; node++) if (dist[node] < best) {
		best = dist[node];
		bestNode = node;
	}
	return {
		n: tree.n,
		fixedRoot: tree.root,
		sz,
		down,
		dist,
		coef,
		best,
		bestNode,
		totalW
	};
}
function recordRerootDistance(tree, mode = "unweighted") {
	const events = [];
	return {
		result: executeRerootDistance(tree, mode, (event) => events.push(event)),
		events
	};
}
function executeRerootInOut(tree, emit) {
	const distance = executeRerootDistance(tree, "unweighted", ignoreEvents);
	const up = distance.dist.map((value, node) => value - distance.down[node]);
	for (const node of tree.order) emit({
		type: "settled",
		node,
		down: distance.down[node],
		up: up[node],
		distance: distance.dist[node]
	});
	return {
		n: tree.n,
		root: tree.root,
		sz: distance.sz,
		down: distance.down,
		up,
		dist: distance.dist,
		totalW: distance.totalW
	};
}
function recordRerootInOut(tree) {
	const events = [];
	return {
		result: executeRerootInOut(tree, (event) => events.push(event)),
		events
	};
}
function executeRerootEccentricity(tree, emit) {
	const down1 = Array(tree.n).fill(0);
	const down2 = Array(tree.n).fill(0);
	const bestChild = Array(tree.n).fill(-1);
	const up = Array(tree.n).fill(0);
	for (let index = tree.order.length - 1; index >= 0; index--) {
		const node = tree.order[index];
		for (const child of tree.children[node]) {
			const candidate = down1[child] + edgeWeight(tree, child, node);
			if (candidate > down1[node]) {
				down2[node] = down1[node];
				down1[node] = candidate;
				bestChild[node] = child;
			} else if (candidate > down2[node]) down2[node] = candidate;
		}
		emit({
			type: "down-settled",
			node,
			longest: down1[node],
			second: down2[node]
		});
	}
	for (const node of tree.order) for (const child of tree.children[node]) {
		const exceptChild = bestChild[node] === child ? down2[node] : down1[node];
		up[child] = Math.max(up[node], exceptChild) + edgeWeight(tree, child, node);
		emit({
			type: "up-settled",
			node: child,
			parent: node,
			up: up[child]
		});
	}
	const ecc = down1.map((value, node) => Math.max(value, up[node]));
	let center = 0;
	let radius = Number.POSITIVE_INFINITY;
	let diameter = 0;
	for (let node = 0; node < tree.n; node++) {
		if (ecc[node] < radius) {
			radius = ecc[node];
			center = node;
		}
		diameter = Math.max(diameter, ecc[node]);
	}
	return {
		n: tree.n,
		down1,
		down2,
		up,
		ecc,
		center,
		radius,
		diameter
	};
}
function recordRerootEccentricity(tree) {
	const events = [];
	return {
		result: executeRerootEccentricity(tree, (event) => events.push(event)),
		events
	};
}
//#endregion
//#region src/algorithms/reroot/index.ts
function buildRerootTree(n, edges, root = 0, weight) {
	if (!Number.isInteger(n) || n < 1) throw new RangeError("reroot tree size must be positive");
	if (!Number.isInteger(root) || root < 0 || root >= n) throw new RangeError("reroot root is out of range");
	if (weight !== void 0 && weight.length !== n) throw new RangeError("reroot node weights must match tree size");
	if (edges.length !== n - 1) throw new RangeError("reroot tree must contain exactly n - 1 edges");
	const adj = Array.from({ length: n }, () => []);
	for (const edge of edges) {
		if (edge.u < 0 || edge.u >= n || edge.v < 0 || edge.v >= n) throw new RangeError("reroot edge is out of range");
		const edgeWeight = edge.w ?? 1;
		if (!Number.isFinite(edgeWeight)) throw new RangeError("reroot edge weights must be finite");
		adj[edge.u].push({
			to: edge.v,
			w: edgeWeight
		});
		adj[edge.v].push({
			to: edge.u,
			w: edgeWeight
		});
	}
	const nodeWeights = weight === void 0 ? Array(n).fill(1) : [...weight];
	for (const value of nodeWeights) if (!Number.isFinite(value)) throw new RangeError("reroot node weights must be finite");
	const parent = Array(n).fill(-1);
	const depth = Array(n).fill(0);
	const children = Array.from({ length: n }, () => []);
	const order = [];
	const seen = Array(n).fill(false);
	const queue = [root];
	seen[root] = true;
	for (let cursor = 0; cursor < queue.length; cursor++) {
		const node = queue[cursor];
		order.push(node);
		for (const { to } of adj[node]) {
			if (seen[to]) continue;
			seen[to] = true;
			parent[to] = node;
			depth[to] = depth[node] + 1;
			children[node].push(to);
			queue.push(to);
		}
	}
	if (order.length !== n) throw new RangeError("reroot edges must form a connected tree");
	return {
		n,
		root,
		adj,
		parent,
		depth,
		children,
		order,
		weight: nodeWeights
	};
}
function layoutRerootTree(tree) {
	const x = Array(tree.n).fill(0);
	let leafCursor = 0;
	const leafCount = Math.max(1, tree.children.filter((children) => children.length === 0).length);
	for (let index = tree.order.length - 1; index >= 0; index--) {
		const node = tree.order[index];
		if (tree.children[node].length === 0) {
			x[node] = (leafCursor + .5) / leafCount;
			leafCursor++;
		} else x[node] = tree.children[node].reduce((sum, child) => sum + x[child], 0) / tree.children[node].length;
	}
	return {
		nodes: Array.from({ length: tree.n }, (_, node) => ({
			id: node,
			parent: tree.parent[node],
			depth: tree.depth[node],
			children: tree.children[node].slice(),
			x: x[node],
			y: tree.depth[node]
		})),
		maxDepth: Math.max(...tree.depth)
	};
}
function solveRerootDistance(tree, mode = "unweighted") {
	return executeRerootDistance(tree, mode, ignoreEvents);
}
function solveRerootDistanceBrute(tree, mode = "unweighted") {
	const weights = mode === "nodeWeighted" ? tree.weight : Array(tree.n).fill(1);
	const dist = Array(tree.n).fill(0);
	let ops = 0;
	for (let start = 0; start < tree.n; start++) {
		const values = Array(tree.n).fill(Number.POSITIVE_INFINITY);
		values[start] = 0;
		const queue = [start];
		for (let cursor = 0; cursor < queue.length; cursor++) {
			const node = queue[cursor];
			ops++;
			for (const { to, w } of tree.adj[node]) {
				if (values[to] !== Number.POSITIVE_INFINITY) continue;
				values[to] = values[node] + w;
				queue.push(to);
			}
		}
		dist[start] = values.reduce((sum, value, node) => sum + weights[node] * value, 0);
	}
	return {
		dist,
		ops
	};
}
//#endregion
export { recordRerootDistance as a, solveRerootDistanceBrute as i, layoutRerootTree as n, recordRerootEccentricity as o, solveRerootDistance as r, recordRerootInOut as s, buildRerootTree as t };
