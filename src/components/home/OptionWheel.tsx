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

export interface OptionWheelProps {
  items?: string[];
  defaultSelected?: number;
  selectedIndex?: number;
  onChange?: (index: number, item: string) => void;
  textColor?: string;
  activeColor?: string;
  side?: Side;
  fontSize?: number;
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
  loop: boolean;
  smoothing: number;
  draggable: boolean;
  soundUrl: string;
  soundVolume: number;
}

const DEFAULT_ITEMS = ["Fresh", "Frozen", "Dried"];

export function OptionWheel({
  items = DEFAULT_ITEMS,
  defaultSelected = 0,
  selectedIndex: controlledSelected,
  onChange,
  textColor = "rgba(0, 32, 80, 0.38)",
  activeColor = "#002050",
  side = "left",
  fontSize = 3.5,
  spacing = 1.25,
  curve = 0.85,
  tilt = 7.5,
  blur = 0.6,
  fade = 0.42,
  minOpacity = 0.28,
  smoothing = 180,
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
  interface DragSession {
    startY: number;
    startX: number;
    startTime: number;
    startTarget: number;
    pointerId: number;
    lastY: number;
    lastTime: number;
    velocityY: number;
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

  onChangeRef.current = onChange;
  cfgRef.current = {
    count: items.length,
    items,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    draggable,
    soundUrl,
    soundVolume,
  };

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

    const els = itemRefs.current;
    const n = cfg.count;
    const mirror = cfg.side === "right" ? -1 : 1;
    const tiltRad = (cfg.tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;

    for (let i = 0; i < n; i++) {
      const el = els[i];
      if (!el) continue;
      let d = i - next;
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

    rafRef.current = settled ? null : requestAnimationFrame(runFrame);
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const applyTarget = useCallback(
    (value: number, snap: boolean) => {
      const cfg = cfgRef.current;
      let v = value;
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0));
      if (snap) v = Math.round(v);
      targetRef.current = v;
      const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        setInternalSelected(idx);
        onChangeRef.current?.(idx, cfg.items[idx]);
      }
      startLoop();
    },
    [startLoop]
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
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      const step = Math.max(-1, Math.min(1, delta / cfg.rowH));
      applyTarget(targetRef.current + step, false);
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

    dragRef.current = {
      startY: e.clientY,
      startX: e.clientX,
      startTime: performance.now(),
      startTarget: targetRef.current,
      pointerId: e.pointerId,
      lastY: e.clientY,
      lastTime: performance.now(),
      velocityY: 0,
      moved: false,
    };
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;

      const dy = e.clientY - drag.startY;
      const dx = e.clientX - drag.startX;
      const now = performance.now();
      const dt = now - drag.lastTime;

      if (dt > 12) {
        drag.velocityY = (e.clientY - drag.lastY) / dt;
        drag.lastY = e.clientY;
        drag.lastTime = now;
      }

      if (!drag.moved && (Math.abs(dy) > 6 || Math.abs(dx) > 6)) {
        drag.moved = true;
        try {
          rootRef.current?.setPointerCapture(drag.pointerId);
        } catch {}
      }

      if (drag.moved) {
        applyTarget(drag.startTarget - dy / cfgRef.current.rowH, false);
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
        const v = drag.velocityY;
        const totalDy = e.clientY - drag.startY;
        let targetIndex = Math.round(curTarget);

        // Vertical swipe / flick:
        // Swiping up (negative totalDy / velocity) advances forward (Fresh -> Frozen -> Dried)
        // Swiping down (positive totalDy / velocity) advances backward (Dried -> Frozen -> Fresh)
        if (v < -0.22 || totalDy < -30) {
          targetIndex = Math.min(cfg.count - 1, Math.max(Math.floor(curTarget) + 1, Math.round(drag.startTarget) + 1));
        } else if (v > 0.22 || totalDy > 30) {
          targetIndex = Math.max(0, Math.min(Math.ceil(curTarget) - 1, Math.round(drag.startTarget) - 1));
        }

        applyTarget(targetIndex, true);
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
          const relY = e.clientY - (rect.top + rect.height / 2);
          const clickedDelta = Math.round(relY / cfg.rowH);
          const newIdx = Math.min(cfg.count - 1, Math.max(0, Math.round(curTarget) + clickedDelta));
          applyTarget(newIdx, true);
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
      applyTarget(index, true);
    },
    [applyTarget]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const cfg = cfgRef.current;
      let newIndex: number | null = null;
      const cur = Math.round(targetRef.current);

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

      if (newIndex !== null) {
        e.preventDefault();
        applyTarget(newIndex, true);
      }
    },
    [applyTarget]
  );

  useEffect(() => {
    applyTarget(targetRef.current, false);
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, applyTarget]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="AGRICA Three Worlds Option Wheel"
      className={`option-wheel${side === "right" ? " option-wheel--right" : ""}${isDragging ? " option-wheel--dragging" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--ow-text-color": textColor,
          "--ow-active-color": activeColor,
          "--ow-font-size": `${fontSize}rem`,
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
