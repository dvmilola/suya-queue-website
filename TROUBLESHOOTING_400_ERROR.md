# Fixing 400 Bad Request Error

## 🔴 Problem
You're seeing **400 Bad Request** errors when trying to fetch data from Google Sheets. This means the app can't read your Google Sheet.

## ✅ Solution: Make Your Sheet Public

The 400 error almost always means your Google Sheet is **not public**. Here's how to fix it:

### Step 1: Open Your Google Sheet
1. Go to your Google Sheet
2. Look at the URL - it should be something like:
   ```
   https://docs.google.com/spreadsheets/d/1rSZoNeQjKfWLW0aJoZqs38aG9BMTMz547MVP6QFiNtw/edit
   ```

### Step 2: Make It Public
1. Click the **Share** button (top right, blue button)
2. Click **"Change to anyone with the link"**
3. Set permission to **"Viewer"** (not Editor)
4. Click **Done**

### Step 3: Test the CSV Export
1. Copy your Sheet ID from the URL (the long string between `/d/` and `/edit`)
2. Open this URL in a new browser tab (replace YOUR_SHEET_ID):
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
   ```
3. You should see a CSV file download or display
4. If you see an error page or "Sign in" page, the sheet is still not public

### Step 4: Verify in Your App
1. Refresh your app
2. Go to `/admin`
3. Check the browser console (F12) - you should see:
   ```
   Loaded X queue items from Google Sheets
   ```
   Instead of error messages

## 🔍 Other Possible Issues

### Wrong URL Format
Make sure your Google Sheets URL in `/admin` is:
```
https://docs.google.com/spreadsheets/d/SHEET_ID/edit
```

**NOT:**
- `https://docs.google.com/spreadsheets/d/SHEET_ID/view` ❌
- `https://docs.google.com/spreadsheets/d/SHEET_ID` ❌
- The sharing link ❌

### Sheet Has No Data
If your sheet is empty (no responses yet), that's okay - the app will just show an empty queue list.

### CORS Issues
If you still get errors after making it public, try:
1. Clear your browser cache
2. Try in an incognito/private window
3. Make sure you're using the correct Sheet ID

## ✅ Quick Checklist

- [ ] Google Sheet is public (Share → Anyone with link → Viewer)
- [ ] CSV export URL works in browser (downloads CSV file)
- [ ] Google Sheets URL in `/admin` is correct format
- [ ] Browser console shows no 400 errors
- [ ] Queue list appears in `/admin` (even if empty)

## 🧪 Test Your Setup

1. **Test CSV Export:**
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
   ```
   Should download a CSV file, not show an error page.

2. **Test in App:**
   - Go to `/admin`
   - Check browser console (F12)
   - Should see: "Loaded X queue items from Google Sheets"
   - Should NOT see: "400 Bad Request" or "Sheet is not public"

---

**Still having issues?** Check the browser console (F12) for the exact error message and share it!

