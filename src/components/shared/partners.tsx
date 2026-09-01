import { SectionHeader } from "@/components/shared/section-header";
import { partners } from "@/lib/constants";

export function Partners() {
  return (
    <section>
      <SectionHeader
        title="Our Partners"
        description="We work directly with globally recognized manufacturers, so every fixture we sell is backed by proven engineering, not just looks."
        noCta
      />
      <div className="flex items-center max-md:justify-center flex-wrap gap-x-18 gay-y-10">
        {partners.map((partner) => (
          <img
            key={partner.id}
            src={partner.imageURL}
            alt={partner.name}
            className="size-32"
            title={partner.name}
            suppressHydrationWarning
          />
        ))}
      </div>
    </section>
  );
}
