import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Terms and Conditions · Light House",
  description: "Read the terms and conditions governing your use of Light House website and services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHero
        title="Terms and Conditions"
        description="Last updated: January 2026"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Terms and Conditions" }]}
      />

      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-neutral max-w-none prose-headings:font-heading prose-headings:text-secondary prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-a:text-gold hover:prose-a:underline prose-strong:text-foreground">
            
            {/* Introduction */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-12 not-prose">
              <p className="text-lg text-foreground leading-relaxed">
                By accessing or using the Light House website (lighthouse.pk) and services, 
                you agree to be bound by these Terms and Conditions. If you disagree with any 
                part of these terms, you may not access our website or services.
              </p>
            </div>

            <h2>Products and Services</h2>
            <p>
              All products displayed on our website are subject to availability. We reserve 
              the right to discontinue any product at any time. Prices are subject to change 
              without notice.
            </p>
            <p>
              We make every effort to display the colors and images of our products as accurately 
              as possible. However, we cannot guarantee that your computer monitor's display of 
              any color will be accurate.
            </p>

            <h2>Orders and Payment</h2>
            
            <h3>Placing Orders</h3>
            <p>
              When you place an order through our website, you are making an offer to purchase 
              the products in your order. We reserve the right to refuse or cancel any order 
              for any reason, including product availability, errors in pricing, or suspected fraud.
            </p>

            <h3>Pricing</h3>
            <p>
              All prices are listed in Pakistani Rupees (PKR) and include applicable taxes 
              unless otherwise stated. Shipping costs are calculated at checkout based on 
              your delivery location.
            </p>

            <div className="bg-muted/30 border border-border rounded-xl p-6 my-8 not-prose">
              <h4 className="font-semibold text-foreground mb-4">Accepted Payment Methods</h4>
              <ul className="grid sm:grid-cols-2 gap-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  Credit/Debit Cards
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  Bank Transfer
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  Cash on Delivery (COD)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  JazzCash
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  Easypaisa
                </li>
              </ul>
            </div>

            <h2>Shipping and Delivery</h2>
            <p>
              We deliver across Pakistan. Delivery times vary based on your location. 
              Please refer to our <a href="/shipping">Shipping Policy</a> for detailed information 
              about delivery times and costs.
            </p>

            <h2>Returns and Refunds</h2>
            <p>
              We want you to be completely satisfied with your purchase. If you are not 
              satisfied, you may return products within 7 days of delivery. Please refer 
              to our <a href="/shipping">Shipping and Returns</a> page for detailed information 
              about our return policy.
            </p>

            <h2>Intellectual Property</h2>
            <p>
              All content on this website, including text, graphics, logos, images, and software, 
              is the property of Light House and is protected by copyright and trademark laws.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              Light House shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages resulting from your use of our website 
              or products.
            </p>

            <h2>Governing Law</h2>
            <p>
              These Terms and Conditions are governed by and construed in accordance with 
              the laws of Pakistan.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting on our website. Your continued use of the website 
              constitutes acceptance of the modified terms.
            </p>

            {/* Contact Section */}
            <div className="bg-card border border-border rounded-2xl p-8 mt-12 not-prose">
              <h3 className="text-xl font-heading text-secondary mb-4">Questions?</h3>
              <p className="text-muted-foreground mb-6">
                For questions about these Terms and Conditions, please contact us:
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a href="mailto:hello@lighthouse.pk" className="text-gold hover:underline">
                    hello@lighthouse.pk
                  </a>
                </div>
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <a href="tel:+922134567890" className="text-gold hover:underline">
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
