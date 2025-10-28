// src/components/ui/Button.tsx
import Link from "next/link";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-full transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60";

const variants = {
  primary: "bg-gradient-to-br from-[#2563eb] to-[#60a5fa] text-white hover:opacity-90",

  secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/15",
  danger: "bg-rose-500/30 text-rose-200 hover:bg-rose-500/40 border border-rose-400/30",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  className?: string;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={clsx(base, variants[variant], sizes[size], "no-underline", className)}
      {...rest}
    >
      {children}
    </Link>
  );
}



