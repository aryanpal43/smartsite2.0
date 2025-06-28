# 📹 Video Storage Setup Guide

This guide shows you how to configure different video storage options for your construction monitoring system.

## 🎯 Storage Options Comparison

| Provider | Cost | Best For | Setup Difficulty |
|----------|------|----------|------------------|
| **Local Only** | $0 | Small scale, testing | ⭐ |
| **DigitalOcean Spaces** | $5/month (250GB) | Medium scale | ⭐⭐ |
| **Cloudflare R2** | $0.015/GB/month | High streaming | ⭐⭐⭐ |
| **Backblaze B2** | $0.005/GB/month | Long-term archival | ⭐⭐ |

## 🏠 Option 1: Local Storage Only (Recommended for Start)

**Best for**: Testing, small teams (1-10 workers), limited budget

### Setup:
1. Set in your `.env` file:
```bash
STORAGE_PROVIDER=local
LOCAL_VIDEO_PATH=./uploads/videos
VIDEO_RETENTION_DAYS=30
```

2. Create uploads directory:
```bash
mkdir -p uploads/videos
```

**Pros:**
- ✅ Zero cost
- ✅ Fastest access
- ✅ No external dependencies
- ✅ Simple setup

**Cons:**
- ❌ Limited by VPS storage
- ❌ No backup if VPS fails
- ❌ Not scalable for large teams

**Storage Calculation:**
- 8-hour shift = ~2GB video
- 10 workers × 30 days = 600GB
- **VPS Recommendation**: 1TB storage minimum

---

## 🌊 Option 2: DigitalOcean Spaces (Recommended for Production)

**Best for**: Medium teams (10-50 workers), reliable cloud storage

### Setup:

1. **Create DigitalOcean Account**
   - Go to: https://digitalocean.com
   - Sign up and add payment method

2. **Create Spaces Bucket**
   - Go to Spaces in DigitalOcean dashboard
   - Click "Create a Space"
   - Choose region (nyc3, sfo3, ams3)
   - Name: `construction-videos`
   - Set to Private

3. **Generate API Keys**
   - Go to API → Spaces Keys
   - Click "Generate New Key"
   - Save the Key and Secret

4. **Configure Environment**
```bash
STORAGE_PROVIDER=do
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your_spaces_key_here
DO_SPACES_SECRET=your_spaces_secret_here
DO_SPACES_REGION=nyc3
DO_SPACES_BUCKET=construction-videos
```

**Cost Example:**
- 50 workers × 30 days × 2GB = 3TB
- Cost: $5 + (2750GB × $0.02) = **$60/month**

**Pros:**
- ✅ Reliable and fast
- ✅ S3-compatible API
- ✅ Good documentation
- ✅ Reasonable pricing

**Cons:**
- ❌ More expensive than alternatives
- ❌ Limited regions

---

## ⚡ Option 3: Cloudflare R2 (Best for High Streaming)

**Best for**: Large teams, high video streaming needs

### Setup:

1. **Create Cloudflare Account**
   - Go to: https://cloudflare.com
   - Sign up for free account

2. **Enable R2 Storage**
   - Go to R2 Object Storage
   - Click "Create bucket"
   - Name: `construction-videos`

3. **Create API Token**
   - Go to My Profile → API Tokens
   - Create Custom Token
   - Permissions: Object Read & Write
   - Save Account ID, Access Key, Secret

4. **Configure Environment**
```bash
STORAGE_PROVIDER=r2
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET=construction-videos
```

**Cost Example:**
- 3TB storage = $45/month
- **No egress fees!** (unlimited streaming)

**Pros:**
- ✅ No egress fees (huge savings!)
- ✅ Global CDN
- ✅ Very fast
- ✅ S3-compatible

**Cons:**
- ❌ Newer service
- ❌ Requires Cloudflare account

---

## 💾 Option 4: Backblaze B2 (Cheapest Storage)

**Best for**: Long-term archival, cost-conscious users

### Setup:

1. **Create Backblaze Account**
   - Go to: https://backblaze.com
   - Sign up for B2 Cloud Storage

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

**Cost Example:**
- 3TB storage = $15/month
- 1TB download = $10/month
- **Total: $25/month**

**Pros:**
- ✅ Cheapest storage
- ✅ Reliable
- ✅ S3-compatible

**Cons:**
- ❌ Download fees
- ❌ Slower than alternatives

---

## 🔧 Testing Your Storage Setup

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
      "provider": "do",
      "localPath": "./uploads/videos",
      "retentionDays": 30,
      "cloudConfigured": true
    }
  }
}
```

## 📊 Storage Strategy Recommendations

### For Small Teams (1-10 workers):
```bash
STORAGE_PROVIDER=local
VIDEO_RETENTION_DAYS=7
```

### For Medium Teams (10-50 workers):
```bash
STORAGE_PROVIDER=do
VIDEO_RETENTION_DAYS=30
```

### For Large Teams (50+ workers):
```bash
STORAGE_PROVIDER=r2
VIDEO_RETENTION_DAYS=90
```

### For Cost-Conscious Users:
```bash
STORAGE_PROVIDER=b2
VIDEO_RETENTION_DAYS=30
```

## 🚨 Important Notes

1. **Always test locally first** before deploying to production
2. **Monitor storage usage** regularly
3. **Set up alerts** for storage limits
4. **Backup your database** regularly
5. **Consider video compression** to reduce costs

## 🔄 Switching Storage Providers

You can easily switch providers by changing `STORAGE_PROVIDER` in your `.env` file:

```bash
# Switch from local to DigitalOcean
STORAGE_PROVIDER=do

# Switch from DigitalOcean to Cloudflare
STORAGE_PROVIDER=r2

# Switch back to local only
STORAGE_PROVIDER=local
```

The system will automatically use the new provider for new uploads. Existing videos will remain in their original location. 