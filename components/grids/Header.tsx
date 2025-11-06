"use client";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <h1
      style={{
        fontSize: "32px",
        fontFamily: "monospace",
        textTransform: "uppercase",
        marginBottom: "30px",
        letterSpacing: "2px",
        textAlign: "center",
      }}
    >
      {title}
    </h1>
  );
}

