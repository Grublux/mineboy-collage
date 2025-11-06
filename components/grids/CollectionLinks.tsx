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
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "40px",
      }}
    >
      {collections.map((collection) => (
        <Link
          key={collection.href}
          href={collection.href}
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "18px",
            fontFamily: "monospace",
            textTransform: "uppercase",
            padding: "20px 40px",
            border: "2px solid #ffffff",
            backgroundColor: "transparent",
            display: "inline-block",
            minWidth: "200px",
            textAlign: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff";
            e.currentTarget.style.color = "#000000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#ffffff";
          }}
        >
          {collection.name}
        </Link>
      ))}
    </div>
  );
}

