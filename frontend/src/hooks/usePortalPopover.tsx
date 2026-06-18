import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const POPOVER_HEIGHT_ESTIMATE = 160; // px — hauteur estimée du popover
const GAP = 4; // px — espace entre bouton et popover

interface PopoverPosition {
  top: number;
  left: number;
  placement: "bottom" | "top";
  anchorBottom: number; // bottom du bouton (pour placement top)
}

export function usePortalPopover() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPosition>({
    top: 0,
    left: 0,
    placement: "bottom",
    anchorBottom: 0,
  });
  const anchorRef = useRef<HTMLButtonElement>(null);

  const calcPos = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement: "bottom" | "top" =
      spaceBelow < POPOVER_HEIGHT_ESTIMATE && spaceAbove > spaceBelow
        ? "top"
        : "bottom";

    setPos({
      top: rect.bottom + window.scrollY + GAP, // utilisé si placement=bottom
      anchorBottom: window.innerHeight - rect.top + GAP, // utilisé si placement=top (distance depuis le bas)
      left: rect.left + window.scrollX,
      placement,
    });
  }, []);

  const toggle = useCallback(() => {
    if (!open) calcPos();
    setOpen((v) => !v);
  }, [open, calcPos]);

  useEffect(() => {
    if (!open) return;
    const recalc = () => calcPos();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
    };
  }, [open, calcPos]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        setTimeout(() => setOpen(false), 50);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const portal = useCallback(
    (children: React.ReactNode) =>
      open
        ? createPortal(
            <div
              style={{
                position: "absolute",
                ...(pos.placement === "bottom"
                  ? { top: pos.top }
                  : { bottom: pos.anchorBottom }),
                left: pos.left,
                zIndex: 9999,
                minWidth: 200,
                // Animation légère selon la direction
                transformOrigin:
                  pos.placement === "bottom" ? "top left" : "bottom left",
                animation: "bizflow-popover-in 120ms ease",
              }}
            >
              {children}
            </div>,
            document.body,
          )
        : null,
    [open, pos],
  );

  return {
    open,
    toggle,
    anchorRef,
    portal,
    close: () => setOpen(false),
    placement: pos.placement,
  };
}
