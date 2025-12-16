# QR Code Guide

## Quick QR Code Generation

### Option 1: Use the Built-in Generator

1. Deploy your site to Netlify
2. Visit: `https://your-site.netlify.app/qr-generator.html`
3. Enter your Netlify URL
4. Choose size and generate
5. Download the QR code

### Option 2: Online QR Code Generators

Use any of these free services:

1. **QR Code Generator** - [qrcode.tec-it.com](https://www.qrcode-tec-it.com/)
2. **QR Code Monkey** - [qrcode-monkey.com](https://www.qrcode-monkey.com/)
3. **QR Code Generator** - [qr-code-generator.com](https://www.qr-code-generator.com/)

Simply paste your Netlify URL and download the QR code.

### Option 3: Command Line (if you have Node.js)

```bash
npm install -g qrcode
qrcode "https://your-site.netlify.app" -o qr-code.png
```

## Recommended QR Code Settings

- **Size**: 300-500px for printing
- **Error Correction**: Medium to High (for better scanning)
- **Format**: PNG (for printing) or SVG (for web)
- **Color**: Black on white (best for scanning)

## Printing Tips

1. **Test First**: Scan the QR code with your phone before printing
2. **Size Matters**: 
   - Small prints: 2x2 inches minimum
   - Large displays: 4x4 inches or larger
3. **Quality**: Print at 300 DPI or higher
4. **Contrast**: Ensure high contrast (black on white)
5. **Quiet Zone**: Leave white space around the QR code

## Placement Ideas

- **Posters**: Large QR code at eye level
- **Tables**: Small QR codes on each table
- **Flyers**: Medium-sized QR code with clear instructions
- **Digital Displays**: Show QR code on screens/TVs

## Testing Your QR Code

1. Generate the QR code
2. Scan with your phone's camera
3. Verify it opens the correct website
4. Test on different devices (iOS, Android)
5. Test in different lighting conditions

## Troubleshooting

**QR code doesn't scan:**
- Increase size
- Improve contrast
- Add more quiet zone (white space)
- Check for damage/smudges

**QR code scans but wrong URL:**
- Verify the URL is correct
- Regenerate the QR code
- Clear browser cache

## Example URLs

After deployment, your QR code should point to:
- `https://your-site.netlify.app` (main site)
- Or a custom domain if configured

