# Fix Your Status Sheet - Quick Guide

## The Problem
Your Status sheet B1 has a static value "SU-000" instead of a formula. It needs to automatically pull the latest value from "Form Responses 2".

## The Fix (2 Steps)

### Step 1: Add Formula to Status Sheet

1. **Go to your "Status" sheet** (the tab at the bottom)
2. **Click on cell B1** (the one that says "SU-000")
3. **Delete "SU-000"**
4. **Type this formula:**
   ```
   =INDEX('Form Responses 2'!B:B, COUNTA('Form Responses 2'!B:B))
   ```
5. **Press Enter**

### Step 2: Test It

1. **Go to "Form Responses 2" tab**
2. **Manually type "SU-001" in any cell in column B** (e.g., B2)
3. **Go back to "Status" sheet**
4. **Cell B1 should now show "SU-001"** ✅

## How It Works

- When admin clicks "Next Customer" → Submits to Status Form
- Status Form → Writes to "Form Responses 2" tab
- Status sheet B1 formula → Automatically shows latest value from "Form Responses 2"
- All devices → Read Status sheet B1 → See updated number within 3 seconds

## Your Current Setup (Looks Good!)

✅ **Form Responses 1**: Main queue form (Name, Pepper, Portion)  
✅ **Form Responses 2**: Status form responses (Current Serving)  
✅ **Status sheet**: Needs formula in B1 (you're fixing this now!)

## After Adding the Formula

1. The formula will show the latest submission from "Form Responses 2"
2. When admin clicks "Next Customer", it auto-updates
3. All devices see the update within 3 seconds
4. No more manual updates needed! 🎉

