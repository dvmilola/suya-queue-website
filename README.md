# Suya Unit QR Website

A React-based, mobile-first queue management system for the Suya stand at the church Christmas Carol event. Built with React + Vite, using Google Forms and Google Sheets for data storage.

## 🎯 Features

### User Side
- ✅ **Join Queue** - Simple registration form
- ✅ **Select Preferences** - Pepper level and portion type
- ✅ **Queue Number** - Auto-generated queue number (SU-001, SU-002, etc.)
- ✅ **Real-time Status** - View current serving number
- ✅ **Christmas Trivia** - Entertaining game while waiting

### Admin Side
- ✅ **Admin Dashboard** - Manage queue at `/admin`
- ✅ **Serve Next** - Increment serving number
- ✅ **Reset Queue** - Clear all queue data
- ✅ **Queue List** - View all waiting customers
- ✅ **Google Sheets Integration** - Real-time data sync

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn/pnpm

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open in browser:**
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder, ready for static hosting.

## 📋 Google Forms & Sheets Setup

### Step 1: Create Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Create a new form with these fields:
   - **Name** (Short answer, optional)
   - **Pepper Level** (Multiple choice: No Pepper, Normal, Extra)
   - **Portion Type** (Multiple choice: Regular, Kids)
3. Click the **Responses** tab
4. Click the **Google Sheets** icon (📊) to create a linked spreadsheet
5. Copy the **Form URL** and **Sheets URL**

### Step 2: Get Form Entry IDs

1. Open your Google Form
2. Right-click → **Inspect** (or F12)
3. Go to the **Network** tab
4. Submit a test response
5. Look for a request to `formResponse` - the entry IDs will be in the form data
6. Alternatively, use this method:
   - View page source
   - Search for `entry.` - you'll find entries like `entry.123456789`
   - Note these IDs for each field

### Step 3: Configure the App

1. Open the app and navigate to `/admin`
2. Click **Configure Google Sheets/Forms**
3. Enter:
   - **Google Sheets URL**: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - **Google Form URL**: `https://docs.google.com/forms/d/YOUR_FORM_ID/viewform`
4. Click **Save Configuration**

### Step 4: Update Form Submission Code

Edit `src/components/Registration.jsx` and update the `entryIds` object with your actual form entry IDs:

```javascript
const entryIds = {
  name: 'entry.123456789',    // Replace with your actual entry ID
  pepper: 'entry.987654321',  // Replace with your actual entry ID
  portion: 'entry.111222333'  // Replace with your actual entry ID
}
```

### Step 5: Make Google Sheets Public

1. Open your Google Sheet
2. Click **Share** → **Change to anyone with the link**
3. Set permission to **Viewer**
4. This allows the app to read CSV data

## 🎨 Customization

### Change Queue Prefix

Edit `src/components/Registration.jsx`:
```javascript
const generateQueueNumber = () => {
  // Change 'SU-' to your desired prefix
  return `SU-${String(number).padStart(3, '0')}`
}
```

### Add More Trivia Questions

Edit `src/components/Trivia.jsx`:
```javascript
const triviaQuestions = [
  {
    question: "Your question?",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correct: 0  // Index of correct answer (0-3)
  },
  // Add more questions...
]
```

### Change Colors

Edit `src/index.css`:
```css
:root {
  --primary-color: #d32f2f;  /* Main red */
  --secondary-color: #ff6f00; /* Accent orange */
  /* ... */
}
```

## 📱 Deployment

### Option 1: GitHub Pages (Free)

1. **Build the project:**
```bash
npm run build
```

2. **Create GitHub repository** and push code

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` / `master`, folder: `/root` or `/docs`
   - If using `/docs`, update `vite.config.js`:
   ```javascript
   build: {
     outDir: 'docs'
   }
   ```

4. **Your site will be live at:**
```
https://YOUR_USERNAME.github.io/REPO_NAME
```

### Option 2: Netlify (Free)

1. **Build the project:**
```bash
npm run build
```

2. **Drag and drop** the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)

3. **Or use Netlify CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option 3: Vercel (Free)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Follow prompts** - Vercel auto-detects Vite

### Option 4: Any Static Host

Upload the contents of the `dist/` folder to any static hosting service.

## 🔗 QR Code Generation

1. **Generate QR Code** pointing to your deployed website URL
2. **Free QR Code Generators:**
   - [QR Code Generator](https://www.qr-code-generator.com/)
   - [QRCode Monkey](https://www.qrcode-monkey.com/)
   - [QRCode.js](https://davidshimjs.github.io/qrcodejs/)

3. **Print and place** at the Suya stand

## 📁 Project Structure

```
suya_website/
├── public/
│   └── assets/          # Images and static assets
├── src/
│   ├── components/      # React components
│   │   ├── Welcome.jsx
│   │   ├── Registration.jsx
│   │   ├── QueueStatus.jsx
│   │   ├── Trivia.jsx
│   │   └── Admin.jsx
│   ├── context/
│   │   └── QueueContext.jsx  # Global state management
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 How It Works

### Data Flow

1. **User Registration:**
   - User fills form → Submits to Google Form
   - Queue number generated based on response index
   - Number stored in browser localStorage

2. **Queue Status:**
   - App polls Google Sheets CSV every 8 seconds
   - Displays current serving number
   - Shows user's position in queue

3. **Admin Management:**
   - Admin updates "Current Serving" number
   - Queue list updates in real-time
   - Can reset queue or serve next customer

### Google Sheets CSV Polling

The app converts Google Sheets URL to CSV export format:
```
https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=0
```

This allows reading data without authentication (if sheet is public).

## 🐛 Troubleshooting

### Google Forms Not Submitting

- **Issue**: Form submission fails
- **Solution**: 
  - Check entry IDs are correct
  - Ensure form URL is correct
  - Check browser console for errors
  - Form submission uses `no-cors` mode (limited error visibility)

### Google Sheets Not Loading

- **Issue**: Queue data not appearing
- **Solution**:
  - Ensure sheet is public (Share → Anyone with link)
  - Check Sheets URL is correct
  - Verify CSV export is enabled
  - Check browser console for CORS errors

### Queue Numbers Not Sequential

- **Issue**: Numbers jump or repeat
- **Solution**: Queue numbers are based on Google Form response index. If responses are deleted, numbers may not be sequential. Consider using timestamp-based generation.

## 📝 Notes

- **No Backend Required**: Fully static, works offline (with localStorage fallback)
- **Privacy**: All data stored in Google Sheets (your control)
- **Mobile-First**: Optimized for phone screens
- **Offline Support**: Basic functionality works without internet
- **Free Hosting**: Can deploy to free static hosts

## 🎄 Features for Judges

- ✅ **Smooth UX**: Professional, intentional design
- ✅ **Innovation**: QR code queue management
- ✅ **Crowd Control**: Reduces noise and disorder
- ✅ **Entertainment**: Trivia game while waiting
- ✅ **Accessibility**: Works for non-tech users (manual fallback)

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify Google Forms/Sheets setup
3. Ensure all URLs are correct
4. Check that sheets are public

---

**Built with ❤️ for the Suya Experience**

Made with React + Vite | 100% Free | No Backend Required
