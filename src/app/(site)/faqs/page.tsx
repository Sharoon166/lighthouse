import { CallIcon, MailIcon, WhatsappIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import { FAQAccordion } from "@/components/shared/faq-accordion";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Lighthouse",
  description:
    "Answers about Lighthouse lighting — orders, payment, shipping across Pakistan, delivery times, and return policies.",
  openGraph: {
    title: "Frequently Asked Questions | Lighthouse",
    description:
      "Answers about Lighthouse lighting — orders, payment, shipping across Pakistan, delivery times, and return policies.",
    type: "website",
  },
  alternates: {
    canonical: "/faqs",
    languages: {
      "en-pk": "/faqs",
      "x-default": "/faqs",
    },
  },
};

const FAQ_SECTIONS = [
  {
    title: "Orders & Payment",
    description:
      "Everything you need to know about placing orders and payment options",
    faqs: [
      {
        question: "How can I place an order?",
        answer:
          "You can place an order directly through our website by adding products to your cart and proceeding to checkout. Alternatively, you can call us at +92 21 3456 7890 or message us on WhatsApp at +92 300 1234 567 to place an order.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept Credit/Debit Cards, Bank Transfer, Cash on Delivery (COD), JazzCash, and Easypaisa. All online payments are processed securely through trusted payment gateways.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer:
          "You can modify or cancel your order within 2 hours of placing it. Please contact us immediately at hello@lighthouse.pk or call +92 21 3456 7890. Once the order has been processed or shipped, modifications are not possible.",
      },
      {
        question: "How will I know if my order is confirmed?",
        answer:
          "After placing your order, you will receive a confirmation email and/or SMS with your order details. You can also check your order status in the 'My Account' section if you have an account.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    description: "Delivery coverage, shipping times, and tracking information",
    faqs: [
      {
        question: "Where do you deliver?",
        answer:
          "We deliver to all major cities and towns across Pakistan. Remote areas may have longer delivery times.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Standard delivery takes 3-7 business days for major cities and 7-14 business days for remote areas. Express delivery (1-3 business days) is available for select cities at an additional cost.",
      },
      {
        question: "What are the shipping charges?",
        answer:
          "Shipping charges are calculated based on your location and order weight. Orders above PKR 15,000 qualify for free shipping within Pakistan. Exact shipping costs are shown at checkout before payment.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Yes, once your order is shipped, you will receive a tracking number via SMS and email. You can use this number to track your order on our website or the courier's website.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    description: "Our return policy and refund process",
    faqs: [
      {
        question: "What is your return policy?",
        answer:
          "We accept returns within 7 days of delivery. Products must be in their original condition, unused, and in original packaging. Custom or made-to-order items are non-returnable unless defective.",
      },
      {
        question: "How do I initiate a return?",
        answer:
          "Contact us at hello@lighthouse.pk or call +92 21 3456 7890 with your order number. We will arrange a pickup from your location. Return shipping is free for defective items; for other returns, shipping costs may apply.",
      },
      {
        question: "When will I receive my refund?",
        answer:
          "Once we receive and inspect the returned item, refunds are processed within 5-7 business days. Refunds are credited to your original payment method. For COD orders, we can transfer the refund to your bank account or JazzCash/Easypaisa.",
      },
      {
        question: "Can I exchange a product?",
        answer:
          "Yes, exchanges are subject to product availability. Contact us within 7 days of delivery, and we'll help you exchange for a different product, color, or finish.",
      },
    ],
  },
  {
    title: "Products & Installation",
    description: "Product warranties, installation services, and more",
    faqs: [
      {
        question: "Do your products come with a warranty?",
        answer:
          "Yes, all our products come with a manufacturer's warranty ranging from 1-5 years depending on the product. Warranty details are included in the product description and packaging.",
      },
      {
        question: "Do you offer installation services?",
        answer:
          "Yes, we offer professional installation services in major cities. Installation charges vary based on the product type and complexity. Contact us for a quote.",
      },
      {
        question: "Are bulbs included with the fixtures?",
        answer:
          "Some fixtures come with integrated LED lights, while others require separate bulbs. Product descriptions clearly mention whether bulbs are included. You can also purchase compatible bulbs from our store.",
      },
      {
        question: "Can I see the products in person before buying?",
        answer:
          "We have a showroom in Islamabad where you can view our collection. We recommend calling ahead to confirm availability of specific products. Appointments are recommended for weekends.",
      },
    ],
  },
];

export default function FAQsPage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHero
        title="Frequently Asked Questions"
        description="Find answers to common questions about our products, orders, and services"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
      />

      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="text-center mb-16">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Can't find the answer you're looking for? Reach out to our{" "}
              <Link
                href="/contact"
                className="text-gold hover:underline font-medium"
              >
                customer support team
              </Link>
              .
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-16">
            {FAQ_SECTIONS.map((section) => (
              <article key={section.title}>
                <div className="mb-8">
                  <h2 className="text-2xl font-heading text-secondary mb-2">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground">{section.description}</p>
                </div>
                <FAQAccordion items={section.faqs} />
              </article>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-20 border-t border-border pt-16">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-heading text-secondary mb-3">
                  Still have questions?
                </h3>
                <p className="text-muted-foreground">
                  We're here to help. Contact our support team through any of
                  these channels.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <a
                  href="mailto:hello@lighthouse.pk"
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-background hover:border-gold/30 hover:bg-muted/30 transition-all group"
                >
                  <div className="size-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <HugeiconsIcon
                      icon={MailIcon}
                      size={24}
                      className="text-gold"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Email Us</p>
                    <p className="text-sm text-muted-foreground">
                      hello@lighthouse.pk
                    </p>
                  </div>
                </a>

                <a
                  href="tel:+922134567890"
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-background hover:border-gold/30 hover:bg-muted/30 transition-all group"
                >
                  <div className="size-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <HugeiconsIcon
                      icon={CallIcon}
                      size={24}
                      className="text-gold"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Call Us</p>
                    <p className="text-sm text-muted-foreground">
                      +92 21 3456 7890
                    </p>
                  </div>
                </a>

                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-background hover:border-gold/30 hover:bg-muted/30 transition-all group"
                >
                  <div className="size-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <HugeiconsIcon
                      icon={WhatsappIcon}
                      size={24}
                      className="text-gold"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">
                      +92 300 1234 567
                    </p>
                  </div>
                </a>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Working Hours: Monday - Saturday, 9:00 AM - 7:00 PM PKT
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
