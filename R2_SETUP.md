# ⚡ Cloudflare R2 Setup Guide

## 🎯 Why Cloudflare R2?
- ✅ **10GB FREE** storage
- ✅ **NO egress fees** (unlimited downloads)
- ✅ **Global CDN** for fast access
- ✅ **S3-compatible** API
- ✅ **Reliable** and fast

## 📋 Step-by-Step Setup

### Step 1: Create Cloudflare Account
1. Go to: https://cloudflare.com
2. Click "Sign Up" (free account)
3. Verify your email

### Step 2: Enable R2 Storage
1. In your Cloudflare dashboard, go to **R2 Object Storage**
2. Click **"Create bucket"**
3. Configure:
   - **Bucket name**: `construction-videos`
   - **Region**: Choose closest to you (e.g., `us-east-1`)
   - **Public bucket**: ❌ No (keep private)
4. Click **"Create bucket"**

### Step 3: Generate API Keys
1. Go to **My Profile** → **API Tokens**
2. Click **"Create Custom Token"**
3. Configure:
   - **Token name**: `Construction Monitoring R2`
   - **Permissions**: 
     - ✅ `Object Read & Write`
     - ✅ `Bucket Read & Write`
   - **Account Resources**: `All accounts`
   - **Zone Resources**: `All zones`
4. Click **"Continue to summary"** then **"Create Token"**
5. **SAVE THESE DETAILS** (you won't see them again):
   - Account ID
   - Access Key ID
   - Secret Access Key

### Step 4: Configure Environment File

Edit your `.env` file with these settings:

```bash
# Video Storage Configuration
STORAGE_PROVIDER=r2
LOCAL_VIDEO_PATH=./uploads/videos
MAX_VIDEO_SIZE=100MB
VIDEO_RETENTION_DAYS=30

# Cloudflare R2 Configuration
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
R2_BUCKET=construction-videos
```

**Replace with your actual values:**
- `YOUR_ACCOUNT_ID`: Your Cloudflare Account ID
- `YOUR_ACCESS_KEY_ID`: Your R2 Access Key ID
- `YOUR_SECRET_ACCESS_KEY`: Your R2 Secret Access Key

### Step 5: Test Your Setup

1. **Start your server:**
```bash
npm run dev
```

2. **Test storage info endpoint:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/videos/storage/info
```

3. **Expected response:**
```json
{
  "success": true,
  "data": {
    "storageInfo": {
      "provider": "r2",
      "localPath": "./uploads/videos",
      "retentionDays": 30,
      "cloudConfigured": true,
      "freeTierInfo": {
        "free": true,
        "limit": "10GB free"
      }
    }
  }
}
```

## 💰 Cost Breakdown

### Free Tier (10GB):
- ✅ **Storage**: 10GB free
- ✅ **Requests**: Unlimited
- ✅ **Downloads**: Unlimited (no egress fees!)
- ✅ **Uploads**: Unlimited

### After Free Tier:
- **Storage**: $0.015/GB/month
- **Requests**: $0.36 per million requests
- **Downloads**: FREE (no egress fees!)

### Example Costs:
- **5 workers × 30 days × 2GB = 300GB**
- **Cost**: $0 (first 10GB) + (290GB × $0.015) = **$4.35/month**

## 🔧 Troubleshooting

### "Invalid credentials" error:
- Check your Access Key ID and Secret Access Key
- Ensure the API token has correct permissions

### "Bucket not found" error:
- Verify bucket name is exactly `construction-videos`
- Check your Account ID in the endpoint URL

### "Upload failed" error:
- Check internet connection
- Verify bucket permissions
- Check file size limits

## 🚀 Production Tips

1. **Monitor usage** in Cloudflare dashboard
2. **Set up alerts** for approaching 10GB limit
3. **Compress videos** to reduce storage needs
4. **Clean up old videos** regularly
5. **Use retention policies** to auto-delete old files

## 📊 Storage Strategy

### For Small Team (5-10 workers):
```bash
STORAGE_PROVIDER=r2
VIDEO_RETENTION_DAYS=30
# 10 workers × 30 days × 2GB = 600GB
# Cost: $0 (10GB free) + (590GB × $0.015) = $8.85/month
```

### For Testing/MVP:
```bash
STORAGE_PROVIDER=r2
VIDEO_RETENTION_DAYS=7
# 5 workers × 7 days × 2GB = 70GB
# Cost: $0 (10GB free) + (60GB × $0.015) = $0.90/month
```

## 🎉 You're Ready!

Your construction monitoring system is now configured with Cloudflare R2:
- ✅ **10GB free storage**
- ✅ **No egress fees**
- ✅ **Global CDN**
- ✅ **S3-compatible API**
- ✅ **Reliable and fast**

Start uploading videos and your system will automatically store them in R2! 🚀 