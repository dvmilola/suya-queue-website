# Debug Status Setup - Step by Step

## Quick Checklist

Let's verify each part is working:

### ✅ Step 1: Verify Status Form is Set Up

1. **Do you have a Status Form?**
   - It should have ONE question: "Current Serving" (short answer text)
   - It should be linked to your Google Sheet

2. **Test the Status Form manually:**
   - Open your Status Form
   - Submit a test value (e.g., "SU-001")
   - Check "Form Responses 2" tab in your Google Sheet
   - **Does a new row appear with your test value?**

   ❌ **If NO:** Your Status Form isn't linked to the sheet correctly. Re-link it.

### ✅ Step 2: Get Status Form Entry ID

1. **Open your Status Form**
2. **Open browser DevTools** (F12 or Right-click → Inspect)
3. **Go to Network tab**
4. **Submit the form** with a test value (e.g., "SU-002")
5. **Look for a request** named `formResponse`
6. **Click on it** → Go to "Payload" or "Request" tab
7. **Find the entry ID** - it looks like `entry.123456789`
8. **Copy this exact value**

### ✅ Step 3: Verify Status Sheet Formula

1. **Go to your Status sheet** (the tab at the bottom)
2. **Check cell B1** - it should have the formula:
   ```
   =INDEX('Form Responses 2'!B:B, COUNTA('Form Responses 2'!B:B))
   ```
3. **Test it:**
   - Go to "Form Responses 2" tab
   - Manually type "SU-999" in any cell in column B (e.g., B2)
   - Go back to Status sheet
   - **Does B1 show "SU-999"?**

   ❌ **If NO:** The formula is wrong. Check the tab name matches exactly.

### ✅ Step 4: Configure in Admin

1. **Go to Admin page** → Click "Configure Google Sheets/Forms"
2. **Status Form URL:** Paste your Status Form URL (full URL, not short URL)
3. **Status Form Entry ID:** Paste the entry ID from Step 2
4. **Status Sheet GID:** Should be `373003429` (from your Status sheet URL)
5. **Save Configuration**

### ✅ Step 5: Test Admin "Next Customer"

1. **Open Admin page**
2. **Open browser DevTools** (F12) → Console tab
3. **Click "Next Customer"**
4. **Check the console** - you should see:
   ```
   ✅ Submitted status update to Google Form: SU-001
   Updated currentServing to SU-001
   ```

   ❌ **If you see an error:** Check the Status Form URL and Entry ID

5. **Check "Form Responses 2" tab:**
   - **Does a new row appear?**
   - **Does it have the queue number in column B?**

6. **Check Status sheet B1:**
   - **Does it update to show the new number?**

### ✅ Step 6: Test Cross-Device Sync

1. **On Device A (Admin):**
   - Click "Next Customer"
   - Wait 3 seconds

2. **On Device B (User):**
   - Open queue status page
   - **Does "Now Serving" update within 3 seconds?**

## Common Issues & Fixes

### Issue 1: Status Form Not Submitting

**Symptoms:**
- No new rows in "Form Responses 2" when clicking "Next Customer"
- Console shows error about form submission

**Fix:**
- Check Status Form URL is correct (full URL, not short URL)
- Check Status Form Entry ID is correct
- Make sure Status Form is still active (not deleted)

### Issue 2: Formula Not Updating

**Symptoms:**
- Status sheet B1 shows old value or error
- Formula looks correct but doesn't work

**Fix:**
- Check tab name matches exactly (case-sensitive, including spaces)
- Try this alternative formula:
  ```
  =QUERY('Form Responses 2'!B:B, "SELECT B ORDER BY B DESC LIMIT 1", 0)
  ```
- Or manually update B1 for now (less ideal)

### Issue 3: App Not Reading Status Sheet

**Symptoms:**
- Status sheet B1 has correct value
- But app still shows old "Now Serving" number

**Fix:**
- Check Status Sheet GID is correct (`373003429`)
- Make sure Status sheet is public (Share → Anyone with link → Viewer)
- Check browser console for errors
- Wait 3 seconds (polling interval)

### Issue 4: Wrong Entry ID

**Symptoms:**
- Form submits but wrong column gets the value
- Or value doesn't appear at all

**Fix:**
- Re-check Entry ID using DevTools Network tab
- Make sure you're copying the ENTIRE entry ID (e.g., `entry.1883307002`)

## Quick Test Script

Open browser console on Admin page and run:

```javascript
// Test 1: Check Status Form URL
console.log('Status Form URL:', localStorage.getItem('statusFormUrl'))

// Test 2: Check Status Form Entry ID
console.log('Status Form Entry ID:', localStorage.getItem('statusFormEntryId'))

// Test 3: Check Status Sheet GID
console.log('Status Sheet GID:', localStorage.getItem('statusSheetGid'))

// Test 4: Check Google Sheets URL
console.log('Google Sheets URL:', localStorage.getItem('googleSheetsUrl'))
```

All should have values (not null).

## Still Not Working?

Share:
1. Console errors (if any)
2. What happens when you click "Next Customer"
3. What appears in "Form Responses 2" tab
4. What appears in Status sheet B1

