# Configuration URLs - Add Your Main Form URL

## What I Need From You

I need your **main Google Form URL** (the one for queue registration, not the status form).

## Where to Add It

Open `src/context/QueueContext.jsx` and find line 21:

```javascript
const HARDCODED_GOOGLE_FORM_URL = '' // TODO: Add your main queue form URL here
```

Replace it with your actual Google Form URL:

```javascript
const HARDCODED_GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform'
```

## Already Hardcoded (No Action Needed)

✅ **Google Sheets URL**: Already set  
✅ **Status Form URL**: Already set  
✅ **Status Sheet GID**: Already set  
✅ **Status Form Entry ID**: Already set  

## After Adding Your Form URL

1. Save the file
2. Deploy to Netlify
3. **Users can now access the site and submit forms - NO CONFIGURATION NEEDED!** 🎉

## How to Find Your Main Form URL

1. Open your main Google Form (the one for queue registration)
2. Click "Send" (top right)
3. Copy the link
4. Paste it in the code

That's it! Once you add this one URL, everything will work for all users automatically.

