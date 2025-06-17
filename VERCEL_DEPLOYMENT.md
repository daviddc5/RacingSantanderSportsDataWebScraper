# Vercel Deployment Guide

This project has been configured to work properly on Vercel with client-side routing.

## What's Been Updated

1. **vercel.json** - Configuration file for Vercel routing
2. **Absolute Paths** - All CSS, JS, and image paths now use absolute paths (starting with `/`)
3. **Client-side Router** - Added `js/router.js` for smooth navigation without page reloads
4. **Route Files** - Created `squad.html` and `history.html` in the root directory

## Deployment Steps

1. **Push to GitHub**: Make sure all changes are committed and pushed to your GitHub repository

2. **Deploy to Vercel**:

   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Configuration Details**:

   - **Framework Preset**: Other (static HTML)
   - **Build Command**: Leave empty (not needed for static sites)
   - **Output Directory**: Leave empty (root directory)
   - **Install Command**: Leave empty

4. **Environment Variables** (if needed):
   - Add any API keys or environment variables in the Vercel dashboard
   - The project uses fallback data if APIs are unavailable

## How It Works

- **vercel.json** redirects all routes to `index.html` for SPA behavior
- **Client-side router** handles navigation without page reloads
- **Absolute paths** ensure all resources load correctly
- **Component system** loads header/footer dynamically

## Routes

- `/` - Home page (index.html)
- `/squad` - Squad page (squad.html)
- `/history` - History page (history.html)

## Testing

After deployment, test:

1. Navigation between pages
2. Browser back/forward buttons
3. Direct URL access (e.g., `yoursite.vercel.app/squad`)
4. All images and styles loading correctly

## Troubleshooting

If navigation doesn't work:

1. Check browser console for errors
2. Ensure all files are in the correct locations
3. Verify `vercel.json` is in the root directory
4. Check that all paths use absolute URLs (starting with `/`)

## Design Preservation

The original design and styling remain completely unchanged. Only the routing and path structure have been updated for Vercel compatibility.
