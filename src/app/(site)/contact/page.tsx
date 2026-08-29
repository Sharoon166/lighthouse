import type { Metadata } from "next";
import { CTA } from "@/components/hero/cta";
import { ContactForm } from "@/components/shared/contact-form";
import { PageHero } from "@/components/shared/page-hero";
import { ShowroomTabs } from "@/components/shared/showroom-tabs";

export const metadata: Metadata = {
  title: "Contact | Lighthouse",
  description:
    "Get in touch with Lighthouse — questions, complaints, or product help. Visit our showrooms in Islamabad, Lahore, and Karachi.",
};

export default function ContactPage() {
  return (
    <main>
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
      <section className="container">
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
