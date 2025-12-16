# Cross-Device Sync Setup Guide

## Problem Fixed! 🎉

The queue counting now syncs across all devices in real-time by reading from Google Sheets.

## How It Works

1. **Admin updates** `currentServing` → Stored in localStorage (for immediate local update)
2. **Admin manually updates Google Sheets** → All devices poll and see the change within 3 seconds
3. **All devices** poll Google Sheets every 3 seconds → See updated `currentServing` automatically

## Setup Instructions

### Option 1: Add Status Row to Main Sheet (Easiest)

1. **Open your Google Sheet**
2. **Insert a new row at the top** (before your headers)
3. **In cell A1**, type: `Current Serving`
4. **In cell B1**, type: `SU-000` (or your current serving number)
5. **Make sure the sheet is public** (Share → Anyone with link → Viewer)

That's it! The app will automatically detect and use this.

### Option 2: Use a Separate Status Sheet Tab

1. **Create a new tab** in your Google Sheet
2. **Name it "Status"**
3. **In cell A1**, type: `Current Serving`
4. **In cell B1**, type: `SU-000`
5. **Get the GID:**
   - Click on the "Status" tab
   - Look at the URL - it will have `#gid=XXXXX` at the end
   - Copy that number
6. **In Admin setup**, enter the GID in the "Status Sheet GID" field

## How Admin Updates Work

### When Admin Clicks "Next Customer":

1. **Immediate update** on admin's device (localStorage)
2. **Admin needs to update Google Sheets manually:**
   - Open Google Sheet
   - Update cell B1 (or the status cell) with new number
   - Save
3. **All devices** will see the update within 3 seconds automatically!

### Quick Update Method:

1. Admin clicks "Next Customer" → See the new number
2. Admin opens Google Sheet on phone/tablet
3. Updates cell B1 with the new number
4. All users see it within 3 seconds!

## Testing

1. **Setup:** Add status row to Google Sheet (A1: "Current Serving", B1: "SU-000")
2. **Test on Device A:** Open admin, click "Next Customer" → Should show SU-001
3. **Update Google Sheet:** Change B1 to "SU-001"
4. **Test on Device B:** Open queue status → Within 3 seconds, should show "Now Serving: SU-001"

## Pro Tips

- **Keep Google Sheet open on admin's device** for quick updates
- **Use Google Sheets mobile app** for easy updates on the go
- **The status row won't interfere** with your queue data - it's automatically detected and skipped

## Troubleshooting

**Not syncing?**
- Verify the status row is in the correct format
- Check that the sheet is public
- Wait 3 seconds for polling to update
- Check browser console for errors

**Status row interfering with data?**
- The app automatically detects and skips the status row
- Make sure it's in the first row with "Current Serving" in A1

## Format Examples

### Correct Format 1:
```
A1: Current Serving    B1: SU-001
A2: Timestamp          B2: Name    C2: Pepper    D2: Portion
A3: 12/15/2024         B3: John    C3: Normal    D3: Regular
```

### Correct Format 2:
```
A1: SU-001
A2: Timestamp          B2: Name    C2: Pepper    D2: Portion
A3: 12/15/2024         B3: John    C3: Normal    D3: Regular
```

The app will automatically detect either format!

