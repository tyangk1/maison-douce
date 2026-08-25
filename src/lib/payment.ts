/**
 * Payment provider abstraction.
 *
 * Checkout talks only to this interface. Swapping the mock for Stripe means
 * implementing `PaymentProvider` (create intent -> confirm) and registering it
 * here — no changes to the checkout domain, order creation, or UI flow.
 */

export type PaymentRequest = {
  orderNumber: string;
  amountCents: number;
  currency: "gbp";
  metadata: Record<string, string>;
};

export type PaymentResult =
  | { ok: true; provider: string; reference: string }
  | { ok: false; error: string };

export interface PaymentProvider {
  readonly name: string;
  charge(req: PaymentRequest): Promise<PaymentResult>;
}

/**
 * Mock adapter — clearly labelled, deterministic, and never silently pretends
 * to be a real gateway. Card numbers ending in "0002" simulate decline so the
 * failure path is testable.
 */
class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async charge(req: PaymentRequest): Promise<PaymentResult> {
    await new Promise((r) => setTimeout(r, 350));
    const card = req.metadata.cardNumber?.replace(/\s+/g, "") ?? "";
    if (card.endsWith("0002")) {
      return { ok: false, error: "Your card was declined by the payment provider." };
    }
    if (!/^\d{12,19}$/.test(card)) {
      return { ok: false, error: "Enter a valid card number (e.g. 4242 4242 4242 4242)." };
    }
    const reference = `mock_${req.orderNumber}_${Date.now().toString(36)}`;
    return { ok: true, provider: this.name, reference };
  }
}

const providers: Record<string, PaymentProvider> = {
  mock: new MockPaymentProvider(),
  // stripe: new StripePaymentProvider(process.env.STRIPE_SECRET_KEY), // add later
};

export function getPaymentProvider(name = "mock"): PaymentProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown payment provider: ${name}`);
  return provider;
}
