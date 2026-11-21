import { useRef, useState, useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";

interface Props {
  left: ReactNode;
  right: ReactNode;
  initialLeft?: number;
  min?: number;
  max?: number;
}

const HANDLE_SIZE = 16;

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
      const availableWidth = rect.width - HANDLE_SIZE;
      const leftWidth = e.clientX - rect.left - HANDLE_SIZE / 2;
      const pct = (leftWidth / availableWidth) * 100;
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
    <div
      ref={containerRef}
      className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(0,var(--left-width))_16px_minmax(0,var(--right-width))]"
      style={{
        "--left-width": `${leftWidth}fr`,
        "--right-width": `${100 - leftWidth}fr`,
      } as CSSProperties}
    >
      <div className="min-h-0 min-w-0">{left}</div>
      <div
        className="group relative hidden cursor-col-resize items-stretch justify-center md:flex"
        onMouseDown={() => setDragging(true)}
        title="Drag to resize"
        role="separator"
        aria-label="Resize problem and editor panels"
        aria-orientation="vertical"
      >
        <div className={`my-3 w-px rounded-full transition-colors ${dragging ? "bg-brand" : "bg-stroke group-hover:bg-stroke-strong"}`} />
      </div>
      <div className="min-h-0 min-w-0">{right}</div>
    </div>
  );
}
