# Reset Queue - Start Fresh

## Quick Reset Steps

### Step 1: Reset Status Sheet (Most Important!)

1. **Open your Google Sheet**: `https://docs.google.com/spreadsheets/d/1rSZoNeQjKfWLW0aJoZqs38aG9BMTMz547MVP6QFiNtw/edit`
2. **Go to "Status" tab** (at the bottom)
3. **Click on cell B1**
4. **Delete everything** in that cell
5. **Type: `SU-000`** (or leave it empty if you have a formula)
6. **Press Enter**

### Step 2: Clear All Form Responses

#### Option A: Via Google Forms (Easiest)

**For Main Queue Form:**
1. Open: `https://docs.google.com/forms/d/e/1FAIpQLSctFgoQkg8aTeron5gon5uC1thSqk8xmx1caadCmuMzk0frmg/viewform`
2. Click **"Responses"** tab
3. Click the **three dots (⋮)** next to the Google Sheets icon
4. Select **"Delete all responses"**
5. Confirm deletion

**For Status Form:**
1. Open: `https://docs.google.com/forms/d/e/1FAIpQLSffuGdmjKo2RDGXzVnH6mbSYTwYmmy-j4r7mnvga8IO9TTAQQ/viewform`
2. Click **"Responses"** tab
3. Click the **three dots (⋮)** next to the Google Sheets icon
4. Select **"Delete all responses"**
5. Confirm deletion

#### Option B: Via Google Sheets (Manual)

1. **Go to "Form Responses 1" tab**
2. **Select rows 2 to the end** (all data rows, keep header row)
3. **Right-click → Delete rows**
4. **Go to "Form Responses 2" tab**
5. **Select rows 2 to the end** (all data rows, keep header row)
6. **Right-click → Delete rows**

### Step 3: Reset Admin Dashboard

1. **Open your Admin page**: `https://grand-cobbler-4df3dc.netlify.app/admin`
2. **Click "Reset Queue"** button
3. **Confirm the reset**

### Step 4: Clear Browser Storage (Optional but Recommended)

1. **Open your browser's Developer Tools** (F12)
2. **Go to "Application" tab** (Chrome) or "Storage" tab (Firefox)
3. **Click "Local Storage"** → Your site URL
4. **Delete all items** (or just delete `currentServing`)
5. **Click "Session Storage"** → Your site URL
6. **Delete all items**

## Verify Everything is Reset

After resetting:

1. ✅ **Status Sheet B1**: Should be `SU-000` or empty
2. ✅ **Form Responses 1**: Should only have header row
3. ✅ **Form Responses 2**: Should only have header row
4. ✅ **Admin "Current Serving"**: Should be `SU-000`

## Test the Flow

1. **Scan QR code** or go to: `https://grand-cobbler-4df3dc.netlify.app`
2. **Click "Join the Queue"**
3. **Fill out the form** (name, pepper, portion)
4. **Submit** → You should see "Getting Your Queue Number..."
5. **Wait a few seconds** → You should see your queue number (SU-001)
6. **You should see:**
   - Your queue number
   - "Now Serving: SU-000"
   - "Please relax. We'll call you shortly."
   - **"While You Wait..." section with "Play Christmas Trivia" button**
7. **Go to Admin page** → You should see the customer in "Waiting" section
8. **Click "Next Customer"** → Current serving becomes SU-001
9. **User's page updates** → Shows "It's your turn!"

## Troubleshooting

If the trivia section doesn't show:
- Make sure `currentServing` is `SU-000` or less than your queue number
- Check that you're not marked as "served"
- Refresh the page

If admin doesn't see customers:
- Make sure Google Sheet is public
- Check browser console for errors
- Verify GID is correct (781723879 for Form Responses 1)

