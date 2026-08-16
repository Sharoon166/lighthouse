import { listBlogPosts } from "../actions";
import { BlogListClient } from "./blog-list-client";

export async function BlogList() {
  const initialData = await listBlogPosts({
    page: 1,
    pageSize: 9,
    search: "",
    status: "published",
  });

  return <BlogListClient initialData={initialData} />;
}

