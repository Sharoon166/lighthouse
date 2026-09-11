import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Privacy Policy | Lighthouse",
  description:
    "Learn how Lighthouse collects, uses, and protects your personal information.",
  openGraph: {
    title: "Privacy Policy | Lighthouse",
    description:
      "Learn how Lighthouse collects, uses, and protects your personal information.",
    type: "website",
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHero
        title="Privacy Policy"
        description="Last updated: January 2026"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />

      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-neutral max-w-none prose-headings:font-heading prose-headings:text-secondary prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-a:text-gold hover:prose-a:underline prose-strong:text-foreground">
            {/* Introduction */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-12 not-prose">
              <p className="text-lg text-foreground leading-relaxed">
                Light House ("we," "our," or "us") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our
                website lighthouse.pk or make a purchase.
              </p>
            </div>

            <h2>Information We Collect</h2>

            <h3>Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide
              to us when you:
            </p>
            <ul>
              <li>Register on our website</li>
              <li>Place an order</li>
              <li>Subscribe to our newsletter</li>
              <li>Contact us via phone, email, or contact form</li>
              <li>Participate in promotions or surveys</li>
            </ul>

            <div className="bg-muted/30 border border-border rounded-xl p-6 my-8 not-prose">
              <h4 className="font-semibold text-foreground mb-4">
                Information We May Collect
              </h4>
              <ul className="grid sm:grid-cols-2 gap-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  Full Name
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  Email Address
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  Phone Number
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  Shipping Address
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  Billing Address
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  Payment Information
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4 italic">
                * Payment information is processed securely through third-party
                payment processors
              </p>
            </div>

            <h3>Automatically Collected Information</h3>
            <p>
              When you visit our website, we automatically collect certain
              information about your device, including your IP address, browser
              type, operating system, referring URLs, and information about how
              you interact with our website.
            </p>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>

            <div className="grid gap-4 my-8 not-prose">
              {[
                {
                  title: "Order Fulfillment",
                  desc: "Process and fulfill your orders",
                },
                {
                  title: "Communication",
                  desc: "Send order confirmations and shipping updates",
                },
                {
                  title: "Support",
                  desc: "Respond to inquiries and provide customer support",
                },
                {
                  title: "Marketing",
                  desc: "Send marketing communications (with your consent)",
                },
                {
                  title: "Improvement",
                  desc: "Improve our website and services",
                },
                {
                  title: "Security",
                  desc: "Prevent fraud and enhance security",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card"
                >
                  <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-gold"></span>
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information with:
            </p>
            <ul>
              <li>
                Service providers who assist in our operations (payment
                processors, shipping carriers)
              </li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your consent</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction.
            </p>

            <h2>Your Rights</h2>
            <div className="bg-muted/30 border border-border rounded-xl p-6 my-8 not-prose">
              <h4 className="font-semibold text-foreground mb-4">
                You Have the Right To:
              </h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2"></span>
                  <span>
                    <strong className="text-foreground">Access</strong> your
                    personal information
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2"></span>
                  <span>
                    <strong className="text-foreground">Correct</strong>{" "}
                    inaccurate information
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2"></span>
                  <span>
                    <strong className="text-foreground">
                      Request deletion
                    </strong>{" "}
                    of your information
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2"></span>
                  <span>
                    <strong className="text-foreground">Opt-out</strong> of
                    marketing communications
                  </span>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="bg-card border border-border rounded-2xl p-8 mt-12 not-prose">
              <h3 className="text-xl font-heading text-secondary mb-4">
                Questions About Privacy?
              </h3>
              <p className="text-muted-foreground mb-6">
                If you have questions about this Privacy Policy, please contact
                us:
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
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
                  <p className="font-medium text-foreground">Address</p>
                  <p className="text-muted-foreground">Islamabad, Pakistan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
