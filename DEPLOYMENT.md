# Deployment Guide - Netlify

This guide will help you deploy the Suya Queue Website to Netlify.

## Prerequisites

- A Netlify account (free at [netlify.com](https://www.netlify.com))
- Your project pushed to GitHub (recommended) or ready to deploy via drag-and-drop

## Option 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Suya Queue Website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Deploy on Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"GitHub"** and authorize Netlify
4. Select your repository
5. Netlify will auto-detect the build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **"Deploy site"**

### Step 3: Configure Environment (if needed)

If you need environment variables:
1. Go to **Site settings** → **Environment variables**
2. Add any required variables

## Option 2: Deploy via Drag & Drop

### Step 1: Build the Project

```bash
npm install
npm run build
```

### Step 2: Deploy

1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag and drop the `dist` folder onto the Netlify dashboard
3. Your site will be live in seconds!

## Post-Deployment

### 1. Set Up Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to configure your domain

### 2. Enable HTTPS

Netlify automatically provides HTTPS for all sites. No action needed!

### 3. Configure Google Sheets & Forms

Make sure your Google Sheets and Forms are:
- **Public** (Share → Anyone with link → Viewer)
- URLs are configured in the `/admin` page after deployment

### 4. Test Your Deployment

1. Visit your Netlify URL
2. Test the queue flow:
   - Register a new user
   - Check queue status
   - Test admin functions
   - Play trivia
   - Submit feedback

## Build Settings Summary

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18 (auto-detected)

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Ensure Node version is 18+
- Check build logs in Netlify dashboard

### Routes Not Working

- The `_redirects` file in `public/` should handle SPA routing
- Ensure `netlify.toml` is in the root directory

### Google Sheets Not Loading

- Verify the sheet is public
- Check the Google Sheets URL in admin settings
- Check browser console for CORS errors

## Continuous Deployment

Once connected to GitHub, Netlify will automatically:
- Deploy on every push to `main` branch
- Run builds automatically
- Show preview deployments for pull requests

## Support

For issues:
1. Check Netlify build logs
2. Check browser console
3. Verify Google Sheets/Forms are public
4. See `TROUBLESHOOTING_400_ERROR.md` for Google Sheets issues

