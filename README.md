# Daiyan Kabir — Personal Portfolio

A minimal, SEO-friendly personal portfolio website built from scratch with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — just open and deploy.

## Deploy to GitHub Pages (Free)

1. **Create a new GitHub repository** named `daiyan-kabir-portfolio` (or any name you like)

2. **Push these files to the repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/daiyan-kabir-portfolio.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages** (left sidebar)
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

4. **Your site will be live at:**
   ```
   https://YOUR_USERNAME.github.io/daiyan-kabir-portfolio/
   ```

5. **Make it easier to Google:**
   - Wait 24–48 hours for Google to index your site
   - Submit your URL to [Google Search Console](https://search.google.com/search-console)
   - Add your GitHub Pages URL to your LinkedIn profile
   - The site already includes structured data (JSON-LD), Open Graph tags, and semantic HTML for SEO

## Alternative Free Hosting

- **Netlify:** Drag and drop the folder at [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel:** `npx vercel` in this directory (installs CLI if needed)
- **Cloudflare Pages:** Connect your GitHub repo at [pages.cloudflare.com](https://pages.cloudflare.com)

## Custom Domain (Optional)

To use a custom domain like `daiyankabir.dev`:
1. Buy a domain (Namecheap, Cloudflare, etc. — ~€10/year)
2. In GitHub repo Settings → Pages → Custom domain, enter your domain
3. Add a CNAME record in your DNS provider pointing to `YOUR_USERNAME.github.io`
4. Check "Enforce HTTPS"

## Files

```
├── index.html    # Main page with all content
├── style.css     # All styles (design tokens, responsive, dark mode)
├── script.js     # Theme toggle + header scroll effect
└── README.md    # This file
```

## Tech

- No dependencies, no build tools
- Fonts: Inter (body) + Instrument Serif (display) via Google Fonts CDN
- Light/dark mode with system preference detection
- Fully responsive (mobile-first)
- SEO: meta tags, Open Graph, Twitter Card, JSON-LD structured data
- Accessible: semantic HTML, ARIA labels, keyboard navigation, reduced motion support
