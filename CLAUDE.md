# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a GitHub Pages personal portfolio website for developer "doulongfei". The site showcases:
- Personal projects with descriptions and tech stacks
- Professional certificates and achievements
- Blog link and technical articles
- GitHub statistics and activity
- Comment system integration

## Key Files
- `index.html`: Main portfolio website (HTML/CSS/JS)
- `README.md`: GitHub profile README with animated typing SVG
- `CNAME`: Custom domain configuration
- `assets/`: Directory containing images, certificates, and SVG assets
- `profile-3d-contrib/`: GitHub contribution graph visualizations

## Technology Stack
- **Frontend**: Pure HTML5, CSS3, JavaScript
- **Styling**: Custom CSS with gradient backgrounds and modern UI
- **Comments**: Twikoo comment system (external CDN)
- **Deployment**: GitHub Pages
- **Domain**: Custom domain (doufei.eu.org)

## Development Commands
Since this is a static GitHub Pages site:
- No build process required - changes to HTML/CSS/JS are immediate
- No package.json or build tools - pure static files
- Deployment: Push to `gh-pages` branch for automatic deployment

## Project Structure
The portfolio showcases multiple personal projects including:
- videoDownload (Go, Web, M3U8)
- awsClaudeApi (AWS, Claude, OpenAI API)
- autoUploadClipboardImg (Python, Windows automation)
- mybatis-sql-run (Java, MyBatis, SQL debugging)
- DataStructures (algorithms, data structures)
- And several other full-stack and mobile projects

## Important Notes
- The site uses external CDN for Twikoo comments
- All assets are self-hosted in the `assets/` directory
- Custom domain configured via CNAME file
- GitHub Pages automatically serves from `gh-pages` branch
- No testing/linting needed for this static HTML site