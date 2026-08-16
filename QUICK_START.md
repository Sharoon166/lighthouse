# 🚀 Blog Quick Start Guide

## 1️⃣ Verify Environment Setup

Check your `.env.local` has all required variables:

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 2️⃣ Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## 3️⃣ Access Blog Features

### Admin Dashboard
- **URL**: `http://localhost:3000/admin/blog`
- **Create Post**: Click "New post" button
- **Manage Posts**: View, edit, delete from table/cards
- **Trash**: Access via "Trash" button

### Public Pages
- **Blog List**: `http://localhost:3000/blog`
- **Blog Detail**: `http://localhost:3000/blog/your-post-slug`

## 4️⃣ Create Your First Post

1. Go to `/admin/blog` → Click "New post"
2. Add a title (e.g., "Welcome to Our Blog")
3. Write a summary
4. Add some tags (e.g., "welcome", "announcement")
5. Upload a hero image (click or drag & drop)
6. Write content in the editor:
   - Use toolbar for formatting
   - Add images by clicking 📷 icon, dragging, or pasting
   - Use headings (H2-H5) for structure
7. Fill in author details
8. (Optional) Add custom SEO fields
9. Click **"Publish"**

## 5️⃣ View Your Post

1. Navigate to `/blog`
2. See your post in the grid
3. Click to view full detail
4. Check table of contents navigation
5. Try share/copy link buttons

## 6️⃣ Image Upload Methods

Three ways to add images to your content:

**Method 1: Button**
- Click the 📷 icon in editor toolbar
- Select image file

**Method 2: Drag & Drop**
- Drag image file into the editor
- Drops at cursor position

**Method 3: Paste**
- Copy an image (Ctrl/Cmd + C)
- Paste in editor (Ctrl/Cmd + V)

## 7️⃣ SEO Optimization

**Auto-Generated (Default)**
- Meta title = Post title
- Meta description = Summary
- Keywords = Tags

**Manual Override**
- Scroll to "SEO Settings (Optional)" card
- Fill in custom values as needed
- See preview in "SEO Preview" sidebar
- Use for better search ranking

## 8️⃣ Common Tasks

### Edit a Post
- Go to `/admin/blog`
- Click pencil icon next to post
- Make changes
- Click "Save draft" or "Save & publish"

### Delete a Post
- Click trash icon next to post
- Post moves to trash (soft delete)
- Recover from trash if needed

### Permanently Delete
- Go to "Trash" from `/admin/blog`
- Click permanent delete (🗑️) icon
- Confirm by typing post title

### Change Post Status
- Draft: Visible only in admin
- Published: Visible on public blog

## 9️⃣ Content Styling

The editor creates automatically styled content:

- **Headings**: Numbered sections (01, 02, 03...)
- **Lists**: Styled bullets and numbered lists
- **Quotes**: Bordered blockquotes
- **Code**: Syntax-highlighted code blocks
- **Images**: Rounded, bordered images

## 🔟 Troubleshooting

**Images not uploading?**
- Check Cloudinary credentials
- Verify file is under 10MB
- Check browser console for errors

**Post not showing on /blog?**
- Ensure status is "Published"
- Check publishedAt date is set
- Verify it's not in trash (deletedAt is null)

**TypeScript errors?**
- Restart TypeScript server
- Restart your IDE
- Run `npm run build` to check

**Styles not applying?**
- Check globals.css is imported
- Restart dev server
- Clear browser cache

## 📱 Responsive Design

Your blog works beautifully on:
- **Mobile**: Single column, collapsible TOC
- **Tablet**: 2-column grid
- **Desktop**: 3-column grid, sticky TOC

## 🎯 Pro Tips

1. **Use headings** (H2-H4) for good structure and TOC
2. **Add tags** for better organization and SEO
3. **Write summaries** that make people want to read
4. **Upload high-quality images** (Cloudinary optimizes them)
5. **Use SEO overrides** for competitive keywords
6. **Check preview** before publishing
7. **Save drafts often** (auto-saves locally too)

## 🚀 You're Ready!

Start creating amazing blog content. For detailed documentation, see `BLOG_IMPLEMENTATION_COMPLETE.md`.

Happy blogging! ✨
