import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type FeaturedCategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
};

export function FeaturedCategories({
  categories,
}: {
  categories: FeaturedCategoryItem[];
}) {
  if (categories.length === 0) return null;

  return (
    <section>
      <div className="grid grid-cols-12 gap-4">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className={cn(
              "relative overflow-hidden bg-contain p-6 min-h-66 h-full",
              {
                "col-span-12 row-span-1 md:col-span-6 lg:col-span-8":
                  index === 0,
                "col-span-6 row-span-1 min-h-66 md:col-span-6 lg:col-span-4 lg:row-span-2":
                  index === 1,
                "col-span-6 row-span-1 h-66 md:col-span-6 lg:col-span-4":
                  index === 2,
                "col-span-12 row-span-1 min-h-62 md:col-span-6 lg:col-span-4":
                  index === 3,
              },
            )}
          >
            <h3 className="text-xl font-normal tracking-tight text-primary">
              {category.name}
            </h3>
            <p className="uppercase tracking-widest text-gold">
              {category.productCount} Designs
            </p>

            <Image
              src={category.image}
              width={1024}
              height={1024}
              alt={`${category.name} lighting collection`}
              className="absolute -z-10 right-0 top-0 h-full w-full object-cover brightness-180"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
