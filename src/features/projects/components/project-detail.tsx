import {
  ArrowRight01Icon,
  Briefcase01Icon,
  Calendar03Icon,
  ImageIcon,
  MapPinIcon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import type { ProjectDraftData, ProjectListItem } from "../actions";

interface ProjectDetailProps {
  project: ProjectDraftData;
  relatedProjects: ProjectListItem[];
}

export function ProjectDetail({
  project,
  relatedProjects,
}: ProjectDetailProps) {
  const year = project.publishedAt
    ? new Date(project.publishedAt).getFullYear().toString()
    : "";

  return (
    <article>
      {/* Hero */}
      <section className="relative overflow-hidden py-10">
        <nav className="container">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-foreground"
              >
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/projects"
                className="transition-colors hover:text-foreground"
              >
                Projects
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground">{project.title}</li>
          </ol>
        </nav>
        <div className="container mt-12">
          <div className="max-w-4xl space-y-4">
            <h1 className="text-secondary text-balance">{project.title}</h1>
            {project.subtitle && (
              <p className="text-lg text-pretty text-muted-foreground">
                {project.subtitle}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Meta Bar */}
      <div className="container flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
        {project.location && (
          <span className="inline-flex items-center gap-2">
            <HugeiconsIcon icon={MapPinIcon} size={16} className="text-gold" />
            Location: {project.location}
          </span>
        )}
        {year && (
          <span className="inline-flex items-center gap-2">
            <HugeiconsIcon
              icon={Calendar03Icon}
              size={16}
              className="text-gold"
            />
            Year: {year}
          </span>
        )}
        {project.client && (
          <span className="inline-flex items-center gap-2">
            <HugeiconsIcon icon={User02Icon} size={16} className="text-gold" />
            Client: {project.client}
          </span>
        )}
        {project.installationDetails && (
          <span className="inline-flex items-center gap-2">
            <HugeiconsIcon
              icon={Briefcase01Icon}
              size={16}
              className="text-gold"
            />
            Scope: {project.installationDetails}
          </span>
        )}
      </div>

      {/* Hero Image */}
      {project.heroImage && (
        <div className="container relative mt-10 aspect-2/1 w-full overflow-hidden bg-muted">
          <Image
            src={project.heroImage.url}
            alt={project.heroImage.caption || project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Project Overview */}
      <div className=" bg-muted my-8">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Our Work
                </h3>
                <h2 className="mt-3 font-heading text-2xl font-bold">
                  Project Overview
                </h2>
              </div>
              <dl className="space-y-4 text-sm">
                {project.categories.length > 0 && (
                  <div>
                    <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                      Project Type
                    </dt>
                    <dd className="mt-1 text-gold">
                      {project.categories.join(" · ")}
                    </dd>
                  </div>
                )}
                {project.materials && (
                  <div>
                    <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                      Scale
                    </dt>
                    <dd className="mt-1 text-gold">{project.materials}</dd>
                  </div>
                )}
                {project.duration && (
                  <div>
                    <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                      Duration
                    </dt>
                    <dd className="mt-1 text-gold">{project.duration}</dd>
                  </div>
                )}
                {project.features.length > 0 && (
                  <div>
                    <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                      Fixtures
                    </dt>
                    <dd className="mt-1 text-gold">
                      {project.features.length} custom prototypes
                    </dd>
                  </div>
                )}
                {project.materials && (
                  <div>
                    <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                      Key Materials
                    </dt>
                    <dd className="mt-1 text-gold">{project.materials}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </dt>
                  <dd className="mt-1 capitalize text-gold">
                    {project.projectStatus}
                  </dd>
                </div>
              </dl>
            </aside>

            {/* Content */}
            <div className="space-y-10">
              {/* Description */}
              {project.aboutProject && (
                <div className="prose prose-slate max-w-none dark:prose-invert">
                  {project.aboutProject.split("\n\n").map((para) => (
                    <p key={para.slice(0, 40)}>{para}</p>
                  ))}
                </div>
              )}

              {/* Challenges & Solutions */}
              {project.challenges.length > 0 && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="border border-border bg-card p-6 px-12">
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      The Challenges
                    </h3>
                    <ul className="space-y-3 list-disc">
                      {project.challenges.map((c) => (
                        <li
                          key={c.id}
                          className="text-sm leading-relaxed text-muted-foreground"
                        >
                          {c.challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-noise border border-border bg-card p-6 px-12">
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      Our Solution
                    </h3>
                    <ul className="space-y-3 list-disc">
                      {project.challenges.map((c) => (
                        <li
                          key={c.id}
                          className="text-sm leading-relaxed text-secondary-foreground"
                        >
                          {c.solution}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Gallery */}
      {project.gallery.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Photography
                </h3>
                <h2 className="mt-3 font-heading text-2xl font-bold">
                  Project Gallery
                </h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {project.gallery.length} images · Click to enlarge
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {project.gallery.map((img, i) => (
                <div
                  key={img.publicId}
                  className={`relative overflow-hidden bg-muted ${
                    i === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.caption || `${project.title} gallery ${i + 1}`}
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial */}
      {project.testimonial && (
        <section className="bg-muted py-16 md:py-20">
          <blockquote className="container mx-auto max-w-3xl text-center">
            <HugeiconsIcon
              icon={ImageIcon}
              size={32}
              className="mx-auto mb-6 text-gold opacity-0"
            />
            <p className="font-heading text-2xl font-semibold leading-snug text-secondary md:text-3xl">
              &ldquo;{project.testimonial.quote}&rdquo;
            </p>
            <footer className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              — {project.testimonial.author}
            </footer>
          </blockquote>
        </section>
      )}

      {/* Fixtures Used */}
      {project.features.length > 0 && (
        <section className="container py-12 md:py-16">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            What We Installed
          </h3>
          <h2 className="mt-3 mb-8 font-heading text-2xl font-bold">
            Fixtures Used in This Project
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.features.map((f) => (
              <div key={f.id} className="border border-border bg-card p-5">
                <h4 className="font-heading font-bold">{f.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="container py-12 md:py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                See More Work
              </h3>
              <h2 className="mt-3 font-heading text-2xl font-bold">
                Related Projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              All Projects
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProjects.map((rp) => (
              <Link
                key={rp.id}
                href={`/projects/${rp.slug}`}
                className="group relative block overflow-hidden bg-muted aspect-3/2"
              >
                {rp.heroImage && (
                  <Image
                    src={rp.heroImage.url}
                    alt={rp.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h4 className="font-heading text-lg font-bold text-white leading-snug">
                    {rp.title}
                  </h4>
                  <p className="mt-1 text-sm text-white/70">{rp.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
