# **Personal Portfolio**

A minimalist personal portfolio built with Next.js and Once UI.

# **Getting Started**

This portfolio requires Node.js v18.17+.

**1. Install dependencies**
```
npm install
```

**2. Run dev server**
```
npm run dev
```

**3. Edit config**
```
src/app/resources/config
```

**4. Edit content**
```
src/app/resources/content
```

**5. Create blog posts / projects**
```
Add a new .mdx file to src/app/blog/posts or src/app/work/projects
```

# **Features**

- Responsive layout for all screen sizes
- SEO optimized with automatic meta generation
- Blog and project showcase sections
- Easy content management through MDX files
- Customizable theming

## **Usage**

### **Content Management**

#### **Personal Information**

Edit your personal details in `src/app/resources/content.js`:

```javascript
export const person = {
  name: 'Your Name',
  role: 'Your Role',
  avatar: '/images/avatar.jpg',
  location: 'Your Location',
  languages: ['English', 'Other Languages']
}
```

#### **About Page**

The about page features a timeline component that combines work experience and education:

- **Academic Timeline**: Displays education history with institutions, scores, and achievements
- **Professional Timeline**: Shows work experience with companies, roles, and accomplishments
- **Filter Options**: Toggle between "All", "Academic", and "Professional" views
- **Responsive Design**: Optimized layout for all screen sizes

#### **Blog Posts**

Create new blog posts by adding `.mdx` files to `src/app/blog/posts/`:

```markdown
---
title: "Your Blog Title"
publishedAt: "2024-01-01"
summary: "Brief description of your post"
---

Your blog content here...
```

#### **Projects**

Add projects by creating `.mdx` files in `src/app/work/projects/`:

```markdown
---
title: "Project Name"
publishedAt: "2024-01-01"
summary: "Project description"
images: ["/images/project-image.jpg"]
team: [
  { name: "Team Member", role: "Role", avatar: "/images/avatar.jpg" }
]
---

Project details...
```

### **Customization**

#### **Theming**

Customize colors and styling in `src/app/resources/config.js`:

- Brand colors
- Accent colors
- Typography settings
- Layout preferences

#### **Debug Mode**

Enable debug controls for development:

- Add `?debug=true` to any URL
- Use browser console: `toggleDebug()` to toggle on/off
- Use `toggleDebug(true/false)` to explicitly set debug state

#### **Navigation**

Configure navigation and social links in the content file:

```javascript
export const social = [
  { name: 'GitHub', icon: 'github', link: 'https://github.com/yourusername' },
  { name: 'LinkedIn', icon: 'linkedin', link: 'https://linkedin.com/in/yourusername' }
]
```

### **Advanced Features**

#### **Timeline Component**

The timeline component automatically:

- Sorts entries by date (most recent first)
- Combines academic and professional experiences
- Provides filtering capabilities
- Displays achievements and images
- Shows institution names and academic scores

#### **SEO Optimization**

- Automatic meta tag generation
- Open Graph image support
- Structured data markup
- Sitemap generation

#### **Performance**

- Image optimization with SmartImage component
- Lazy loading for better performance
- Responsive image sizing
- Efficient bundle splitting

## **Credits**

This portfolio is based on the [Magic Portfolio](https://demo.magic-portfolio.com) template by:

Lorant Toth: [Threads](https://www.threads.net/@lorant.one), [LinkedIn](https://www.linkedin.com/in/tothlorant/)  
Zsofia Komaromi: [Threads](https://www.threads.net/@zsofia_kom), [LinkedIn](https://www.linkedin.com/in/zsofiakomaromi/)

Built with [Once UI](https://once-ui.com).

## **License**

Distributed under the CC BY-NC 4.0 License.
See `LICENSE.txt` for more information.
