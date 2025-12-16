# How to Find Your Actual Entry IDs

## ⚠️ Important: Sentinel vs Actual Entry IDs

The `entry.XXXXX_sentinel` fields you're seeing are **NOT** the entry IDs you need. These are hidden internal fields that Google Forms uses.

## ✅ What You Need to Find

You need to find the **actual input fields** for your questions:
- Name field entry ID
- Pepper Level field entry ID  
- Portion Type field entry ID

## 🔍 Method 1: Search for Input Fields (Recommended)

1. In the page source (Ctrl+F / Cmd+F), search for: `name="entry.`
2. **Skip** any that say `_sentinel` - those are not what you need
3. Look for entries that correspond to your form fields:
   - The **first** `entry.XXXXX` (without sentinel) = Name field
   - The **second** `entry.XXXXX` (without sentinel) = Pepper Level field
   - The **third** `entry.XXXXX` (without sentinel) = Portion Type field

## 🔍 Method 2: Look for Question Labels

1. In page source, search for your question text:
   - Search for: "Name or Nickname" or "Pepper Level" or "Portion Type"
2. Near each question, you'll find an `<input>` tag with `name="entry.XXXXX"`
3. That's your entry ID!

## 🔍 Method 3: Network Tab (Most Reliable)

1. Open your Google Form
2. Press **F12** → Go to **Network** tab
3. Fill out the form:
   - Name: "Test User"
   - Pepper: "Normal" 
   - Portion: "Regular"
4. Click **Submit**
5. In Network tab, find the request to `formResponse`
6. Click on it → Go to **Payload** or **Form Data** tab
7. You'll see:
   ```
   entry.123456789: Test User
   entry.987654321: Normal
   entry.111222333: Regular
   ```
8. These are your entry IDs in order!

## 📝 Example of What to Look For

**❌ WRONG (Sentinel - ignore these):**
```html
<input type="hidden" name="entry.1825114017_sentinel">
<input type="hidden" name="entry.682541457_sentinel">
```

**✅ CORRECT (Actual form fields):**
```html
<input name="entry.123456789" ...>  <!-- Name field -->
<input name="entry.987654321" ...>  <!-- Pepper field -->
<input name="entry.111222333" ...>  <!-- Portion field -->
```

## 🎯 Quick Checklist

- [ ] Found entry IDs that do NOT have `_sentinel` in the name
- [ ] Found 3 different entry IDs (one for each question)
- [ ] Verified the order matches: Name → Pepper → Portion
- [ ] Tested by submitting a form and checking Network tab

---

**Once you have them, update `src/components/Registration.jsx` line 42-46 with your actual entry IDs!**

