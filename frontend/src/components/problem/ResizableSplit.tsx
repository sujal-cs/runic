import { useRef, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface Props {
  left: ReactNode;
  right: ReactNode;
  initialLeft?: number;
  min?: number;
  max?: number;
}

// Reusable draggable split-pane used by the problem workspace.
export default function ResizableSplit({ left, right, initialLeft = 45, min = 25, max = 75 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(initialLeft);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(max, Math.max(min, pct)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [dragging, min, max]);

  return (
    <div ref={containerRef} style={{ display: "grid", gridTemplateColumns: `${leftWidth}% 4px ${100 - leftWidth}%`, height: "100%", minHeight: 0 }}>
      <div style={{ minWidth: 0, overflow: "auto" }}>{left}</div>
      <div
        className="resize-handle"
        onMouseDown={() => setDragging(true)}
        style={{ cursor: "col-resize", background: "transparent", alignSelf: "stretch", position: "relative" }}
        title="Drag to resize"
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 1,
            width: 2,
            background: dragging ? "var(--brand)" : "transparent",
            transition: "background 0.15s ease",
          }}
        />
      </div>
      <div style={{ minWidth: 0, overflow: "auto", display: "flex", flexDirection: "column", gap: 12 }}>{right}</div>
    </div>
  );
}
