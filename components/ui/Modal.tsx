"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; }

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = dialogRef.current; if (!d) return; if (open) d.showModal(); else d.close(); }, [open]);
  return (
    <dialog ref={dialogRef} onClose={onClose} className="backdrop:bg-black/50 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-0 w-full max-w-lg mx-auto text-[var(--text-primary)] shadow-[var(--shadow-lg)]">
      <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
        <h2 className="text-[18px] font-semibold">{title}</h2>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--bg-muted)]"><X size={18} /></button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
