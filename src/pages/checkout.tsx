import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/components/CartContext";
import { SectionLabel } from "@/components/Reveal";
import { stripePromise } from "@/lib/stripe";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ShieldCheck, Lock, ArrowLeft, ExternalLink, Sparkles } from "lucide-react";

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zip: string;
}

function StripeElementsForm({
  amount,
  onBack,
  onSuccess,
}: {
  amount: number;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "An unexpected payment error occurred.");
        setLoading(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess();
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to process payment.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-[#141311] border border-[#2e2a22]">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2e2a22] text-[#c5a880] text-xs font-mono uppercase tracking-wider">
          <Lock size={14} />
          <span>Encrypted Card Entry via Stripe</span>
        </div>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="btn-ghost-gold py-3 text-xs"
        >
          <ArrowLeft size={14} className="inline mr-1" />
          Edit Shipping
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="btn-gold flex-1 py-3 text-xs"
        >
          {loading ? "Authenticating Payment..." : `Authorize $${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [form, setForm] = useState<CustomerForm>(() => {
    try {
      const saved = localStorage.getItem("lira_checkout_customer");
      return saved
        ? JSON.parse(saved)
        : {
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            country: "United States",
            zip: "",
          };
    } catch {
      return {
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "United States",
        zip: "",
      };
    }
  });

  const [clientSecret, setClientSecret] = useState<string>("");
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setFormError("");
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!form.address.trim()) {
      setFormError("Please enter your street address.");
      return;
    }
    if (!form.city.trim() || !form.zip.trim()) {
      setFormError("Please enter your city and postal ZIP code.");
      return;
    }

    try {
      localStorage.setItem("lira_checkout_customer", JSON.stringify(form));
    } catch {
      // ignore
    }

    setIsInitializingPayment(true);

    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          customer: form,
        }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Payment server is unreachable. Please verify serverless deployment.");
      }

      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || "Unable to initialize Stripe payment intent.");
      }

      setClientSecret(data.clientSecret);
      setStep("payment");
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to initialize payment gateway. Please try again.");
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const handleStripeCheckoutSession = async () => {
    if (!form.name || !form.email) {
      setFormError("Please provide at least your Name and Email to proceed.");
      return;
    }

    setIsSessionLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          customer: form,
        }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Checkout service is unreachable. Please verify serverless deployment.");
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Unable to start Stripe Hosted Checkout");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Unable to redirect to Stripe Checkout.");
      setIsSessionLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate("/payment-success");
  };

  if (cart.length === 0) {
    return (
      <div className="container-luxe pt-40 pb-24 text-center max-w-xl">
        <SectionLabel>Votre Bag</SectionLabel>
        <h1 className="mt-4 font-serif text-4xl">Your Bag is Empty</h1>
        <p className="mt-4 text-foreground/70">
          Explore our latest high jewelry collections and discover timeless heirlooms.
        </p>
        <Link to="/shop" className="btn-gold mt-8 inline-block">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe pt-32 pb-24">
      <div className="text-center">
        <SectionLabel>Maison Lira Checkout</SectionLabel>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">
          Secure <em className="italic gradient-gold-text">Payment</em>
        </h1>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#c5a880] font-mono uppercase tracking-widest">
          <ShieldCheck size={16} />
          <span>256-Bit SSL Encrypted Transaction</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 mt-12">
        {/* Main Flow (Left Column) */}
        <div className="lg:col-span-7">
          {step === "shipping" && (
            <div className="bg-card/40 border border-border p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="font-serif text-2xl text-foreground">
                  1. Shipping & Patron Dossier
                </h2>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#c5a880]">
                  Step 1 of 2
                </span>
              </div>

              {formError && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
                  ⚠️ {formError}
                </div>
              )}

              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-foreground/70 font-mono">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      placeholder="e.g., Eleanor Vance"
                      onChange={handleChange}
                      required
                      className="w-full bg-[#141311] border border-border p-3 text-sm focus:border-gold outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-foreground/70 font-mono">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      placeholder="eleanor@example.com"
                      onChange={handleChange}
                      required
                      className="w-full bg-[#141311] border border-border p-3 text-sm focus:border-gold outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-foreground/70 font-mono">
                    Phone (for courier delivery notifications)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    placeholder="+1 (555) 019-2834"
                    onChange={handleChange}
                    className="w-full bg-[#141311] border border-border p-3 text-sm focus:border-gold outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-foreground/70 font-mono">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    placeholder="740 Park Avenue, Apt 14B"
                    onChange={handleChange}
                    required
                    className="w-full bg-[#141311] border border-border p-3 text-sm focus:border-gold outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-foreground/70 font-mono">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      placeholder="New York"
                      onChange={handleChange}
                      required
                      className="w-full bg-[#141311] border border-border p-3 text-sm focus:border-gold outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-foreground/70 font-mono">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      placeholder="United States"
                      onChange={handleChange}
                      required
                      className="w-full bg-[#141311] border border-border p-3 text-sm focus:border-gold outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-foreground/70 font-mono">
                      ZIP / Postal Code *
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={form.zip}
                      placeholder="10021"
                      onChange={handleChange}
                      required
                      className="w-full bg-[#141311] border border-border p-3 text-sm focus:border-gold outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isInitializingPayment}
                    className="btn-gold flex-1 py-3 text-xs tracking-widest"
                  >
                    {isInitializingPayment
                      ? "Connecting to Stripe..."
                      : "Proceed to Payment Option"}
                  </button>

                  <button
                    type="button"
                    onClick={handleStripeCheckoutSession}
                    disabled={isSessionLoading}
                    className="btn-ghost-gold py-3 text-xs tracking-widest inline-flex items-center justify-center gap-1.5"
                  >
                    <span>{isSessionLoading ? "Redirecting..." : "Stripe Hosted Page"}</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === "payment" && clientSecret && (
            <div className="bg-card/40 border border-border p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="font-serif text-2xl text-foreground">
                    2. Payment Authentication
                  </h2>
                  <p className="text-xs text-foreground/60 mt-1">
                    Shipping to: <span className="text-[#c5a880]">{form.name}</span>, {form.address}, {form.city}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#c5a880]">
                  Step 2 of 2
                </span>
              </div>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "night",
                    variables: {
                      colorPrimary: "#c5a880",
                      colorBackground: "#141311",
                      colorText: "#f4efe6",
                      colorDanger: "#f87171",
                      fontFamily: 'Inter, system-ui, sans-serif',
                      borderRadius: "2px",
                    },
                    rules: {
                      ".Input": {
                        border: "1px solid #2e2a22",
                        boxShadow: "none",
                      },
                      ".Input:focus": {
                        border: "1px solid #c5a880",
                        boxShadow: "0 0 0 1px #c5a880",
                      },
                      ".Tab": {
                        border: "1px solid #2e2a22",
                        backgroundColor: "#141311",
                      },
                      ".Tab--selected": {
                        borderColor: "#c5a880",
                        backgroundColor: "#1c1a17",
                      },
                    },
                  },
                }}
              >
                <StripeElementsForm
                  amount={subtotal}
                  onBack={() => setStep("shipping")}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>

              <div className="pt-4 border-t border-border/60 text-center">
                <button
                  type="button"
                  onClick={handleStripeCheckoutSession}
                  disabled={isSessionLoading}
                  className="text-xs text-[#c5a880] hover:underline font-mono uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <span>Prefer full-screen Stripe Checkout? Click here</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary (Right Column) */}
        <div className="lg:col-span-5">
          <aside className="bg-card/70 border border-border p-6 md:p-8 sticky top-28 space-y-6">
            <h3 className="font-serif text-2xl flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-mono text-[#c5a880]">
                {cart.reduce((t, i) => t + i.quantity, 0)} {cart.length === 1 ? "Item" : "Items"}
              </span>
            </h3>

            <div className="hairline" />

            <div className="max-h-72 overflow-y-auto space-y-4 pr-1 scrollbar-luxe">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover border border-border/80"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-foreground/60 font-mono">
                      Qty: {item.quantity} × ${item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-sm text-[#c5a880]">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hairline" />

            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between text-foreground/70">
                <dt>Subtotal</dt>
                <dd>${subtotal.toFixed(2)}</dd>
              </div>

              <div className="flex justify-between text-foreground/70">
                <dt>Insured Atelier Delivery</dt>
                <dd className="text-[#c5a880] font-mono uppercase text-[10px]">
                  Complimentary
                </dd>
              </div>

              <div className="flex justify-between text-foreground/70">
                <dt>Custom Hallmark & Engraving</dt>
                <dd className="text-[#c5a880] font-mono uppercase text-[10px]">
                  Included
                </dd>
              </div>

              <div className="hairline my-3" />

              <div className="flex justify-between items-baseline pt-2">
                <dt className="text-xs tracking-[0.25em] uppercase text-foreground/80 font-mono">
                  Total
                </dt>
                <dd className="font-serif text-3xl gradient-gold-text">
                  ${subtotal.toFixed(2)}
                </dd>
              </div>
            </dl>

            <div className="bg-[#141311] border border-[#2e2a22] p-3 text-[11px] text-foreground/70 space-y-1.5 font-mono">
              <div className="flex items-center gap-2 text-[#c5a880]">
                <Sparkles size={13} />
                <span className="uppercase tracking-wider text-[10px]">Maison Guarantee</span>
              </div>
              <p className="text-[10px] leading-relaxed text-foreground/60">
                Every piece is accompanied by a signed Certificate of Provenance, velvet archival box, and Lifetime Atelier Care.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
