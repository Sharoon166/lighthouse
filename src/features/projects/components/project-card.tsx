import Image from "next/image";
import Link from "next/link";

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  slug: string;
}

export function ProjectCard({
  project,
  className,
  imageClassName,
  overlayClassName,
}: {
  project: ProjectItem;
  className?: string;
  imageClassName?: string;
  overlayClassName?: string;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group relative block overflow-hidden bg-muted ${className ?? ""}`}
    >
      <Image
        src={project.image}
        alt={project.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${imageClassName ?? ""}`}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent ${overlayClassName ?? ""}`}
      />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-heading text-xl font-bold text-white leading-snug">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-white/70">{project.subtitle}</p>
      </div>
    </Link>
  );
}
