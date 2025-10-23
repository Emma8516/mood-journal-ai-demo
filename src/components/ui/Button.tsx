// src/components/ui/Button.tsx
import Link from "next/link";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-full transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60";

const variants = {
  primary: "bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:opacity-90",
  secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/15",
  danger: "bg-rose-600/90 text-white hover:bg-rose-600",
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



