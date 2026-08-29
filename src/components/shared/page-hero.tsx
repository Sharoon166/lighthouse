import {
  Breadcrumb,
  type BreadcrumbItem,
} from "@/components/shared/breadcrumb";

interface PageHeroProps {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
}

export function PageHero({ title, description, breadcrumb }: PageHeroProps) {
  return (
    <section className="bg-noise relative overflow-hidden grid py-10 min-h-[55dvh]">
      <Breadcrumb items={breadcrumb} className="container" />
      <div className="container">
        <div className="max-w-2xl space-y-4">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </section>
  );
}
