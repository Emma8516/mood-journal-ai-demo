import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
export default function HomePage() {
  return (
    <>
    
  

    
     
      <main className="min-h-screen flex items-center justify-center px-6">
        <section className="w-full max-w-3xl text-center">
          {/* 標題區 */}
          <div className="mb-12">
            

            <h1 className="text-7xl md:text-6xl font-bold tracking-tight text-white">
              Mood Journal 
            </h1>
            <p className="mt-5 text-neutral-400 text-lg md:text-xl">
              Capture your day.
            </p>
          </div>

          {/* 按鈕區：左右排列、置中、與標題等寬 */}
          <div className="mx-auto max-w-2xl flex flex-row justify-center items-center gap-8 md:gap-10 px-6">
          <ButtonLink href="/register" className="w-48">Create account</ButtonLink>
          <ButtonLink href="/login" className="w-48">Sign in</ButtonLink>
          </div>
        </section>
      </main>

      {/* 底部 */}
      <footer className="py-10 text-center text-xs text-neutral-500">
        <div className="mb-2">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-neutral-300 transition">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-neutral-300 transition">
            Privacy Policy
          </Link>.
        </div>
        © {new Date().getFullYear()} Mood Journal AI
      </footer>
    </>
  );
}
