"use client";

import Link from "next/link";

interface CollectionLink {
  name: string;
  href: string;
}

interface CollectionNavProps {
  collections: CollectionLink[];
}

export function CollectionNav({ collections }: CollectionNavProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "clamp(5px, 1.5vw, 10px)",
        flexWrap: "wrap",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {collections.map((collection) => (
        <Link
          key={collection.href}
          href={collection.href}
          style={{
            color: "rgba(255, 255, 255, 0.85)",
            textDecoration: "none",
            fontSize: "clamp(9px, 2vw, 12px)",
            fontFamily: "monospace",
            textTransform: "uppercase",
            padding: "clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)",
            border: "2px solid rgba(255, 255, 255, 0.85)",
            backgroundColor: "transparent",
            display: "inline-block",
            textAlign: "center",
            transition: "all 0.2s",
            boxSizing: "border-box",
            wordWrap: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff";
            e.currentTarget.style.color = "#000000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
          }}
        >
          {collection.name}
        </Link>
      ))}
    </div>
  );
}


