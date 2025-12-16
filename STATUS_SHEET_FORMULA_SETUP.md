# Status Sheet Formula Setup

## Current Issue
Your Status sheet has "SU-000" as a static value in B1. It needs a **formula** to automatically pull the latest value from "Form Responses 2" tab.

## Solution

### Step 1: Add Formula to Status Sheet B1

1. **Go to your Status sheet** (the tab that's currently showing "Current Serving" in A1 and "SU-000" in B1)

2. **Click on cell B1** (the one with "SU-000")

3. **Clear the current value** (delete "SU-000")

4. **Enter this formula:**
   ```
   =INDEX('Form Responses 2'!B:B, COUNTA('Form Responses 2'!B:B))
   ```

5. **Press Enter**

### What This Formula Does
- `'Form Responses 2'!B:B` - Looks at column B in the "Form Responses 2" tab
- `COUNTA('Form Responses 2'!B:B)` - Counts how many non-empty cells are in column B
- `INDEX(..., COUNTA(...))` - Gets the value from the last row in column B

### Step 2: Verify It Works

1. **Go to "Form Responses 2" tab**
2. **Manually add a test entry** in column B (e.g., "SU-001")
3. **Go back to Status sheet**
4. **Cell B1 should now show "SU-001"**

### Step 3: Test Auto-Update

1. **Open your admin page**
2. **Click "Next Customer"**
3. **Check "Form Responses 2" tab** - you should see a new row with "SU-001" (or next number)
4. **Check Status sheet B1** - it should automatically update to show the latest value

## Your Current Setup

Based on your screenshots:
- ✅ **Form Responses 1**: Main queue form (Timestamp, Name, Pepper, Portion)
- ✅ **Form Responses 2**: Status form responses (Timestamp, Current Serving)
- ✅ **Status sheet**: Should have formula in B1 to pull from Form Responses 2

## Troubleshooting

**If the formula doesn't work:**
- Make sure the tab name is exactly "Form Responses 2" (with quotes in the formula)
- If your tab has a different name, update the formula:
  ```
  =INDEX('Your Tab Name'!B:B, COUNTA('Your Tab Name'!B:B))
  ```

**If Status sheet shows error:**
- Check that "Form Responses 2" tab exists
- Make sure column B in "Form Responses 2" has data

## Alternative: Direct Value Update

If you prefer to manually update the Status sheet B1 instead of using a formula:
- Just type the new value directly in B1 when you click "Next Customer"
- The app will read it within 3 seconds

But the formula method is better because it updates automatically! 🎉

