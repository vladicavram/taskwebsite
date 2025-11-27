"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  src?: string; // single image
  images?: string[]; // optional gallery support
  alt?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  initialIndex?: number;
};

export default function ImageLightbox({ src, images, alt = "", thumbnailWidth = 160, thumbnailHeight = 160, initialIndex = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const gallery = images && images.length ? images : (src ? [src] : []);
  const [index, setIndex] = useState(Math.min(initialIndex, Math.max(0, gallery.length - 1)) || 0);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") setIndex((i) => (i === 0 ? Math.max(gallery.length - 1, 0) : i - 1));
      if (e.key === "ArrowRight") setIndex((i) => (i === gallery.length - 1 ? 0 : i + 1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!gallery.length) return null;

  return (
    <div>
      <button
        type="button"
        aria-label="Open image"
        onClick={() => setOpen(true)}
        style={{
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "zoom-in",
        }}
      >
        <img
          src={gallery[0]}
          alt={alt}
          style={{
            width: `${thumbnailWidth}px`,
            height: `${thumbnailHeight}px`,
            objectFit: "cover",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          }}
        />
      </button>

      {open && typeof window !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          onMouseDown={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            pointerEvents: "auto",
            zIndex: 9999,
            width: "100vw",
            height: "100vh",
          }}
        >
          <div
            onClick={(e) => {
              const target = e.target as HTMLElement
              if (target && target.tagName !== "IMG") {
                setOpen(false)
              }
            }}
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "85vh",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#111",
            }}
          >
            <img
              src={gallery[index]}
              alt={alt}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#111",
              }}
            />
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i === 0 ? gallery.length - 1 : i - 1))}
                  aria-label="Previous"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 8,
                    transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 10px",
                    cursor: "pointer",
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i === gallery.length - 1 ? 0 : i + 1))}
                  aria-label="Next"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: 8,
                    transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 10px",
                    cursor: "pointer",
                  }}
                >
                  ›
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
