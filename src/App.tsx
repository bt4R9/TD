import React from 'react';
import './App.css';
import { Graph, Grid } from './path';
import { generate } from './generator';

const wait = (delay: number) => new Promise(res => setTimeout(res, delay));
const blockSize = 10;
type FLAG = 'START' | 'END' | 'RESET';

const App: React.FC<any> = () => {
  const ref = React.createRef<HTMLCanvasElement>();
  const gridRef = React.useRef<Graph>();
  const [size, setSize] = React.useState(70);
  const [dist, setDist] = React.useState<{ start: [number, number], end: [number, number] }>({
    start: [-1, -1],
    end: [-1, -1]
  });
  const [flag, setFlag] = React.useState<FLAG>('START');

  React.useEffect(() => {
    if (!size) {
      return;
    }

    const { grid } = generate(size);

    if (!grid) {
      return;
    }

    const gridGraph = new Graph(grid as Grid);
    gridRef.current = gridGraph;
    const canvas = ref.current;

    if (canvas) {
      const ctx = canvas.getContext('2d')!;

      for (let y = 0; y < gridGraph.height; y++) {
        for (let x = 0; x < gridGraph.width; x++) {
          const node = gridGraph.getNode([y, x]);

          if (node.type === 'ROAD') {
            ctx.fillStyle = 'white';
          } else {
            ctx.fillStyle = 'black';
          }

          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
    }

  }, [size]);

  React.useEffect(() => {
    const graph = gridRef.current;
    const canvas = ref.current;

    if (graph && canvas) {
      if (dist.start[0] > -1 && dist.end[0] > -1) {
        const ctx = canvas.getContext('2d')!;
        const path = graph.findPath(dist.start, dist.end);
        if (path && ctx) {
          (async () => {
            for (let node of path) {
              await wait(20);
              requestAnimationFrame(() => {
                const [y, x] = node.point;
                ctx.fillStyle = 'green';
                ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
              });
            }
          })();
        }

        if (!path) {
          ctx.fillStyle = 'red';
          ctx.fillRect(dist.start[1] * blockSize, dist.start[0] * blockSize, blockSize, blockSize);
          ctx.fillRect(dist.end[1] * blockSize, dist.end[0] * blockSize, blockSize, blockSize);
        }
      }
    }
  }, [dist.start[0], dist.start[1], dist.end[0], dist.end[1]])

  function onClick(e: React.MouseEvent) {
    const canvas = ref.current;
    const graph = gridRef.current;

    if (canvas && graph) {
      const ctx = canvas.getContext('2d');

      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const y = Math.floor(Math.round(e.clientY - rect.top) / blockSize);
        const x = Math.floor(Math.round(e.clientX - rect.left) / blockSize);

        ctx.fillStyle = 'green';
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);

        if (flag === 'START') {
          setDist({
            start: [y, x],
            end: dist.end
          });
          setFlag('END');
        }

        if (flag === 'END') {
          setDist({
            start: dist.start,
            end: [y, x]
          });
          setFlag('RESET');
        }

        if (flag === 'RESET') {
          for (let y = 0; y < graph.height; y++) {
            for (let x = 0; x < graph.width; x++) {
              const node = graph.getNode([y, x]);

              if (node.type === 'ROAD') {
                ctx.fillStyle = 'white';
              } else {
                ctx.fillStyle = 'black';
              }

              ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
          }

          setDist({
            start: [-1, -1],
            end: [-1, -1]
          });
          setFlag('START');
        }
      }
    }
  }

  return (
    <div className="App">
      <label>size<input type="number" value={size} onChange={(e) => setSize(Number(e.target.value))} /></label>
      <div>
        <canvas onClick={onClick} ref={ref} width={size * blockSize} height={size * blockSize} />
      </div>
    </div>
  );
}

export default App;
