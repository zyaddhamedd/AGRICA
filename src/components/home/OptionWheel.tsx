"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  type CSSProperties,
} from "react";
import "./OptionWheel.css";

type Side = "left" | "right";
export type WheelOrientation = "vertical" | "horizontal";

export interface OptionWheelProps {
  items?: string[];
  defaultSelected?: number;
  selectedIndex?: number;
  onChange?: (index: number, item: string) => void;
  orientation?: WheelOrientation;
  textColor?: string;
  activeColor?: string;
  side?: Side;
  fontSize?: number | string;
  spacing?: number;
  curve?: number;
  tilt?: number;
  blur?: number;
  fade?: number;
  minOpacity?: number;
  smoothing?: number;
  inset?: number;
  loop?: boolean;
  draggable?: boolean;
  soundUrl?: string;
  soundVolume?: number;
  className?: string;
}

interface WheelConfig {
  count: number;
  items: string[];
  rowH: number;
  curve: number;
  tilt: number;
  blur: number;
  fade: number;
  minOpacity: number;
  side: Side;
  orientation: WheelOrientation;
  loop: boolean;
  smoothing: number;
  draggable: boolean;
  soundUrl: string;
  soundVolume: number;
}

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Ultra-subtle, dry mechanical UI selector tick.
 * Generates an 8ms micro-transient at 0.045 gain (quiet, crisp, premium).
 */
function playMechanicalTick(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(3.5, now);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(2000, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.007);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.0075);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.008);
  } catch {
    // Audio policies or unsupported in environment
  }
}

const DEFAULT_ITEMS = ["Fresh", "Frozen", "Dried"];

