"use client";

import { useFormStatus } from "react-dom";

const VARIANTS = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  className = "",
  disabled,
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function SubmitButton({ children, variant = "primary" }: { children: React.ReactNode; variant?: keyof typeof VARIANTS }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? "Saving..." : children}
    </Button>
  );
}
