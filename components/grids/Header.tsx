"use client";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <h1
      style={{
        fontSize: "33px",
        fontFamily: "monospace",
        textTransform: "uppercase",
        marginTop: "33px",
        marginBottom: "30px",
        letterSpacing: "2px",
        textAlign: "center",
        WebkitFontSmoothing: "none",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeSpeed",
        filter: "contrast(1.2)",
      } as React.CSSProperties}
    >
      {title}
    </h1>
  );
}
