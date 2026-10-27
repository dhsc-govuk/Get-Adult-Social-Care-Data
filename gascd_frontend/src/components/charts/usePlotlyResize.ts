import { useEffect, useRef } from 'react';

// Plotly only resizes with the window, so also resize when a hidden chart is shown
export const usePlotlyResize = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(async ([entry]) => {
      const { width, height } = entry.contentRect;
      if (!graphRef.current || width === 0 || height === 0) return;
      const Plotly = await import('plotly.js/dist/plotly');
      Plotly.Plots.resize(graphRef.current);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const onGraphReady = (_figure: unknown, graphDiv: Readonly<HTMLElement>) => {
    graphRef.current = graphDiv as HTMLElement;
  };

  return { containerRef, onGraphReady };
};
