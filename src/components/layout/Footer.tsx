import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-white/5 backdrop-blur text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} Mood Journal AI
          </p>

          <nav className="flex items-center gap-4 text-xs">
            <Link
              href="/terms"
              className="text-white/70 hover:text-white transition underline-offset-4 hover:underline"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-white/70 hover:text-white transition underline-offset-4 hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="mailto:xy.huang8516@gmail.com?subject=Mood%20Journal%20AI%20Contact&body=Hi%20there%2C%0A"
              className="text-white/70 hover:text-white transition underline-offset-4 hover:underline"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
