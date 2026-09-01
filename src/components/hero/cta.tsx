import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative flex min-h-[65dvh] items-center overflow-hidden bg-cover bg-left" style={{
      backgroundImage: "url('/cta-image.png')"
    }}>
      <div className="relative z-10 mx-auto text-center max-w-7xl px-6">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-secondary-foreground leading-tight md:text-6xl">
            Bring your vision to light
          </h2>
          <p className="leading-relaxed max-w-[80%] mx-auto">
            From statement pieces to complete lighting solutions, we&apos;ll help you find fixtures that suit your space and style.
          </p>
          <Button size="lg" className="group mx-auto">
            Get a Free Consultation
          </Button>
        </div>
      </div>
    </section>
  );
}
