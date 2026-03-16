"use client";

import { useState, useCallback } from "react";

export function useToast() {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);

  const show = useCallback((message: string) => {
    setMsg(message);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  }, []);

  return { msg, visible, show };
}

export default function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  return (
    <div
      className="fixed bottom-7 left-1/2 z-50 transition-transform duration-400"
      style={{
        transform: `translateX(-50%) translateY(${visible ? "0" : "70px"})`,
        background: "#1E1C3A",
        border: "1px solid #A855F744",
        borderRadius: 12,
        padding: "13px 28px",
        fontSize: 14,
        fontWeight: 600,
        color: "#F0EEF8",
        whiteSpace: "nowrap",
      }}
    >
      {msg}
    </div>
  );
}
