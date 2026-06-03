"use client";

/**
 * Fond récurrent utilisé sur plusieurs pages.
 * Évite la duplication du bloc dégradé + 3 blobs floutés.
 */
export default function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(148deg,#0c0e1a 0%,#0f1729 25%,#1a1f3a 50%,#0f1729 75%,#0c0e1a 100%)",
        }}
      />
      <div
        className="absolute w-96 h-96 rounded-full blur-[40px]"
        style={{
          background: "rgba(6,182,212,0.10)",
          left: "25%",
          top: 0,
          opacity: 0.83,
        }}
      />
      <div
        className="absolute w-96 h-96 rounded-full blur-[40px]"
        style={{
          background: "rgba(59,130,246,0.10)",
          right: "25%",
          top: "696px",
          opacity: 0.51,
        }}
      />
      <div
        className="absolute w-96 h-96 rounded-full blur-[40px]"
        style={{
          background: "rgba(99,102,241,0.10)",
          left: "51.54%",
          top: "505px",
          opacity: 0.93,
        }}
      />
    </div>
  );
}
