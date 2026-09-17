import {
  MoneyBag01Icon,
  Recycle01Icon,
  TruckIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Shipping and Returns | Lighthouse",
  description:
    "Details on Lighthouse shipping across Pakistan, delivery timelines, cash-on-delivery options, and our hassle-free return and exchange policy.",
  openGraph: {
    title: "Shipping and Returns | Lighthouse",
    description:
      "Details on Lighthouse shipping across Pakistan, delivery timelines, cash-on-delivery options, and our hassle-free return and exchange policy.",
    type: "website",
  },
  alternates: {
    canonical: "/shipping",
    languages: {
      "en-pk": "/shipping",
      "x-default": "/shipping",
    },
  },
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHero
        title="Shipping & Returns"
        description="Fast delivery across Pakistan with easy returns"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Shipping & Returns" },
        ]}
      />

      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-card border border-border rounded-2xl p-6 text-center hover:border-gold/30 transition-colors">
              <div className="size-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <HugeiconsIcon
                  icon={TruckIcon}
                  size={28}
                  className="text-gold"
                />
              </div>
              <h3 className="font-heading text-lg text-secondary mb-2">
                Free Shipping
              </h3>
              <p className="text-sm text-muted-foreground">
                On orders above PKR 15,000
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 text-center hover:border-gold/30 transition-colors">
              <div className="size-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <HugeiconsIcon
                  icon={Recycle01Icon}
                  size={28}
                  className="text-gold"
                />
              </div>
              <h3 className="font-heading text-lg text-secondary mb-2">
                Easy Returns
              </h3>
              <p className="text-sm text-muted-foreground">
                7-day return policy
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 text-center hover:border-gold/30 transition-colors">
              <div className="size-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <HugeiconsIcon
                  icon={MoneyBag01Icon}
                  size={28}
                  className="text-gold"
                />
              </div>
              <h3 className="font-heading text-lg text-secondary mb-2">
                Quick Refunds
              </h3>
              <p className="text-sm text-muted-foreground">
                Within 5-7 business days
              </p>
            </div>
          </div>

          <div className="prose prose-neutral max-w-none prose-headings:font-heading prose-headings:text-secondary prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-a:text-gold hover:prose-a:underline prose-strong:text-foreground">
            {/* Shipping Section */}
            <h2>Shipping Information</h2>

            <h3>Delivery Coverage</h3>
            <p>
              We deliver to all major cities and towns across Pakistan,
              including:
            </p>

            <div className="grid sm:grid-cols-3 gap-3 my-6 not-prose">
              {[
                "Karachi",
                "Lahore",
                "Islamabad",
                "Rawalpindi",
                "Faisalabad",
                "Multan",
                "Peshawar",
                "Quetta",
                "Hyderabad",
              ].map((city) => (
                <div
                  key={city}
                  className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  <span className="text-sm text-foreground">{city}</span>
                </div>
              ))}
            </div>
            <p className="text-sm italic">
              If your area is not listed, please{" "}
              <Link href="/contact" className="text-gold hover:underline">
                contact us
              </Link>{" "}
              to confirm delivery availability.
            </p>

            <h3>Delivery Times</h3>
            <div className="overflow-x-auto my-6 not-prose">
              <table className="w-full border border-border rounded-xl overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 border-b border-border font-semibold text-foreground">
                      Location
                    </th>
                    <th className="text-left p-4 border-b border-border font-semibold text-foreground">
                      Standard
                    </th>
                    <th className="text-left p-4 border-b border-border font-semibold text-foreground">
                      Express
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Major Cities</td>
                    <td className="p-4 text-muted-foreground">
                      3-5 business days
                    </td>
                    <td className="p-4 text-muted-foreground">
                      1-2 business days
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-foreground">Other Cities</td>
                    <td className="p-4 text-muted-foreground">
                      5-7 business days
                    </td>
                    <td className="p-4 text-muted-foreground">
                      2-3 business days
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 text-foreground">Remote Areas</td>
                    <td className="p-4 text-muted-foreground">
                      7-14 business days
                    </td>
                    <td className="p-4 text-muted-foreground italic">
                      Not available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Shipping Charges</h3>
            <div className="space-y-3 not-prose my-6">
              <div className="flex items-start gap-3 p-4 border border-border rounded-lg bg-card">
                <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <span className="text-gold font-bold text-sm">✓</span>
                </span>
                <div>
                  <p className="font-medium text-foreground">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    Orders above PKR 15,000
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border border-border rounded-lg bg-card">
                <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <span className="text-gold font-bold text-sm">📦</span>
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    Calculated Shipping
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Based on weight and location (shown at checkout)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border border-border rounded-lg bg-card">
                <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <span className="text-gold font-bold text-sm">⚡</span>
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    Express Delivery
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Additional charges apply (select cities only)
                  </p>
                </div>
              </div>
            </div>

            <h3>Order Tracking</h3>
            <p>
              Once your order is shipped, you will receive an SMS and email with
              your tracking number. You can track your order status on our
              website or through the courier's tracking portal.
            </p>

            <hr className="my-12 border-border" />

            {/* Returns Section */}
            <h2>Returns Policy</h2>

            <h3>Return Eligibility</h3>
            <div className="bg-muted/30 border border-border rounded-xl p-6 my-6 not-prose">
              <h4 className="font-semibold text-foreground mb-3">
                Return Conditions:
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2"></span>
                  Request within 7 days of delivery
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2"></span>
                  Products in original, unused condition
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2"></span>
                  Original packaging, tags, and accessories included
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2"></span>
                  Not custom-made or made-to-order
                </li>
              </ul>
            </div>

            <h3>Non-Returnable Items</h3>
            <ul>
              <li>Custom or made-to-order products</li>
              <li>Products without original packaging</li>
              <li>Used or installed products</li>
              <li>Clearance or sale items (final sale)</li>
              <li>Gift cards</li>
            </ul>

            <h3>How to Initiate a Return</h3>
            <div className="grid gap-3 my-6 not-prose">
              {[
                {
                  step: "1",
                  text: "Contact us at hello@lighthouse.pk or call +92 21 3456 7890",
                },
                {
                  step: "2",
                  text: "Provide your order number and reason for return",
                },
                {
                  step: "3",
                  text: "Wait for return approval (usually within 24 hours)",
                },
                {
                  step: "4",
                  text: "Pack the product securely in original packaging",
                },
                {
                  step: "5",
                  text: "Our courier will pick up from your location",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card"
                >
                  <span className="w-8 h-8 rounded-full bg-gold text-background flex items-center justify-center shrink-0 font-bold">
                    {item.step}
                  </span>
                  <p className="text-muted-foreground pt-1">{item.text}</p>
                </div>
              ))}
            </div>

            <h3>Return Shipping Costs</h3>
            <div className="space-y-3 my-6 not-prose">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                <span className="text-foreground font-medium">
                  Defective/Damaged
                </span>
                <span className="text-gold font-semibold">FREE</span>
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                <span className="text-foreground font-medium">
                  Wrong Product Received
                </span>
                <span className="text-gold font-semibold">FREE</span>
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                <span className="text-foreground font-medium">
                  Change of Mind
                </span>
                <span className="text-muted-foreground">PKR 200-500</span>
              </div>
            </div>

            <hr className="my-12 border-border" />

            {/* Refunds Section */}
            <h2>Refunds</h2>

            <h3>Refund Process</h3>
            <div className="grid gap-3 my-6 not-prose">
              {[
                {
                  step: "1",
                  text: "We receive and inspect the returned product",
                },
                { step: "2", text: "Refund is approved if conditions are met" },
                {
                  step: "3",
                  text: "Refund is processed within 5-7 business days",
                },
                {
                  step: "4",
                  text: "Amount is credited to original payment method",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card"
                >
                  <span className="w-8 h-8 rounded-full bg-gold text-background flex items-center justify-center shrink-0 font-bold">
                    {item.step}
                  </span>
                  <p className="text-muted-foreground pt-1">{item.text}</p>
                </div>
              ))}
            </div>

            <h3>Refund Methods</h3>
            <ul>
              <li>
                <strong>Card payments:</strong> Refunded to the same card
              </li>
              <li>
                <strong>Bank transfer:</strong> Refunded to the same bank
                account
              </li>
              <li>
                <strong>COD orders:</strong> Bank transfer, JazzCash, or
                Easypaisa
              </li>
              <li>
                <strong>Store credit:</strong> Available upon request with 10%
                bonus value
              </li>
            </ul>

            <hr className="my-12 border-border" />

            {/* Exchanges */}
            <h2>Exchanges</h2>
            <p>
              Want a different product, color, or finish? We're happy to
              exchange your order subject to availability. Contact us within 7
              days of delivery to arrange an exchange.
            </p>
            <div className="bg-muted/30 border border-border rounded-xl p-6 my-6 not-prose">
              <h4 className="font-semibold text-foreground mb-3">
                Exchange Conditions:
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2"></span>
                  Product availability
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2"></span>
                  Original product being in unused, resalable condition
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2"></span>
                  Price difference (if any) to be paid or refunded
                </li>
              </ul>
            </div>

            <hr className="my-12 border-border" />

            {/* Damaged Products */}
            <h2>Damaged or Defective Products</h2>
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 my-6 not-prose">
              <p className="text-foreground mb-3">
                <strong>Received a damaged or defective product?</strong>
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                Contact us within 24 hours of delivery with photos of the
                damage.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-gold">✓</span>
                  Free pickup of damaged product
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold">✓</span>
                  Replacement at no extra cost, OR
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold">✓</span>
                  Full refund including shipping charges
                </li>
              </ul>
            </div>

            {/* Contact CTA */}
            <div className="bg-card border border-border rounded-2xl p-8 mt-12 not-prose">
              <h3 className="text-xl font-heading text-secondary mb-4">
                Need Help?
              </h3>
              <p className="text-muted-foreground mb-6">
                For questions about shipping, returns, or exchanges, contact our
                customer support:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a
                    href="mailto:hello@lighthouse.pk"
                    className="text-gold hover:underline"
                  >
                    hello@lighthouse.pk
                  </a>
                </div>
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <a
                    href="tel:+922134567890"
                    className="text-gold hover:underline"
                  >
                    +92 21 3456 7890
                  </a>
                </div>
                <div>
                  <p className="font-medium text-foreground">WhatsApp</p>
                  <a
                    href="https://wa.me/923001234567"
                    className="text-gold hover:underline"
                  >
                    +92 300 1234 567
                  </a>
                </div>
                <div>
                  <p className="font-medium text-foreground">Working Hours</p>
                  <p className="text-muted-foreground">Mon-Sat, 9AM-7PM PKT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
