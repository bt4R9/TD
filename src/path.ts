type X = number;
type Y = number;
type Cell = 0 | 1;
export type Grid = Cell[][];
type Point = [Y, X];
type Path = Point[];

export const grid: Grid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0]
];

const grid2: Grid = [
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

export const findPath = (grid: Grid, start: Point, end: Point): Path | null => {
  const H = grid.length;
  const W = grid[0].length;
  const [endY, endX] = end;
  const queue: Path[] = [[start]];
  const visited = new Map<string, boolean>();

  while (queue.length !== 0) {
    const path = queue.shift();

    if (path) {
      const [y, x] = path[path.length - 1];

      // check visited
      if (visited.has(`${y}-${x}`)) {
        continue;
      }

      if (y === endY && x === endX) {
        return path;
      }

      visited.set(`${y}-${x}`, true);

      if (grid[y][x] === 0) {
        if (x > 0) queue.push(path.concat([[y, x - 1]]));
        if (x < W - 1) queue.push(path.concat([[y, x + 1]]));
        if (y > 0) queue.push(path.concat([[y - 1, x]]));
        if (y < H - 1) queue.push(path.concat([[y + 1, x]]));
      }
    }
  }

  return null;
}

class Node {
  value: number;
  point: Point;
  closed: boolean;
  neighbors: Node[];
  type: 'ROAD' | 'BLOCK';

  constructor(value: number, point: Point) {
    this.value = value;
    this.closed = false;
    this.type = 'ROAD';
    this.point = point;
    this.neighbors = [];
  }

  close() {
    this.closed = true;
  }

  open() {
    this.closed = false;
  }


}

export class Graph {
  public graph: Node[][];
  public map: Map<string, Node>;

  constructor(grid: Grid) {
    const H = grid.length;
    const W = grid[0].length;
    const graph: Node[][] = [];
    const map = new Map<string, Node>();

    const getNode = (point: Point) => {
      const [y, x] = point;
      const coordinates = `${y}-${x}`;

      if (map.has(coordinates)) {
        return map.get(coordinates)!;
      } else {
        const node = new Node(grid[y][x], point);
        map.set(coordinates, node);
        return node;
      }
    }

    for (let y = 0; y < H; y++) {
      graph[y] = [];

      for (let x = 0; x < W; x++) {
        const value = grid[y][x];
        const node = getNode([y, x]);
        node.type = value === 0 ? 'ROAD' : 'BLOCK';

        if (x > 0)
          node.neighbors.push(getNode([y, x - 1]));
        if (x < W - 1)
          node.neighbors.push(getNode([y, x + 1]));
        if (y > 0)
          node.neighbors.push(getNode([y - 1, x]));
        if (y < H - 1)
          node.neighbors.push(getNode([y + 1, x]));

        graph[y][x] = node;
      }
    }

    this.graph = graph;
    this.map = map;
  }

  get height() {
    return this.graph.length;
  }

  get width() {
    return this.graph[0].length;
  }

  getNode(point: Point) {
    return this.map.get(this.pointToKey(point))!;
  }

  pointToKey(point: Point) {
    const [y, x] = point;
    return `${y}-${x}`;
  }

  openAllNodes() {
    this.map.forEach(node => {
      node.open();
    });
  }

  findPath(start: Point, end: Point): Node[] | null {
    const startNode = this.map.get(this.pointToKey(start));
    const endNode = this.map.get(this.pointToKey(end));

    if (!startNode || !endNode) {
      return null;
    }

    const queue: Node[][] = [[startNode]];

    while (queue.length !== 0) {
      const path = queue.shift();

      if (path) {
        const node = path[path.length - 1];
        node.close();

        if (node === endNode) {
          this.openAllNodes();
          return path;
        }

        for (let neighbor of node.neighbors) {
          if (neighbor.closed || neighbor.type === 'BLOCK') {
            continue;
          }

          queue.push(path.concat(neighbor));

          neighbor.open();
        }
      }
    }

    return null;
  }
}