export function OptionWheel({
  items = DEFAULT_ITEMS,
  defaultSelected = 0,
  selectedIndex: controlledSelected,
  onChange,
  orientation = "vertical",
  textColor = "rgba(0, 32, 80, 0.48)",
  activeColor = "#002050",
  side = "left",
  fontSize,
  spacing = 1.25,
  curve = 0.85,
  tilt = 7.5,
  blur = 0.6,
  fade = 0.42,
  minOpacity = 0.28,
  smoothing = orientation === "horizontal" ? 240 : 180,
  inset = 0,
  loop = false,
  draggable = true,
  soundUrl = "",
  soundVolume = 0,
  className = "",
}: OptionWheelProps): React.JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const initialIndex = controlledSelected !== undefined ? controlledSelected : defaultSelected;
  const posRef = useRef(initialIndex);
  const targetRef = useRef(initialIndex);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const cfgRef = useRef<WheelConfig>({} as WheelConfig);
  const onChangeRef = useRef(onChange);
  const selectedRef = useRef(initialIndex);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // User interaction & sound tracking
  const userInteractedRef = useRef(false);
  const soundPlayedForIndexRef = useRef(initialIndex);

  interface DragSession {
    startY: number;
    startX: number;
    startTime: number;
    startTarget: number;
    pointerId: number;
    lastY: number;
    lastX: number;
    lastTime: number;
    velocityY: number;
    velocityX: number;
    moved: boolean;
  }
  const dragRef = useRef<DragSession | null>(null);
  const [internalSelected, setInternalSelected] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);

  const activeIndex = controlledSelected !== undefined ? controlledSelected : internalSelected;

  const remPx =
    typeof window !== "undefined"
      ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      : 16;

  const numericFontSize = typeof fontSize === "number" ? fontSize : 3.5;

  onChangeRef.current = onChange;
  cfgRef.current = {
    count: items.length,
    items,
    rowH: Math.max(numericFontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    orientation,
    loop,
    smoothing,
    draggable,
    soundUrl,
    soundVolume,
  };

  // Pure styling function applying cylinder drum transforms
  const renderItems = useCallback((pos: number) => {
    const cfg = cfgRef.current;
    const els = itemRefs.current;
    const n = cfg.count;

    if (cfg.orientation === "horizontal") {
      // Luxury editorial wheel geometry:
      // Active item sits dead-center (x = 0, y = 0, scale = 1, opacity = 1, blur = 0, zIndex = 10).
      // Inactive items frame the active word with generous separation, eliminating visual collision:
      // - Spacing stepX: ~140px–166px (guaranteed 20px+ visual gap between active and side word edges)
      // - Scale: ~0.62–0.72 (dist 1: 0.67, dist 2: 0.56)
      // - Opacity: ~0.38–0.50 (dist 1: 0.44, dist 2: 0.30)
      // - Blur: ~0.75px–1.25px (dist 1: 0.95px, dist 2: 1.20px)
      // - Shallow Y arc: ~14px lift at dist 1, gentle tangential rotation 3.2°
      const W = rootRef.current ? rootRef.current.clientWidth : 390;
      const stepX = Math.max(140, Math.min(W * 0.38, 166));

      for (let i = 0; i < n; i++) {
        const el = els[i];
        if (!el) continue;
        let d = i - pos;
        if (cfg.loop && n > 1) {
          d = ((d % n) + n) % n;
          if (d > n / 2) d -= n;
        }
        const dist = Math.abs(d);

        // Arc separation with shallow curvature:
        const x = d * stepX * (1 + Math.max(0, dist - 1) * 0.12);
        // Shallow, elegant upward lift along cylinder
        const y = -Math.pow(dist, 1.1) * 14;
        // Inactive scale: ~0.62–0.72 (dist 1: 0.67, dist 2: 0.56)
        const scale = Math.max(0.56, 1 - dist * 0.33);
        // Gentle tangential tilt along the arc
        const rot = d * 3.2;
        // Inactive opacity: ~0.38–0.50 (dist 1: 0.44, dist 2: 0.30)
        const opacity = dist < 0.05 ? 1 : Math.max(0.30, 1 - dist * 0.56);
        // Subtle optical blur: ~0.75px–1.25px (dist 1: 0.95px, dist 2: 1.20px)
        const blurVal = dist < 0.05 ? 0 : Math.min(1.2, dist * 0.95);

        el.style.transform = `translate(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px)) scale(${scale.toFixed(4)}) rotate(${rot.toFixed(3)}deg)`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = blurVal > 0.08 ? `blur(${blurVal.toFixed(2)}px)` : "none";
        el.style.zIndex = String(10 - Math.min(Math.round(dist * 2), 6));
        el.style.setProperty("--ow-p", Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
      }
    } else {
      // Vertical wheel geometry
      const mirror = cfg.side === "right" ? -1 : 1;
      const tiltRad = (cfg.tilt * Math.PI) / 180;
      const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;

      for (let i = 0; i < n; i++) {
        const el = els[i];
        if (!el) continue;
        let d = i - pos;
        if (cfg.loop && n > 1) {
          d = ((d % n) + n) % n;
          if (d > n / 2) d -= n;
        }
        const dist = Math.abs(d);
        let x = 0;
        let y = d * cfg.rowH;
        let rot = 0;
        if (R > 0) {
          const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
          y = R * Math.sin(ang);
          x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
          rot = (mirror * ang * 180) / Math.PI;
        }
        el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
        el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
        el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : "none";
        el.style.setProperty("--ow-p", Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
      }
    }
  }, []);

  // Single rAF loop that eases the wheel position toward its target
  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const cfg = cfgRef.current;
    const tau = Math.max(cfg.smoothing, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    const target = targetRef.current;
    const cur = posRef.current;
    let next = cur + (target - cur) * k;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) next = target;
    posRef.current = next;

    renderItems(next);

    if (settled) {
      rafRef.current = null;
      const currentIdx = Math.round(target);
      if (userInteractedRef.current && currentIdx !== soundPlayedForIndexRef.current) {
        soundPlayedForIndexRef.current = currentIdx;
        playMechanicalTick();
      }
    } else {
      rafRef.current = requestAnimationFrame(runFrame);
    }
  }, [renderItems]);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastRef.current = performance.now() - 16;
    runFrame(performance.now());
  }, [runFrame]);

  const applyTarget = useCallback(
    (value: number, snap: boolean) => {
      const cfg = cfgRef.current;
      let v = value;
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0));

      if (snap) {
        v = Math.round(v);
        targetRef.current = v;
        const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
        if (idx !== selectedRef.current) {
          selectedRef.current = idx;
          setInternalSelected(idx);
          onChangeRef.current?.(idx, cfg.items[idx]);
        }
        startLoop();
      } else {
        // Continuous 1:1 tracking during drag motion
        targetRef.current = v;
        posRef.current = v;
        renderItems(v);
      }
    },
    [startLoop, renderItems]
  );

  // Sync with controlled index if provided
  useEffect(() => {
    if (controlledSelected !== undefined && controlledSelected !== selectedRef.current) {
      applyTarget(controlledSelected, true);
    }
  }, [controlledSelected, applyTarget]);

  // Wheel / Touchpad scrolling
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cfg = cfgRef.current;
      userInteractedRef.current = true;
      getAudioContext();
      if (cfg.orientation === "horizontal") {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        const step = Math.max(-1, Math.min(1, delta / 60));
        applyTarget(targetRef.current + step, false);
      } else {
        const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
        const step = Math.max(-1, Math.min(1, delta / cfg.rowH));
        applyTarget(targetRef.current + step, false);
      }
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => applyTarget(targetRef.current, true), 140);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cfgRef.current.draggable) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    userInteractedRef.current = true;
    getAudioContext();

    dragRef.current = {
      startY: e.clientY,
      startX: e.clientX,
      startTime: performance.now(),
      startTarget: targetRef.current,
      pointerId: e.pointerId,
      lastY: e.clientY,
      lastX: e.clientX,
      lastTime: performance.now(),
      velocityY: 0,
      velocityX: 0,
      moved: false,
    };
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;

      const cfg = cfgRef.current;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const now = performance.now();
      const dt = now - drag.lastTime;

      if (dt > 12) {
        drag.velocityX = (e.clientX - drag.lastX) / dt;
        drag.velocityY = (e.clientY - drag.lastY) / dt;
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
        drag.lastTime = now;
      }

      if (!drag.moved) {
        if (cfg.orientation === "horizontal") {
          // Allow natural vertical page scrolling if gesture is clearly vertical
          if (Math.abs(dy) > 7 && Math.abs(dy) > Math.abs(dx)) {
            dragRef.current = null;
            setIsDragging(false);
            return;
          }
          if (Math.abs(dx) > 5) {
            drag.moved = true;
            try {
              rootRef.current?.setPointerCapture(e.pointerId);
            } catch {}
          }
        } else {
          if (Math.abs(dy) > 4) {
            drag.moved = true;
            try {
              rootRef.current?.setPointerCapture(e.pointerId);
            } catch {}
          }
        }
      }

      if (drag.moved) {
        if (cfg.orientation === "horizontal") {
          const W = rootRef.current ? rootRef.current.clientWidth : 390;
          const dragStep = Math.max(140, Math.min(W * 0.38, 166));
          // Swiping left (negative dx) pulls next item (positive target)
          applyTarget(drag.startTarget - dx / dragStep, false);
        } else {
          applyTarget(drag.startTarget - dy / cfg.rowH, false);
        }
      }
    },
    [applyTarget]
  );

  const handlePointerEnd = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      dragRef.current = null;
      setIsDragging(false);

      try {
        if (rootRef.current?.hasPointerCapture(drag.pointerId)) {
          rootRef.current.releasePointerCapture(drag.pointerId);
        }
      } catch {}

      const cfg = cfgRef.current;
      const curTarget = targetRef.current;

      if (drag.moved) {
        if (cfg.orientation === "horizontal") {
          const vx = drag.velocityX;
          const totalDx = e.clientX - drag.startX;
          let targetIndex = Math.round(curTarget);

          // Horizontal swipe:
          // Swiping left (negative totalDx / vx) advances to next (Fresh -> Frozen -> Dried)
          // Swiping right (positive totalDx / vx) advances to previous (Dried -> Frozen -> Fresh)
          if (vx < -0.22 || totalDx < -30) {
            targetIndex = Math.min(
              cfg.count - 1,
              Math.max(Math.floor(curTarget) + 1, Math.round(drag.startTarget) + 1)
            );
          } else if (vx > 0.22 || totalDx > 30) {
            targetIndex = Math.max(
              0,
              Math.min(Math.ceil(curTarget) - 1, Math.round(drag.startTarget) - 1)
            );
          }

          applyTarget(targetIndex, true);
        } else {
          const v = drag.velocityY;
          const totalDy = e.clientY - drag.startY;
          let targetIndex = Math.round(curTarget);

          if (v < -0.22 || totalDy < -30) {
            targetIndex = Math.min(
              cfg.count - 1,
              Math.max(Math.floor(curTarget) + 1, Math.round(drag.startTarget) + 1)
            );
          } else if (v > 0.22 || totalDy > 30) {
            targetIndex = Math.max(
              0,
              Math.min(Math.ceil(curTarget) - 1, Math.round(drag.startTarget) - 1)
            );
          }

          applyTarget(targetIndex, true);
        }
      } else {
        // Direct tap on category or relative area
        const targetEl = document.elementFromPoint(e.clientX, e.clientY);
        const itemEl = targetEl?.closest?.("[data-index]");
        if (itemEl) {
          const idxStr = itemEl.getAttribute("data-index");
          if (idxStr != null) {
            const idx = parseInt(idxStr, 10);
            if (!isNaN(idx) && idx >= 0 && idx < cfg.count) {
              applyTarget(idx, true);
              return;
            }
          }
        }

        if (rootRef.current) {
          const rect = rootRef.current.getBoundingClientRect();
          if (cfg.orientation === "horizontal") {
            const relX = e.clientX - (rect.left + rect.width / 2);
            const stepX = Math.max(120, rect.width * 0.35);
            const clickedDelta = Math.round(relX / stepX);
            const newIdx = Math.min(
              cfg.count - 1,
              Math.max(0, Math.round(curTarget) + clickedDelta)
            );
            applyTarget(newIdx, true);
          } else {
            const relY = e.clientY - (rect.top + rect.height / 2);
            const clickedDelta = Math.round(relY / cfg.rowH);
            const newIdx = Math.min(
              cfg.count - 1,
              Math.max(0, Math.round(curTarget) + clickedDelta)
            );
            applyTarget(newIdx, true);
          }
        }
      }
    },
    [applyTarget]
  );

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
      dragRef.current = null;
      setIsDragging(false);
      try {
        if (rootRef.current?.hasPointerCapture(e.pointerId)) {
          rootRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {}
      applyTarget(Math.round(targetRef.current), true);
    },
    [applyTarget]
  );

  const handleItemClick = useCallback(
    (index: number) => {
      userInteractedRef.current = true;
      getAudioContext();
      applyTarget(index, true);
    },
    [applyTarget]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const cfg = cfgRef.current;
      let newIndex: number | null = null;
      const cur = Math.round(targetRef.current);

      if (cfg.orientation === "horizontal") {
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          newIndex = cfg.loop ? (cur - 1 + cfg.count) % cfg.count : Math.max(0, cur - 1);
        } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          newIndex = cfg.loop ? (cur + 1) % cfg.count : Math.min(cfg.count - 1, cur + 1);
        } else if (e.key === "Home") {
          newIndex = 0;
        } else if (e.key === "End") {
          newIndex = cfg.count - 1;
        } else if (e.key === "Enter" || e.key === " ") {
          newIndex = cur;
        }
      } else {
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          newIndex = cfg.loop ? (cur - 1 + cfg.count) % cfg.count : Math.max(0, cur - 1);
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          newIndex = cfg.loop ? (cur + 1) % cfg.count : Math.min(cfg.count - 1, cur + 1);
        } else if (e.key === "Home") {
          newIndex = 0;
        } else if (e.key === "End") {
          newIndex = cfg.count - 1;
        } else if (e.key === "Enter" || e.key === " ") {
          newIndex = cur;
        }
      }

      if (newIndex !== null) {
        e.preventDefault();
        userInteractedRef.current = true;
        getAudioContext();
        applyTarget(newIndex, true);
      }
    },
    [applyTarget]
  );

  useEffect(() => {
    applyTarget(targetRef.current, true);
  }, [
    items,
    fontSize,
    spacing,
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    orientation,
    loop,
    smoothing,
    applyTarget,
  ]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  const resolvedFontSize =
    fontSize !== undefined
      ? typeof fontSize === "number"
        ? `${fontSize}rem`
        : fontSize
      : orientation === "horizontal"
      ? "clamp(60px, 16vw, 74px)"
      : "3.5rem";

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="AGRICA Three Worlds Option Wheel"
      className={`option-wheel${orientation === "horizontal" ? " option-wheel--horizontal" : ""}${
        side === "right" ? " option-wheel--right" : ""
      }${isDragging ? " option-wheel--dragging" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--ow-text-color": textColor,
          "--ow-active-color": activeColor,
          "--ow-font-size": resolvedFontSize,
          "--ow-inset": `${inset}px`,
        } as CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
    >
      {items.map((label, index) => (
        <div
          key={`${label}-${index}`}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          data-index={index}
          role="option"
          tabIndex={-1}
          aria-selected={activeIndex === index}
          className={`option-wheel__item${activeIndex === index ? " option-wheel__item--selected" : ""}`}
          onClick={() => handleItemClick(index)}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

export default OptionWheel;
