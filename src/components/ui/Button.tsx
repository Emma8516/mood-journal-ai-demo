// src/components/ui/Button.tsx
import Link from "next/link";

const base =
  "inline-flex items-center justify-center rounded-full font-semibold " +
  "px-5 py-3 text-1xl text-white bg-gradient-to-br from-indigo-600 to-violet-600 " +
  "hover:opacity-90 transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500";



export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <button className={`${base} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  className = "",
  children,
  ...rest
}: React.ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={`${base} no-underline ${className}`} {...rest}>
      {children}
    </Link>
  );
}

