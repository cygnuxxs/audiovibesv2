"use client";

import Script from "next/script";
import { useState } from "react";
import { Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const amounts = [50, 100, 250, 500];

export default function ContributionForm() {
  const [amount, setAmount] = useState("100");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [message, setMessage] = useState("");

  const startPayment = async () => {
    setMessage("");
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage("Please enter your name.");
      return;
    }
    const sanitizedAmount = amount.replace(/\D/g, "");
    const amountInRupees = Number(sanitizedAmount);
    if (
      !sanitizedAmount ||
      !Number.isSafeInteger(amountInRupees) ||
      amountInRupees < 10 ||
      amountInRupees > 10000
    ) {
      setMessage("Choose an amount between ₹10 and ₹10,000.");
      return;
    }
    if (!scriptReady || !window.Razorpay) {
      setMessage("Payment is still loading. Please try again in a moment.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/contributions/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInRupees * 100, name: trimmedName }),
      });
      const result = (await response.json()) as {
        error?: string;
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        name?: string;
      };

      if (!response.ok || !result.orderId || !result.keyId) {
        throw new Error(result.error ?? "Unable to start the payment.");
      }

      const checkout = new window.Razorpay({
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        order_id: result.orderId,
        name: "AudioVibes",
        description: "Support AudioVibes",
        prefill: { name: result.name },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay with UPI",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: false },
          },
        },
        modal: { confirm_close: true },
        handler: () => setMessage("Thank you for supporting AudioVibes!"),
      });
      checkout.open();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start the payment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setMessage("Razorpay could not be loaded. Please refresh and try again.")}
      />

      <div className="mx-auto w-full max-w-lg">
        <section
          className="space-y-6 border border-border p-6 sm:p-8"
          aria-labelledby="contribution-title"
        >
          <div className="border-b border-border pb-5">
            <h2 id="contribution-title" className="text-xl font-semibold sm:text-2xl">
              Make a contribution
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose an amount and pay securely with Razorpay.
            </p>
          </div>

          <div className="grid gap-5">
            <div className="space-y-2">
              <label htmlFor="contributor-name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="contributor-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Alex Johnson"
                maxLength={100}
                autoComplete="name"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                Amount
                </span>
                <span className="text-xs text-muted-foreground">Preset or custom</span>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {amounts.map((preset) => {
                  const isSelected = amount === String(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(String(preset))}
                      className={`flex items-center justify-center rounded-md border py-2.5 text-sm font-medium transition-colors ${isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background text-foreground hover:bg-accent"
                        }`}
                    >
                      ₹{preset}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="custom-amount" className="text-sm font-medium">
                Custom Amount (₹10 - ₹10,000)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <input
                  id="custom-amount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/\D/g, "").slice(0, 5))}
                  onBlur={() => {
                    const sanitizedAmount = amount.replace(/\D/g, "");
                    setAmount(sanitizedAmount);
                  }}
                  placeholder="Enter custom amount"
                  className="h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="button"
                size="lg"
                className="h-10 w-full disabled:opacity-50"
                onClick={startPayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 size-5 animate-spin" />
                ) : (
                  <QrCode className="mr-2 size-4" />
                )}
                {isLoading ? "Preparing payment..." : "Continue to payment"}
              </Button>

              {message && (
                <div className="border border-border p-3 text-center text-sm" role="status">
                  {message}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
