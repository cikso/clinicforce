import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#E6FBF2]">
          <span className="text-4xl font-bold text-[#00D68F] font-heading">404</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827] font-heading">
          Page not found
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#6B7280]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/overview"
            className="rounded-xl bg-[#00D68F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00B578]"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#111827] transition hover:bg-[#F3F4F6]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
