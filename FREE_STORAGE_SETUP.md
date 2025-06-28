# 🆓 Free Video Storage Setup Guide

This guide shows you how to set up **completely free** video storage for your construction monitoring system.

## 🎯 Free Storage Options Comparison

| Provider | Free Tier | Best For | Setup Time |
|----------|-----------|----------|------------|
| **🏠 Local Only** | Unlimited | Testing, small teams | 2 minutes |
| **⚡ Cloudflare R2** | 10GB | Small teams | 10 minutes |
| **💾 Backblaze B2** | 10GB | Cost-conscious | 15 minutes |
| **🌐 Google Cloud** | 5GB | Google users | 20 minutes |

## 🏠 Option 1: Local Storage Only (100% Free)

**Perfect for**: Testing, MVP, small teams (1-5 workers)

### Setup (2 minutes):
1. **Set environment:**
```bash
STORAGE_PROVIDER=local
LOCAL_VIDEO_PATH=./uploads/videos
VIDEO_RETENTION_DAYS=7
```

2. **Create directory:**
```bash
mkdir -p uploads/videos
```

3. **Done!** ✅

**Storage Calculation:**
- 5 workers × 7 days × 2GB = 70GB
- **VPS Recommendation**: 100GB storage minimum

**Pros:**
- ✅ 100% FREE forever
- ✅ No external dependencies
- ✅ Fastest access
- ✅ Simple setup

**Cons:**
- ❌ Limited by VPS storage
- ❌ No backup if VPS fails

---

## ⚡ Option 2: Cloudflare R2 (10GB Free)

**Perfect for**: Small teams (5-10 workers), high streaming needs

### Setup (10 minutes):

1. **Create Cloudflare Account**
   - Go to: https://cloudflare.com
   - Sign up (free account)

2. **Enable R2 Storage**
   - Go to R2 Object Storage
   - Click "Create bucket"
   - Name: `construction-videos`
   - Choose region

3. **Create API Token**
   - Go to My Profile → API Tokens
   - Click "Create Custom Token"
   - Template: "Custom token"
   - Permissions: Object Read & Write
   - Save the token details

4. **Configure Environment**
```bash
STORAGE_PROVIDER=r2
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET=construction-videos
```

**Free Tier Limits:**
- ✅ 10GB storage free
- ✅ Unlimited requests
- ✅ No egress fees
- ✅ Global CDN

**Cost After Free Tier:**
- $0.015/GB/month (very cheap!)

---

## 💾 Option 3: Backblaze B2 (10GB Free)

**Perfect for**: Cost-conscious users, long-term storage

### Setup (15 minutes):

1. **Create Backblaze Account**
   - Go to: https://backblaze.com
   - Sign up for B2 Cloud Storage (free)

2. **Create Bucket**
   - Go to B2 Cloud Storage
   - Click "Create Bucket"
   - Name: `construction-videos`
   - Choose region

3. **Create Application Key**
   - Go to App Keys
   - Click "Add New Application Key"
   - Save Key ID and Application Key

4. **Configure Environment**
```bash
STORAGE_PROVIDER=b2
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
B2_ACCESS_KEY_ID=your_key_id
B2_SECRET_ACCESS_KEY=your_application_key
B2_BUCKET=construction-videos
```

**Free Tier Limits:**
- ✅ 10GB storage free
- ✅ 1GB download/day free
- ✅ Unlimited uploads

**Cost After Free Tier:**
- $0.005/GB/month (cheapest!)
- $0.01/GB download

---

## 🌐 Option 4: Google Cloud Storage (5GB Free)

**Perfect for**: Google ecosystem users, small projects

### Setup (20 minutes):

1. **Create Google Cloud Account**
   - Go to: https://cloud.google.com
   - Sign up (requires credit card for verification)
   - Get $300 free credits for 90 days

2. **Create Storage Bucket**
   - Go to Cloud Storage
   - Click "Create Bucket"
   - Name: `construction-videos`
   - Choose region

3. **Create Service Account**
   - Go to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name: `construction-monitoring`
   - Role: Storage Object Admin
   - Create and download JSON key

