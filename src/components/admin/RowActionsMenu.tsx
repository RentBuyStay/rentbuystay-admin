"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Row action ("⋮") menu whose dropdown renders in a portal with fixed
 * positioning, so it's never clipped by a table's overflow-x-auto /
 * overflow-hidden wrappers. It measures the panel and flips above the trigger
 * when there isn't room below, and closes on scroll/resize/outside-click.
 */
export default function RowActionsMenu({
  trigger,
  width = 180,
  children,
}: {
  trigger: React.ReactNode;
  width?: number;
  children: (close: () => void) => React.ReactNode;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const close = () => setOpen(false);

  // Position after the panel mounts so we can measure its real height.
  useLayoutEffect(() => {
    if (!open) return;
    const btn = btnRef.current;
    const panel = panelRef.current;
    if (!btn || !panel) return;

    const place = () => {
      const r = btn.getBoundingClientRect();
      const h = panel.offsetHeight;
      const gap = 8;
      const left = Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8));
      const roomBelow = window.innerHeight - r.bottom;
      const top = roomBelow < h + gap && r.top > h + gap ? r.top - gap - h : r.bottom + gap;
      setPos({ top, left });
    };

    place();
    const onDismiss = () => close();
    window.addEventListener("scroll", onDismiss, true);
    window.addEventListener("resize", onDismiss);
    return () => {
      window.removeEventListener("scroll", onDismiss, true);
      window.removeEventListener("resize", onDismiss);
    };
  }, [open, width]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="Actions"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="inline-flex items-center justify-center hover:opacity-70"
      >
        {trigger}
      </button>
      {open && typeof document !== "undefined" &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={(e) => { e.stopPropagation(); close(); }} aria-hidden="true" />
            <div
              ref={panelRef}
              onClick={(e) => e.stopPropagation()}
              className="fixed z-[9999] bg-white rounded-[12px] border border-[#F6F6F6] overflow-hidden flex flex-col py-2"
              style={{
                top: pos?.top ?? -9999,
                left: pos?.left ?? -9999,
                width,
                visibility: pos ? "visible" : "hidden",
                boxShadow: "0px 15px 40px rgba(165,165,165,0.25)",
              }}
            >
              {children(close)}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
