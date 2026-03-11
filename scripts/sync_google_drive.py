#!/usr/bin/env python3
"""
Google Drive Image Sync Script
Syncs images from a Google Drive folder to the assets/gold-teeth-images directory
"""

import os
import json
import sys
from pathlib import Path
from io import BytesIO
from google.oauth2.service_account import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from PIL import Image

# Configuration
GOOGLE_DRIVE_FOLDER_ID = os.environ.get('GOOGLE_DRIVE_FOLDER_ID', '1fg2v0J0Wy07823BBfyhGg07fPNSbn7m0')
CREDENTIALS_JSON = os.environ.get('GOOGLE_DRIVE_CREDENTIALS', '{}')
OUTPUT_DIR = Path('assets/gold-teeth-images')

# Supported image formats
SUPPORTED_FORMATS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

def get_drive_service():
    """Authenticate and return Google Drive service"""
    try:
        credentials_dict = json.loads(CREDENTIALS_JSON)
        credentials = Credentials.from_service_account_info(
            credentials_dict,
            scopes=['https://www.googleapis.com/auth/drive.readonly']
        )
        return build('drive', 'v3', credentials=credentials)
    except Exception as e:
        print(f"Error authenticating with Google Drive: {e}")
        print("\n⚠️  SETUP REQUIRED:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Create a service account and download JSON key")
        print("3. Add the JSON content as a GitHub secret: GOOGLE_DRIVE_CREDENTIALS")
        print("4. Share the Google Drive folder with the service account email")
        sys.exit(1)

def list_images_in_folder(service, folder_id):
    """List all image files in a Google Drive folder"""
    try:
        query = f"'{folder_id}' in parents and mimeType contains 'image/' and trashed=false"
        results = service.files().list(
            q=query,
            spaces='drive',
            fields='files(id, name, mimeType, createdTime)',
            pageSize=1000
        ).execute()
        return results.get('files', [])
    except Exception as e:
        print(f"Error listing files: {e}")
        return []

def download_image(service, file_id, file_name):
    """Download image from Google Drive"""
    try:
        request = service.files().get_media(fileId=file_id)
        file_stream = BytesIO()
        downloader = MediaIoBaseDownload(file_stream, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()
        file_stream.seek(0)
        return file_stream
    except Exception as e:
        print(f"Error downloading {file_name}: {e}")
        return None

def save_image(file_stream, file_name):
    """Save and optimize image"""
    try:
        img = Image.open(file_stream)
        
        # Optimize by converting to RGB if needed
        if img.mode == 'RGBA':
            rgb_img = Image.new('RGB', img.size, (0, 0, 0))
            rgb_img.paste(img, mask=img.split()[3])
            img = rgb_img
        
        # Save with optimization
        output_path = OUTPUT_DIR / file_name
        img.save(output_path, 'JPEG', quality=85, optimize=True)
        return True
    except Exception as e:
        print(f"Error saving {file_name}: {e}")
        return False

def main():
    """Main sync function"""
    print("🔄 Starting Google Drive image sync...")
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Get existing files
    existing_files = {f.name for f in OUTPUT_DIR.glob('*')}
    
    # Authenticate
    service = get_drive_service()
    print("✅ Authenticated with Google Drive")
    
    # List images in folder
    images = list_images_in_folder(service, GOOGLE_DRIVE_FOLDER_ID)
    print(f"📁 Found {len(images)} images in Google Drive folder")
    
    if not images:
        print("No images found in the specified folder")
        return
    
    # Download new images
    new_count = 0
    for idx, file_info in enumerate(images, 1):
        file_id = file_info['id']
        file_name = file_info['name']
        
        # Check if file extension is supported
        file_ext = Path(file_name).suffix.lower()
        if file_ext not in SUPPORTED_FORMATS:
            print(f"⏭️  Skipping {file_name} (unsupported format)")
            continue
        
        # Skip if already exists
        if file_name in existing_files:
            print(f"✓ {file_name} (already exists)")
            continue
        
        # Download and save
        print(f"⬇️  Downloading {file_name}... ({idx}/{len(images)})")
        file_stream = download_image(service, file_id, file_name)
        if file_stream:
            if save_image(file_stream, file_name):
                print(f"✅ Saved: {file_name}")
                new_count += 1
            else:
                print(f"❌ Failed to save: {file_name}")
    
    print(f"\n📊 Sync Complete!")
    print(f"✨ New images downloaded: {new_count}")
    print(f"📂 Total images in folder: {len([f for f in OUTPUT_DIR.glob('*')])}")

if __name__ == '__main__':
    main()
