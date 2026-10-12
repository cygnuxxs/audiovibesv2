import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const runtime = "nodejs";

const OrderRequestSchema = z.object({
  amount: z.coerce.number().int().min(10).max(1000000),
  name: z.string().trim().min(1).max(100),
});

export async function POST(request: NextRequest) {
  const parsed = OrderRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a name and an amount between ₹10 and ₹10,000." },
      { status: 400 }
    );
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay credentials are not configured.");
    return NextResponse.json(
      { error: "Contributions are temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: parsed.data.amount,
        currency: "INR",
        receipt: `audiovibes_${Date.now()}`,
        notes: {
          contributor_name: parsed.data.name,
          purpose: "AudioVibes contribution",
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Razorpay order creation failed:", response.status, details);
      return NextResponse.json(
        { error: "Unable to start the payment. Please try again." },
        { status: 502 }
      );
    }

    const order = (await response.json()) as { id?: string; amount?: number; currency?: string };
    if (!order.id || order.amount !== parsed.data.amount || order.currency !== "INR") {
      console.error("Razorpay returned an invalid order response.");
      return NextResponse.json(
        { error: "Unable to start the payment. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      name: parsed.data.name,
    });
  } catch (error) {
    console.error("Razorpay order request failed:", error);
    return NextResponse.json(
      { error: "Unable to start the payment. Please try again." },
      { status: 502 }
    );
  }
}
