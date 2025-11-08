"use client";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <h1
      style={{
        fontSize: "clamp(20px, 6vw, 33px)",
        fontFamily: "monospace",
        textTransform: "uppercase",
        marginTop: "clamp(15px, 4vw, 33px)",
        marginBottom: "clamp(15px, 4vw, 30px)",
        letterSpacing: "clamp(1px, 0.5vw, 2px)",
        textAlign: "center",
        color: "rgba(255, 255, 255, 0.85)",
        WebkitFontSmoothing: "none",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeSpeed",
        filter: "contrast(1.2)",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        padding: "0 clamp(10px, 3vw, 20px)",
        boxSizing: "border-box",
        width: "100%",
      } as React.CSSProperties}
    >
      {title}
    </h1>
  );
}
