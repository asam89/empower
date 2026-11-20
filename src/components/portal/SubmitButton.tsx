"use client";

import { useFormStatus } from "react-dom";
import { buttonClass } from "@/components/portal/ui";

export function SubmitButton({
  children,
  pendingText = "Saving…",
  className = buttonClass,
  confirm,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending ? pendingText : children}
    </button>
  );
}
