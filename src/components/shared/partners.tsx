import { SectionHeader } from "@/components/shared/section-header";
import { For } from "@/components/utils/for";
import { partners } from "@/lib/constants";

export function Partners() {
  return (
    <section>
      <SectionHeader
        title="Our Partners"
        description="We work directly with globally recognized manufacturers, so every fixture we sell is backed by proven engineering, not just looks."
        noCta
      />
      <div className="flex items-center max-md:justify-center flex-wrap gap-x-18">
        <For each={partners} by={(partner) => partner.id}>
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
