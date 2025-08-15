# ODS File Setup Guide

## How to use your downloaded ODS file with images

### 1. Place the ODS file
Place your downloaded ODS file in the `data/` directory and name it `handhelds.ods`:

```
handheld-comparison/
├── data/
│   └── handhelds.ods    # <- Place your file here
├── src/
└── public/
```

### 2. File Structure Expected
The ODS parser expects the following column structure:

| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| Image    | Name     | Brand    | Released | Form Factor | OS |

### 3. Image Handling
- Images embedded in the ODS file will be automatically extracted
- They'll be saved to `public/handheld-images/` directory
- The images will be automatically served as `/handheld-images/device_1.jpg`, `/handheld-images/device_2.png`, etc.

### 4. Fallback Behavior
- If the ODS file is not found or fails to parse, the system automatically falls back to Google Sheets
- This ensures the site continues working even without the ODS file

### 5. Testing
After placing your ODS file, restart the development server:

```bash
npm run dev
```

Then test the API:
```bash
curl http://localhost:3000/api/handhelds?bypass=true
```

### 6. File Location
Make sure your ODS file is at:
```
/home/chris/repos/CursorDesktopTest/CursonDesktopTest/handheld-comparison/data/handhelds.ods
```

The system will automatically:
1. ✅ Extract all images from the ODS file
2. ✅ Parse all device data
3. ✅ Serve images locally for faster loading
4. ✅ Fall back to Google Sheets if needed