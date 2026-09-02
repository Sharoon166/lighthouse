import { ProjectCard, type ProjectItem } from "./project-card";

export function FeaturedProjects({ featured }: { featured: ProjectItem[] }) {
  const [main, ...rest] = featured;

  if (!main) return null;

  return (
    <section className="container pb-12 md:pb-16">
      <h2 className="mb-8 font-heading text-3xl font-bold">
        Featured Projects
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2 h-136 border">
        <ProjectCard
          project={main}
          className="md:row-span-2 aspect-3/2 md:aspect-auto"
        />
        {rest.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            className="h-full"
          />
        ))}
      </div>
    </section>
  );
}
