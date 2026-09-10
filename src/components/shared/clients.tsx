import { SectionHeader } from "@/components/shared/section-header";
import { clients } from "@/lib/constants";

export function Clients() {
  return (
    <section>
      <SectionHeader
        title="Our Clients"
        description="From residential homes to commercial projects, our clients trust us to bring every space to life with premium lighting."
        noCta
      />
      <div className="flex items-center max-sm:justify-center flex-wrap gap-6 sm:gap-x-18 sm:gap-y-10">
        {clients.map((client) => (
          <img
            key={client.id}
            src={client.imageURL}
            alt={client.name}
            className="size-32 object-contain"
            title={client.name}
            suppressHydrationWarning
          />
        ))}
      </div>
    </section>
  );
}
