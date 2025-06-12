# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal technical blog (https://blog.taross-f.dev/) hosted on GitHub Pages. The site uses the Jekyll Now theme with custom modifications and Japanese content support.

## Architecture

- **Static Site Generator**: Jekyll with GitHub Pages deployment
- **Theme**: Custom-modified Jekyll Now theme
- **Content**: Japanese blog posts in `_posts/` following Jekyll naming convention
- **Layouts**: Custom HTML layouts in `_layouts/` (default, post, page)
- **Styling**: SCSS with custom modifications in `style.scss` and `_sass/` partials
- **Configuration**: `_config.yml` contains site settings, plugins, and metadata

## Key Components

- **Posts**: Markdown files in `_posts/` with YAML front matter
- **Pagination**: Enabled with 10 posts per page via Jekyll pagination
- **Tags**: Custom tag system with dedicated tags page
- **Social Integration**: Twitter, GitHub, and email footer links
- **Analytics**: Google Analytics integration (UA-68403855-4)
- **Commenting**: Disqus integration (currently disabled)

## Development Commands

Since this is a Jekyll site hosted on GitHub Pages, local development requires Jekyll:

```bash
# Install dependencies (if Gemfile exists)
bundle install

# Serve locally for development
bundle exec jekyll serve

# Build site
bundle exec jekyll build
```

## Content Management

- Blog posts use YAML front matter with layout, title, and tags
- Images stored in `/images/` directory
- Posts support Japanese content with proper typography
- Custom styling for typography, code highlighting, and responsive design

## Deployment

Site automatically deploys to GitHub Pages when changes are pushed to the master branch. The CNAME file configures the custom domain (blog.taross-f.dev).