4. **Configure Environment**
```bash
STORAGE_PROVIDER=gcs
GCS_ENDPOINT=https://storage.googleapis.com
GCS_ACCESS_KEY_ID=your_access_key
GCS_SECRET_ACCESS_KEY=your_secret_key
GCS_REGION=us-central1
GCS_BUCKET=construction-videos
```

**Free Tier Limits:**
- ✅ 5GB storage free
- ✅ 1GB download/day free
- ✅ $300 free credits for 90 days

**Cost After Free Tier:**
- $0.02/GB/month

---

## 🚀 Quick Start Guide

### Step 1: Choose Your Free Option

**For Testing/MVP:**
```bash
STORAGE_PROVIDER=local
```

**For Small Team (5-10 workers):**
```bash
STORAGE_PROVIDER=r2
```

**For Cost-Conscious:**
```bash
STORAGE_PROVIDER=b2
```

### Step 2: Copy Environment Template
```bash
cp env.example .env
```

### Step 3: Configure Your Choice
Edit `.env` file with your chosen provider settings.

### Step 4: Test Setup
```bash
# Start server
npm run dev

# Test storage info
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/videos/storage/info
```

Expected response:
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

## 💰 Cost Comparison (Free Tiers)

| Provider | Free Storage | Free Downloads | Best For |
|----------|-------------|----------------|----------|
| **Local** | Unlimited | Unlimited | Testing |
| **R2** | 10GB | Unlimited | Small teams |
| **B2** | 10GB | 1GB/day | Cost-conscious |
| **GCS** | 5GB | 1GB/day | Google users |

## 📊 Storage Strategy for Free Tiers

### For 5 Workers (Small Team):
```bash
STORAGE_PROVIDER=r2
VIDEO_RETENTION_DAYS=7
# 5 workers × 7 days × 2GB = 70GB
# R2: 10GB free + 60GB × $0.015 = $0.90/month
```

### For 10 Workers (Medium Team):
```bash
STORAGE_PROVIDER=b2
VIDEO_RETENTION_DAYS=7
# 10 workers × 7 days × 2GB = 140GB
# B2: 10GB free + 130GB × $0.005 = $0.65/month
```

### For Testing/MVP:
```bash
STORAGE_PROVIDER=local
VIDEO_RETENTION_DAYS=3
# 100% FREE
```

## 🔄 Switching Between Free Options

You can easily switch between free providers:

```bash
# Start with local
STORAGE_PROVIDER=local

# Upgrade to R2 when needed
STORAGE_PROVIDER=r2

# Switch to B2 for cheaper storage
STORAGE_PROVIDER=b2

# Back to local for testing
STORAGE_PROVIDER=local
```

## 🎯 Recommendations

### **Start Here (100% Free):**
```bash
STORAGE_PROVIDER=local
VIDEO_RETENTION_DAYS=7
```

### **Upgrade When You Need Cloud:**
```bash
STORAGE_PROVIDER=r2
VIDEO_RETENTION_DAYS=30
```

### **For Maximum Savings:**
```bash
STORAGE_PROVIDER=b2
VIDEO_RETENTION_DAYS=30
```

## 🚨 Important Notes

1. **Always start with local storage** for testing
2. **Monitor your usage** to stay within free limits
3. **Set up alerts** for approaching limits
4. **Compress videos** to reduce storage needs
5. **Clean up old videos** regularly

## 🆘 Troubleshooting

### "Storage not configured" error:
- Check your `.env` file
- Verify API keys are correct
- Ensure bucket exists

### "Upload failed" error:
- Check internet connection
- Verify bucket permissions
- Check file size limits

### "Free tier exceeded" error:
- Switch to local storage
- Compress videos more
- Reduce retention period

---

## 🎉 You're All Set!

With these free options, you can run your construction monitoring system for **$0-1/month** instead of $150+ with AWS!

**Next Steps:**
1. Choose your free storage option
2. Set up the configuration
3. Test with a few videos
4. Scale up as needed

Your system is now cost-effective and ready for production! 🚀 