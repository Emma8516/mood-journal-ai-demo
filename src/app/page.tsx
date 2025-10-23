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
            <p className="mt-5 text-white/70 text-lg md:text-xl">
              Capture your day. Reflect with AI insight.
            </p>
          </div>

          {/* 按鈕區：統一UI */}
          <div className="mx-auto max-w-2xl flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 px-6">
            <ButtonLink
              href="/register"
              variant="primary"
              size="md"
              className="w-48"
            >
              Create account
            </ButtonLink>

            <ButtonLink
              href="/login"
              variant="secondary"
              size="md"
              className="w-48"
            >
              Sign in
            </ButtonLink>
          </div>
        </section>
      </main>


    </>
  );
}

