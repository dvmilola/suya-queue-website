# Clean Up Google Sheets - Start Fresh

## Quick Cleanup Steps

### Step 1: Clear "Form Responses 1" (Main Queue)

1. **Open your Google Sheet**
2. **Go to "Form Responses 1" tab**
3. **Select all data rows** (click row 2, then Shift+Click the last row)
4. **Right-click → Delete rows**
5. **Keep only the header row** (Row 1: Timestamp, Name or Nickname, Pepper Level, Portion Type)

### Step 2: Clear "Form Responses 2" (Status Form Responses)

1. **Go to "Form Responses 2" tab**
2. **Select all data rows** (click row 2, then Shift+Click the last row)
3. **Right-click → Delete rows**
4. **Keep only the header row** (Row 1: Timestamp, Current Serving)

### Step 3: Reset Status Sheet

1. **Go to "Status" tab**
2. **Click on cell B1**
3. **Delete the formula** (if it has one)
4. **Type: `SU-000`** (or leave it empty if you have the formula)

### Step 4: Reset Admin Settings (Optional)

If you want to reset the admin's current serving number:

1. **Open your Admin page**
2. **Click "Reset Queue"** button
3. **Confirm the reset**

## Alternative: Delete All Responses via Google Forms

### For Main Queue Form:

1. **Open your main Google Form** (the one for queue registration)
2. **Click "Responses" tab**
3. **Click the three dots (⋮) next to the Google Sheets icon**
4. **Select "Delete all responses"**
5. **Confirm deletion**

### For Status Form:

1. **Open your Status Form**
2. **Click "Responses" tab**
3. **Click the three dots (⋮) next to the Google Sheets icon**
4. **Select "Delete all responses"**
5. **Confirm deletion**

## After Cleanup

1. ✅ **Form Responses 1**: Should only have header row
2. ✅ **Form Responses 2**: Should only have header row
3. ✅ **Status sheet B1**: Should be `SU-000` or empty
4. ✅ **Admin "Current Serving"**: Should be `SU-000`

## Ready to Start Fresh!

Now you can:
- Start accepting new queue registrations
- Click "Next Customer" to begin serving from SU-001
- All devices will sync properly

## Pro Tip

If you want to keep a backup of your test data:
1. **Create a new tab** called "Backup - [Date]"
2. **Copy all the data** from Form Responses 1 and 2
3. **Paste it into the backup tab**
4. **Then delete the original data**

This way you can reference it later if needed!

