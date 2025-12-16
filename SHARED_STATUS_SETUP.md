# Shared Status Setup Guide

## Problem
`currentServing` is stored in localStorage, which is per-device. When admin updates it, other users on different devices don't see the change.

## Solution
Store `currentServing` in Google Sheets so it's shared across all devices.

## Setup Instructions

### Option 1: Use a Separate Status Sheet (Recommended)

1. **Create a new tab in your Google Sheet:**
   - Open your Google Sheet
   - Click the "+" button at the bottom to add a new sheet
   - Name it "Status"

2. **Set up the Status sheet:**
   - In cell A1, type: `Current Serving`
   - In cell B1, type: `SU-000` (or your starting number)
   - Make sure the sheet is public (same as your main sheet)

3. **Get the Status sheet GID:**
   - Click on the "Status" tab
   - Look at the URL - it should have `#gid=XXXXX` at the end
   - Copy that GID number

4. **Update the Status Sheet URL in Admin:**
   - The app will automatically use a separate status sheet if configured
   - Or use the same sheet with a different GID

### Option 2: Use a Specific Cell in Main Sheet

1. **Add a status row at the top:**
   - In your main Google Sheet, add a row at the top (before headers)
   - In cell A1, type: `STATUS`
   - In cell B1, type: `SU-000`
   - This row will be read as the current serving number

2. **The app will automatically detect and use this**

## How It Works

1. Admin clicks "Next Customer" → Updates Google Sheet via form submission
2. All devices poll the Google Sheet every 3 seconds
3. When `currentServing` changes in the sheet, all devices see it immediately
4. No more localStorage caching issues!

## Testing

1. Open admin on Device A
2. Click "Next Customer"
3. Open queue status on Device B
4. Within 3 seconds, Device B should see the updated serving number

