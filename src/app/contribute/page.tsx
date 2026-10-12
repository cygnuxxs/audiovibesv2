import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RAZORPAY_PAYMENT_URL } from "@/lib/contribution";

export const metadata: Metadata = {
  title: "Support AudioVibes",
  description:
    "Help keep AudioVibes fast, ad-free, and available for everyone with a contribution through Razorpay.",
  alternates: {
    canonical: "https://audiovibes.vercel.app/contribute",
  },
};

export default function ContributePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 size-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to AudioVibes
          </Link>

          <span className="text-sm font-semibold tracking-tight">
            AudioVibes
          </span>
        </header>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-20">
          <section className="max-w-xl">
            <p className="mb-4 text-sm font-medium text-primary">
              Keep the music playing
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Support AudioVibes
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              AudioVibes is free and ad-free. Your contribution helps cover
              hosting and ongoing maintenance.
            </p>
          </section>

          <section
            aria-labelledby="contribution-heading"
            className="rounded-3xl border border-border/60 bg-background/65 p-6 shadow-xl shadow-black/4 backdrop-blur-xl sm:p-8"
          >
            <div className="space-y-3">
              <h2
                id="contribution-heading"
                className="text-xl font-semibold tracking-tight"
              >
                Make a contribution
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Choose any amount that feels right. Payments are securely
                processed by Razorpay.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="sm:flex-1">
                <a
                  href={RAZORPAY_PAYMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Razorpay
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/">Continue listening</Link>
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-border/60 pt-5 text-xs text-muted-foreground">
              <ShieldCheck
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>Secure payment handled by Razorpay</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
