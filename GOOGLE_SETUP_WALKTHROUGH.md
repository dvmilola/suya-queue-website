# Google Forms & Sheets Setup - Step by Step

## 📋 Step 1: Create Your Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Click **Blank** to create a new form
3. Name it: "Suya Queue Registration"

### Add Questions (In This Exact Order):

**Question 1: Name**
- Type: Short answer
- Question: "Name or Nickname"
- Required: ❌ No (Optional)

**Question 2: Pepper Level**
- Type: Multiple choice
- Question: "Pepper Level"
- Required: ✅ Yes
- Options:
  - No Pepper
  - Normal
  - Extra

**Question 3: Portion Type**
- Type: Multiple choice
- Question: "Portion Type"
- Required: ❌ No (Optional)
- Options:
  - Regular
  - Kids

4. Click **Send** (top right)
5. Copy the form link (you'll need this later)

## 📊 Step 2: Link to Google Sheets

1. In your Google Form, click the **Responses** tab
2. Click the **📊 Google Sheets** icon
3. Choose **"Create a new spreadsheet"**
4. Your sheet will open automatically
5. Copy the Google Sheets URL from the address bar

## 🔑 Step 3: Get Entry IDs (IMPORTANT!)

### Method 1: View Page Source (Easiest)

1. Open your Google Form in a new tab
2. Right-click anywhere on the form → **View Page Source** (or press `Ctrl+U` / `Cmd+U`)
3. Press `Ctrl+F` / `Cmd+F` to search
4. Search for: `entry.`
5. You'll see entries like:
   ```html
   name="entry.123456789"
   name="entry.987654321"
   name="entry.111222333"
   ```
6. **Note them in order:**
   - First `entry.` = Name field
   - Second `entry.` = Pepper Level field
   - Third `entry.` = Portion Type field

### Method 2: Browser DevTools (More Reliable)

1. Open your Google Form
2. Press `F12` (or Right-click → Inspect)
3. Go to **Network** tab
4. Fill out the form with test data:
   - Name: "Test User"
   - Pepper: "Normal"
   - Portion: "Regular"
5. Click Submit
6. In Network tab, look for a request to `formResponse`
7. Click on it → Go to **Payload** or **Form Data** tab
8. You'll see the entry IDs with your values:
   ```
   entry.123456789: Test User
   entry.987654321: Normal
   entry.111222333: Regular
   ```

## 🔧 Step 4: Update the Code

1. Open `src/components/Registration.jsx`
2. Find this section (around line 42):
   ```javascript
   const entryIds = {
     name: 'entry.123456789',
     pepper: 'entry.987654321',
     portion: 'entry.111222333'
   }
   ```
3. Replace with your actual entry IDs from Step 3

## 🌐 Step 5: Make Google Sheets Public

1. Open your Google Sheet
2. Click **Share** (top right)
3. Click **Change to anyone with the link**
4. Set permission to **Viewer**
5. Click **Done**

**Important:** The sheet MUST be public for the app to read it!

## ⚙️ Step 6: Configure in the App

1. Start your app: `npm run dev`
2. Navigate to: `http://localhost:5173/admin`
3. Click **Configure Google Sheets/Forms**
4. Enter:
   - **Google Sheets URL**: Your full Sheets URL
     ```
     https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
     ```
   - **Google Form URL**: Your full Form URL
     ```
     https://docs.google.com/forms/d/YOUR_FORM_ID/viewform
     ```
5. Click **Save Configuration**

## ✅ Step 7: Test Everything

### Test Form Submission:
1. Go to the home page
2. Click "Join the Queue"
3. Fill out the form
4. Submit
5. Check your Google Sheet - you should see a new row!

### Test Queue Reading:
1. Go to `/admin`
2. You should see the queue list with your test submission
3. The queue number should match the row number in Google Sheets

### Test CSV Export:
1. Open this URL in your browser (replace YOUR_SHEET_ID):
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
   ```
2. You should see a CSV file download
3. If it works, the app can read your sheet!

## 🐛 Troubleshooting

### Form Not Submitting?
- ✅ Check entry IDs are correct (Step 3)
- ✅ Verify form URL format is correct
- ✅ Open browser console (F12) and check for errors
- ✅ Try submitting the form manually on Google Forms first

### Sheets Not Loading?
- ✅ Ensure sheet is public (Step 5)
- ✅ Check Sheets URL is correct
- ✅ Test CSV export URL directly in browser
- ✅ Check browser console for CORS errors

### Queue Numbers Wrong?
- ✅ Queue numbers are based on row number in Google Sheets
- ✅ If you delete rows, numbers may not be sequential
- ✅ This is normal - the system uses response index

### Entry IDs Not Working?
- ✅ Make sure you got them in the right order
- ✅ Entry IDs are case-sensitive
- ✅ Try Method 2 (DevTools) if Method 1 didn't work

## 📝 Quick Reference

**Entry ID Format:**
```
entry.123456789  (always starts with "entry." followed by numbers)
```

**Form Action URL Format:**
```
https://docs.google.com/forms/d/e/FORM_ID/formResponse
```

**CSV Export URL Format:**
```
https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=0
```

---

**Need help?** Check the browser console (F12) for detailed error messages!

