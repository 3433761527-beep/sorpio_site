import { useEffect, useRef } from "react";
export function Starfield({ complete = false }: { complete?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!,
      ctx = c.getContext("2d")!;
    let frame = 0,
      raf = 0,
      w = 0,
      h = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stars = Array.from({ length: 230 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      p: Math.random() * 7,
    }));
    function size() {
      w = innerWidth;
      h = innerHeight;
      const d = Math.min(devicePixelRatio, 2);
      c.width = w * d;
      c.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    size();
    addEventListener("resize", size);
    function draw() {
      ctx.clearRect(0, 0, w, h);
      frame++;
      stars.forEach((s) => {
        ctx.globalAlpha = 0.24 + (Math.sin(frame * 0.009 + s.p) + 1) * 0.28;
        ctx.fillStyle = "#ddd3ed";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r * (complete ? 1.5 : 1), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    };
  }, [complete]);
  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
export function Fireworks() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!,
      ctx = c.getContext("2d")!;
    let raf = 0;
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }[] = [];
    function resize() {
      c.width = innerWidth;
      c.height = innerHeight;
    }
    resize();
    const burst = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button,input,textarea,a")) return;
      for (let i = 0; i < 65; i++) {
        const angle = (Math.PI * 2 * i) / 65,
          speed = 1 + Math.random() * 4;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: ["#ead4a3", "#c7adeb", "#e7a8be"][i % 3],
        });
      }
    };
    addEventListener("pointerdown", burst);
    addEventListener("resize", resize);
    function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.025;
        p.life -= 0.013;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, 7);
        ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointerdown", burst);
      removeEventListener("resize", resize);
    };
  }, []);
  return <canvas className="fireworks" ref={ref} aria-hidden="true" />;
}
export function chime() {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  void ctx.resume();
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.frequency.value = f;
    o.type = "sine";
    g.gain.setValueAtTime(0, ctx.currentTime + i * 0.14);
    g.gain.linearRampToValueAtTime(0.09, ctx.currentTime + i * 0.14 + 0.01);
    g.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + i * 0.14 + 0.7,
    );
    o.connect(g);
    g.connect(ctx.destination);
    o.start(ctx.currentTime + i * 0.14);
    o.stop(ctx.currentTime + i * 0.14 + 0.8);
  });
  setTimeout(() => void ctx.close(), 1700);
}
