# Quick Setup Guide

## 🚀 Getting Started (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

## 📝 Google Forms Setup (10 minutes)

### Step 1: Create the Form

1. Go to [Google Forms](https://forms.google.com)
2. Create a new blank form
3. Add these questions:
   - **Question 1**: "Name or Nickname" (Short answer, Optional)
   - **Question 2**: "Pepper Level" (Multiple choice, Required)
     - Options: "No Pepper", "Normal", "Extra"
   - **Question 3**: "Portion Type" (Multiple choice, Optional)
     - Options: "Regular", "Kids"
4. Click **Send** → Copy the form link

### Step 2: Link to Google Sheets

1. In your Google Form, click the **Responses** tab
2. Click the **📊 Google Sheets** icon
3. Choose "Create a new spreadsheet" or "Select existing spreadsheet"
4. Copy the Google Sheets URL

### Step 3: Get Entry IDs (Important!)

**Method 1: View Page Source**
1. Open your Google Form
2. Right-click → **View Page Source** (or Ctrl+U / Cmd+U)
3. Press Ctrl+F / Cmd+F and search for `"entry.`
4. You'll see entries like:
   ```html
   name="entry.123456789"
   name="entry.987654321"
   name="entry.111222333"
   ```
5. Note these numbers in order (first = name, second = pepper, third = portion)

**Method 2: Browser DevTools**
1. Open your Google Form
2. Press F12 (or Right-click → Inspect)
3. Go to **Network** tab
4. Fill out and submit the form
5. Look for a request to `formResponse`
6. Check the Form Data section for entry IDs

### Step 4: Update the Code

Edit `src/components/Registration.jsx` and find this section (around line 30):

```javascript
const entryIds = {
  name: 'entry.123456789',    // Replace with your actual entry ID
  pepper: 'entry.987654321',  // Replace with your actual entry ID
  portion: 'entry.111222333'  // Replace with your actual entry ID
}
```

Replace with your actual entry IDs from Step 3.

### Step 5: Make Sheets Public

1. Open your Google Sheet
2. Click **Share** (top right)
3. Click **Change to anyone with the link**
4. Set permission to **Viewer**
5. Click **Done**

### Step 6: Configure in App

1. Run the app: `npm run dev`
2. Navigate to `/admin`
3. Click **Configure Google Sheets/Forms**
4. Paste your URLs:
   - **Google Sheets URL**: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - **Google Form URL**: `https://docs.google.com/forms/d/YOUR_FORM_ID/viewform`
5. Click **Save Configuration**

## ✅ Test It!

1. Open the app in browser
2. Click "Join the Queue"
3. Fill out the form and submit
4. Check your Google Sheet - you should see the response!
5. Go to `/admin` - you should see the queue list

## 🎯 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify (Easiest)
1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the `dist` folder
3. Done! You get a URL like `https://random-name-123.netlify.app`

### Deploy to GitHub Pages
1. Update `vite.config.js`:
   ```javascript
   base: '/REPO_NAME/',
   build: {
     outDir: 'docs'
   }
   ```
2. Build: `npm run build`
3. Push `docs` folder to GitHub
4. Enable GitHub Pages in repo settings

## 🔧 Troubleshooting

**Form not submitting?**
- Check entry IDs are correct
- Verify form URL is correct
- Check browser console for errors

**Sheets not loading?**
- Ensure sheet is public (Share → Anyone with link)
- Check Sheets URL is correct
- Verify CSV export works: Try opening the CSV URL directly

**Queue numbers wrong?**
- Queue numbers are based on response order in Google Sheets
- If you delete responses, numbers may not be sequential
- This is normal - the system uses response index

## 💡 Pro Tips

- **Test locally first** before deploying
- **Keep a backup** of your entry IDs
- **Use incognito mode** to test as a new user
- **Check Google Sheets** regularly to verify submissions

---

**Need help?** Check the main README.md for detailed documentation.

