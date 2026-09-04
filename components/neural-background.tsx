"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };
type Branch = { points: Point[]; alpha: number; width: number; node: boolean };
type Signal = { branch: number; progress: number; speed: number; life: number };

export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    if (!canvas || !hero) return;
    const canvasElement = canvas;
    const heroElement = hero;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;

    let frame = 0;
    let lastTime = 0;
    let width = 0;
    let height = 0;
    let hidden = document.hidden;
    let branches: Branch[] = [];
    let signals: Signal[] = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function addCluster(origin: Point, direction: number, count: number) {
      for (let branchIndex = 0; branchIndex < count; branchIndex++) {
        const points: Point[] = [{ ...origin }];
        const segments = 3 + Math.floor(Math.random() * 3);
        const verticalBias = (Math.random() - 0.5) * 28;
        for (let segment = 1; segment <= segments; segment++) {
          const previous = points[segment - 1];
          points.push({
            x: previous.x + direction * (34 + Math.random() * 54),
            y: previous.y + verticalBias + (Math.random() - 0.5) * 42,
          });
        }
        branches.push({
          points,
          alpha: branchIndex === 0 ? 0.14 : 0.065 + Math.random() * 0.045,
          width: branchIndex === 0 ? 1.15 : 0.7,
          node: branchIndex % 2 === 0,
        });

        if (branchIndex < Math.ceil(count / 2)) {
          const fork = points[Math.min(2, points.length - 1)];
          branches.push({
            points: [fork, {
              x: fork.x + direction * (38 + Math.random() * 44),
              y: fork.y + (Math.random() > 0.5 ? 1 : -1) * (42 + Math.random() * 42),
            }],
            alpha: 0.055,
            width: 0.65,
            node: false,
          });
        }
      }
    }

    function createScene() {
      branches = [];
      signals = [];
      const compact = width < 760;
      addCluster({ x: width * 0.015, y: height * 0.47 }, 1, compact ? 3 : 5);
      addCluster({ x: width * 0.985, y: height * 0.55 }, -1, compact ? 3 : 5);
      addCluster({ x: width * 0.14, y: height * 0.9 }, 1, compact ? 1 : 3);
      addCluster({ x: width * 0.87, y: height * 0.88 }, -1, compact ? 1 : 3);
      if (!compact) addCluster({ x: width * 0.79, y: height * 0.3 }, 1, 2);
    }

    function trace(branch: Branch, end = 1) {
      const limit = Math.max(1, Math.ceil((branch.points.length - 1) * end));
      ctx.beginPath();
      ctx.moveTo(branch.points[0].x, branch.points[0].y);
      for (let index = 1; index <= limit && index < branch.points.length; index++) {
        const previous = branch.points[index - 1];
        const point = branch.points[index];
        const middleX = (previous.x + point.x) / 2;
        ctx.bezierCurveTo(middleX, previous.y, middleX, point.y, point.x, point.y);
      }
    }

    function pointAt(branch: Branch, progress: number) {
      const scaled = Math.min(0.999, progress) * (branch.points.length - 1);
      const index = Math.floor(scaled);
      const local = scaled - index;
      const start = branch.points[index];
      const end = branch.points[index + 1];
      return { x: start.x + (end.x - start.x) * local, y: start.y + (end.y - start.y) * local };
    }

    function draw(delta: number, time: number) {
      ctx.clearRect(0, 0, width, height);
      branches.forEach((branch, index) => {
        trace(branch);
        ctx.lineWidth = branch.width;
        ctx.strokeStyle = `rgba(62,207,142,${branch.alpha})`;
        ctx.stroke();
        if (branch.node) {
          const node = branch.points[Math.min(2, branch.points.length - 1)];
          const pulse = reducedMotion ? 0 : Math.sin(time / 1800 + index) * 0.35;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2.1 + pulse, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(62,207,142,.24)";
          ctx.fill();
        }
      });

      signals.forEach((signal) => {
        signal.progress += signal.speed * delta;
        signal.life -= delta;
        const branch = branches[signal.branch];
        if (!branch) return;
        const point = pointAt(branch, signal.progress);
        const fade = Math.min(1, signal.life / 700, (1 - signal.progress) * 5);
        trace(branch, signal.progress);
        ctx.save();
        ctx.strokeStyle = `rgba(74,222,157,${0.18 * fade})`;
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(62,207,142,.2)";
        ctx.stroke();
        const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 13);
        glow.addColorStop(0, `rgba(113,240,180,${0.72 * fade})`);
        glow.addColorStop(0.25, `rgba(74,222,157,${0.34 * fade})`);
        glow.addColorStop(1, "rgba(62,207,142,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      signals = signals.filter((signal) => signal.progress < 1 && signal.life > 0);
    }

    function animate(time: number) {
      const delta = Math.min(32, time - lastTime || 16);
      lastTime = time;
      if (!hidden) {
        const maximum = width < 760 ? 1 : 2;
        if (signals.length < maximum && Math.random() < delta / 7200) {
          signals.push({ branch: Math.floor(Math.random() * branches.length), progress: 0, speed: 0.0001 + Math.random() * 0.000055, life: 9000 });
        }
        draw(delta, time);
      }
      frame = requestAnimationFrame(animate);
    }

    function resize() {
      const rect = heroElement.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvasElement.width = Math.round(width * ratio);
      canvasElement.height = Math.round(height * ratio);
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      createScene();
      draw(0, 0);
    }

    const visibility = () => { hidden = document.hidden; lastTime = performance.now(); };
    const observer = new ResizeObserver(resize);
    observer.observe(heroElement);
    document.addEventListener("visibilitychange", visibility);
    resize();
    if (!reducedMotion) frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="neuralCanvas" aria-hidden="true" />;
}
