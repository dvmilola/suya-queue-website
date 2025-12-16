# Fix Status Form Entry ID Issue

## Problem
The Status Form is submitting, but the "Current Serving" values are empty in "Form Responses 2". This means the Entry ID is wrong or the form field isn't configured correctly.

## Solution: Get the Correct Entry ID

### Method 1: Using Browser DevTools (Recommended)

1. **Open your Status Form** (the one linked to "Form Responses 2")
2. **Open browser DevTools** (F12 or Right-click → Inspect)
3. **Go to Network tab**
4. **Clear the network log** (click the clear button)
5. **In the Status Form, manually submit a test value** (e.g., type "SU-999" and click Submit)
6. **Look for a request** named `formResponse` in the Network tab
7. **Click on it** → Go to "Payload" or "Request" tab
8. **Find the entry ID** - it will look like:
   ```
   entry.123456789: SU-999
   ```
   The part before the colon (`entry.123456789`) is your Entry ID!

### Method 2: Inspect Form HTML

1. **Open your Status Form**
2. **Right-click on the "Current Serving" input field** → Inspect
3. **Look for `name="entry.XXXXX"`** in the HTML
4. **Copy that entry ID** (e.g., `entry.123456789`)

### Method 3: Check Form Source

1. **Open your Status Form**
2. **View page source** (Right-click → View Page Source, or Ctrl+U)
3. **Search for** `entry.` in the source
4. **Find the entry ID** associated with your "Current Serving" field

## Update Entry ID in Admin

1. **Go to Admin page** → Click "Configure Google Sheets/Forms"
2. **Find "Status Form Entry ID" field**
3. **Paste the correct Entry ID** you found (e.g., `entry.123456789`)
4. **Save Configuration**

## Test It

1. **Go to Admin page**
2. **Click "Next Customer"**
3. **Check "Form Responses 2" tab** in Google Sheets
4. **The "Current Serving" column should now have the queue number!**

## Why This Happens

Google Forms uses unique Entry IDs for each field. If you use the wrong Entry ID, the form accepts the submission but doesn't save the value to the correct column.

## Quick Check

Run this in your browser console on the Admin page:
```javascript
console.log('Current Status Form Entry ID:', localStorage.getItem('statusFormEntryId'))
```

If it shows `entry.0` or `null`, you need to configure it!

