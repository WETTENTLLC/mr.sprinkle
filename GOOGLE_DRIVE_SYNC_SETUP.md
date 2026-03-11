# Google Drive Image Sync Setup Guide

This automates syncing images from your Google Drive folder to your live site!

## How It Works

1. **GitHub Actions** runs the sync script daily (or manually)
2. **Python script** connects to your Google Drive folder using Google API
3. **Downloads** any new images from the folder
4. **Commits** them to your GitHub repository
5. **Deploys** automatically to your live site

## Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (click dropdown at top, then "New Project")
3. Name it something like "Mr Sprinkle Image Sync"
4. Wait for creation to complete

### Step 2: Enable Google Drive API

1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

### Step 3: Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **Service Account**
3. Fill in:
   - **Service account name:** `image-sync-bot`
   - **Service account ID:** Auto-filled (ok to keep)
   - **Description:** `Bot for syncing gold teeth images from Google Drive`
4. Click **Create and Continue**
5. Click **Continue** on the next screen (skip optional steps)
6. Click **Done**

### Step 4: Create and Download JSON Key

1. In Credentials, find your service account in the list
2. Click on it to open details
3. Go to the **Keys** tab
4. Click **Add Key** → **Create new key** → **JSON**
5. A JSON file will download automatically
6. **Keep this file safe** - it contains sensitive credentials

### Step 5: Share Google Drive Folder with Service Account

1. In the downloaded JSON file, find the `"client_email"` value (looks like: `image-sync-bot@YOUR-PROJECT.iam.gserviceaccount.com`)
2. Copy that email address
3. Go to your [Google Drive folder](https://drive.google.com/drive/folders/1fg2v0J0Wy07823BBfyhGg07fPNSbn7m0)
4. Right-click → **Share**
5. Paste the service account email
6. Give it **Editor** access (so it can read files)
7. Uncheck "Notify people" (it's a bot)
8. Click **Share**

### Step 6: Add Credentials to GitHub

1. Go to your GitHub repository: https://github.com/WETTENTLLC/mr.sprinkle
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `GOOGLE_DRIVE_CREDENTIALS`
5. Value: Copy the **entire contents** of the JSON file (from Step 4)
6. Click **Add secret**

---

## That's It! 🎉

The automation is now active! 

### How to Use

**Images will sync automatically:**
- Every day at 2 AM UTC
- OR manually: Go to **Actions** tab on GitHub → **Sync Google Drive Images** → **Run workflow**

### Testing

1. Upload a test image to your [Google Drive folder](https://drive.google.com/drive/folders/1fg2v0J0Wy07823BBfyhGg07fPNSbn7m0)
2. Go to GitHub Actions tab
3. Click **Sync Google Drive Images** → **Run workflow**
4. Images will download and appear in `assets/gold-teeth-images/` within minutes
5. They'll automatically deploy to your live site

### Update Schedule

To change when it runs, edit `.github/workflows/sync-google-drive-images.yml`:

```yaml
schedule:
  - cron: '0 2 * * *'  # Currently: 2 AM UTC daily
```

Common cron patterns:
- `0 8 * * *` = 8 AM UTC (3 AM PST)
- `0 * * * *` = Every hour
- `0 0 * * 0` = Weekly on Sunday

---

## Troubleshooting

**Images not syncing?**
- Check GitHub Actions tab for error messages
- Verify service account has access to folder (shared correctly)
- Ensure GOOGLE_DRIVE_CREDENTIALS secret is added

**Need to revoke access?**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Find the service account in "Apps with access"
3. Click remove

---

## Images Storage Location

New images will be saved to: `assets/gold-teeth-images/`

They're automatically optimized (converted to JPEG, quality 85) to save space while maintaining quality.
