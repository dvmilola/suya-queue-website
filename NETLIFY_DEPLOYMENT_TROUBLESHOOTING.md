# Netlify Deployment Troubleshooting

## Your Site is Live!
**URL:** https://grand-cobbler-4df3dc.netlify.app/

## If Your Site Isn't Updating

### 1. Check Netlify Deployment Status

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click on your site: **grand-cobbler-4df3dc**
3. Go to **"Deploys"** tab
4. Check if there's a new deployment running or if it failed

### 2. Trigger Manual Rebuild

If automatic deployment didn't trigger:

1. In Netlify dashboard → **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete (usually 1-2 minutes)

### 3. Check Build Logs

If deployment failed:

1. Click on the failed deployment
2. Check **"Deploy log"** for errors
3. Common issues:
   - Build command error
   - Missing dependencies
   - Node version mismatch

### 4. Verify GitHub Connection

Make sure Netlify is connected to your GitHub repo:

1. **Site settings** → **Build & deploy** → **Continuous Deployment**
2. Verify it shows: `dvmilola/suya-queue-website`
3. If not connected, reconnect it

### 5. Clear Cache and Redeploy

If changes still don't appear:

1. **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
2. This forces a fresh build

## Quick Fixes

### Force a New Deployment

```bash
# Make a small change and push
git commit --allow-empty -m "Trigger Netlify rebuild"
git push
```

### Check Build Settings

In Netlify dashboard:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18 (or latest)

### Verify Files Are Pushed

```bash
git status
git log --oneline -3
```

## Common Issues

### Issue: "Build failed"
- **Solution:** Check build logs for specific errors
- Usually: missing dependencies or syntax errors

### Issue: "Site not updating"
- **Solution:** 
  1. Verify changes are pushed to GitHub
  2. Check Netlify deployment status
  3. Clear browser cache
  4. Try incognito/private mode

### Issue: "Routes not working"
- **Solution:** Verify `_redirects` file is in `public/` folder
- Check `netlify.toml` exists in root

### Issue: "Google Sheets not loading"
- **Solution:** 
  1. Verify sheet is public
  2. Check URLs in `/admin` page
  3. See `TROUBLESHOOTING_400_ERROR.md`

## Verify Your Deployment

After pushing changes:

1. **Wait 1-2 minutes** for Netlify to build
2. Check **Deploys** tab in Netlify dashboard
3. Visit your site: https://grand-cobbler-4df3dc.netlify.app/
4. **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R) to clear cache

## Still Not Working?

1. Check Netlify build logs for errors
2. Verify all files are committed and pushed
3. Try manual rebuild in Netlify dashboard
4. Check browser console for errors on live site

## Your Repository
**GitHub:** https://github.com/dvmilola/suya-queue-website

Make sure all changes are pushed here for Netlify to pick them up!

