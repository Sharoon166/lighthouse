import { SectionHeader } from "@/components/shared/section-header";
import { For } from "@/components/utils/for";
import { clients } from "@/lib/constants";

export function Clients() {
  return (
    <section>
      <SectionHeader
        title="Our Clients"
        description="From residential homes to commercial projects, our clients trust us to bring every space to life with premium lighting."
        noCta
      />
      <div className="flex items-center max-md:justify-center flex-wrap gap-x-18 gap-y-10">
        <For each={clients} by={(client) => client.id}>
          {({ id, name, imageURL }) => (
            <img
              src={imageURL}
              alt={name}
              className="size-32"
              title={name}
              suppressHydrationWarning
            />
          )}
        </For>
      </div>
    </section>
  );
}
