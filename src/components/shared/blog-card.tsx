import Image from "next/image";
import Link from "next/link";

interface BlogCardProps {
  category: string;
  title: string;
  description: string;
  readTime: string;
  imageUrl: string;
}

export function BlogCard({
  category,
  title,
  description,
  readTime,
  imageUrl,
}: BlogCardProps) {
  return (
    <Link href="#" className="group bg-white">
      <div className="overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          width={600}
          height={400}
          className="aspect-3/2 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="pt-5 pb-2 border p-4">
        <span className="uppercase text-sm font-semibold tracking-[0.2em] text-gold">
          {category}
        </span>
        <h3 className="mt-3 font-heading text-lg leading-snug line-clamp-2" title={title}>
          {title}
        </h3>
        <p className="mt-3 leading-relaxed text-muted-foreground line-clamp-2">
          {description}
        </p>
        <span className="mt-4 block text-xs text-muted-foreground">
          {readTime}
        </span>
      </div>
    </Link>
  );
}
