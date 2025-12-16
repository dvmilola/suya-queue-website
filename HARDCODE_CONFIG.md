# Hardcode Configuration URLs (Recommended for Production)

## Problem
Since localStorage is per-device, each user would need to configure the Google Form and Sheets URLs on their device. This is not ideal for a public event.

## Solution: Hardcode the URLs

You can hardcode your Google Form and Sheets URLs directly in the code so users don't need to configure anything.

## Steps

1. **Open** `src/context/QueueContext.jsx`

2. **Find these lines** (around line 20-30):
   ```javascript
   const HARDCODED_GOOGLE_FORM_URL = ''
   const HARDCODED_GOOGLE_SHEETS_URL = ''
   ```

3. **Replace with your actual URLs**:
   ```javascript
   const HARDCODED_GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform'
   const HARDCODED_GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit'
   ```

4. **Save and deploy**

## Benefits

✅ **Users don't need to configure anything** - it just works!  
✅ **No setup prompts** - cleaner user experience  
✅ **One-time setup** - you configure it once in code, works for everyone  

## Important Notes

⚠️ **Make sure your URLs are correct** - test them before deploying  
⚠️ **If you change your Google Form/Sheet**, you'll need to update the code and redeploy  
⚠️ **Keep your URLs private** - don't commit sensitive data (though Google Form/Sheet URLs are usually public anyway)

## Alternative: Keep Configuration

If you prefer to keep the configuration option (for flexibility), you can:
- Leave the hardcoded URLs empty
- Users will see a setup prompt if not configured
- They can configure it once per device

## Which Should You Use?

- **Hardcode URLs**: Best for production/public events where you want zero setup
- **Configuration**: Best for testing or if URLs might change frequently

