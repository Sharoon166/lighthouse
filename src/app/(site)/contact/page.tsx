import type { Metadata } from "next";
import { CTA } from "@/components/hero/cta";
import { ContactForm } from "@/components/shared/contact-form";
import { PageHero } from "@/components/shared/page-hero";
import { ShowroomTabs } from "@/components/shared/showroom-tabs";
import { getLocalBusinessSchema } from "@/lib/seo-schemas";

export const metadata: Metadata = {
  title: "Contact | Lighthouse",
  description:
    "Get in touch with Lighthouse — questions, product help, or showroom visits. Visit us in Blue Area, Islamabad.",
  openGraph: {
    title: "Contact | Lighthouse",
    description:
      "Get in touch with Lighthouse — questions, product help, or showroom visits. Visit us in Blue Area, Islamabad.",
    type: "website",
  },
  alternates: {
    canonical: "/contact",
    languages: {
      "en-pk": "/contact",
      "x-default": "/contact",
    },
  },
};

export default function ContactPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getLocalBusinessSchema()) }}
      />
      <PageHero
        title="Let's talk"
        description="Whether you have a project in mind, a product question, or simply want to visit a showroom — we're here. Every enquiry is answered within one business day."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      {/* Contact Form + Info */}
      <section className="container">
        <ContactForm />
      </section>

      {/* Visit Our Showroom */}
      <section id="showrooms" className="container">
        <div className="space-y-3 mb-8">
          <h2>Visit Our Showroom</h2>
        </div>
        <ShowroomTabs />
      </section>

      {/* CTA */}
      <div className="container">
        <CTA />
      </div>
    </main>
  );
}
