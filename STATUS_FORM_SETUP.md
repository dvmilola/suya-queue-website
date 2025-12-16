# Status Form Setup Guide

## Problem
When admin clicks "Next Customer", the Status sheet needs to update automatically so all devices see the change.

## Solution
Create a Google Form that writes to your Status sheet. When admin clicks "Next Customer", the app will automatically submit to this form.

## Setup Instructions

### Step 1: Create Status Form

1. **Go to Google Forms** → Create a new form
2. **Add one question:**
   - Question: "Current Serving"
   - Type: Short answer (text)
   - Make it required
3. **Link to your Status sheet:**
   - Click the "Responses" tab
   - Click the Google Sheets icon (link to spreadsheet)
   - Select your existing Status sheet (or create a new one)
   - This will create a "Form Responses" tab in your Status sheet

### Step 2: Get Entry ID

1. **Open your Status Form**
2. **Open browser DevTools** (F12)
3. **Go to Network tab**
4. **Submit a test response** (enter "SU-001" and submit)
5. **Look for a request to `formResponse`**
6. **Find the entry ID** in the request body (looks like `entry.123456789`)
7. **Copy this entry ID**

### Step 3: Configure in Admin

1. **Go to Admin page** → Click "Configure Google Sheets/Forms"
2. **Enter Status Form URL:**
   - Get the form URL: Click "Send" in your Status Form → Copy link
   - Paste it in "Status Form URL" field
3. **Enter Status Form Entry ID:**
   - Paste the entry ID you copied (e.g., `entry.123456789`)
4. **Save Configuration**

### Step 4: Set Up Status Sheet Formula

Since Google Forms append rows (they don't update cells), we need a formula to get the latest value:

1. **In your Status sheet**, go to the "Form Responses" tab
2. **In cell B1 of your Status sheet**, add this formula:
   ```
   =INDEX('Form Responses 1'!B:B, COUNTA('Form Responses 1'!B:B))
   ```
   (Replace `'Form Responses 1'` with your actual form responses tab name)

3. **This formula** will automatically show the latest submitted value

## How It Works

1. **Admin clicks "Next Customer"** → App submits to Status Form
2. **Status Form** → Writes new row to "Form Responses" tab
3. **Status sheet B1** → Formula shows latest value
4. **All devices** → Poll Status sheet and see update within 3 seconds

## Alternative: Manual Update (Simpler)

If you don't want to set up the form, you can still manually update the Status sheet:
- Just update cell B1 directly in your Status sheet
- All devices will see it within 3 seconds

## Troubleshooting

**Form not submitting?**
- Check that Status Form URL is correct (full URL, not short URL)
- Verify entry ID is correct (check Network tab)
- Make sure form is accepting responses

**Status not updating?**
- Check formula in Status sheet B1
- Verify form responses are being written
- Check that Status sheet is public

