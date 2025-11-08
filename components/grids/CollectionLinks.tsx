"use client";

import Link from "next/link";

interface CollectionLink {
  name: string;
  href: string;
}

interface CollectionLinksProps {
  collections: CollectionLink[];
}

export function CollectionLinks({ collections }: CollectionLinksProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "clamp(10px, 3vw, 20px)",
        flexWrap: "wrap",
        marginBottom: "clamp(20px, 5vw, 40px)",
        width: "100%",
        boxSizing: "border-box",
        padding: "0 clamp(10px, 3vw, 20px)",
      }}
    >
      {collections.map((collection) => (
        <Link
          key={collection.href}
          href={collection.href}
          style={{
            color: "rgba(255, 255, 255, 0.85)",
            textDecoration: "none",
            fontSize: "clamp(14px, 4vw, 18px)",
            fontFamily: "monospace",
            textTransform: "uppercase",
            padding: "clamp(12px, 3vw, 20px) clamp(20px, 5vw, 40px)",
            border: "2px solid rgba(255, 255, 255, 0.85)",
            backgroundColor: "transparent",
            display: "inline-block",
            minWidth: "clamp(150px, 40vw, 200px)",
            maxWidth: "90vw",
            textAlign: "center",
            transition: "all 0.2s",
            boxSizing: "border-box",
            wordWrap: "break-word",
            overflowWrap: "break-word",
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

