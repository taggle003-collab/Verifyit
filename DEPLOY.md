# Lead Verification Tool - Vercel Deployment Guide

This guide walks you through deploying the Lead Verification Tool to Vercel in 5 minutes.

## Prerequisites

- GitHub account with repository access
- Vercel account (free: vercel.com)
- Supabase project created (supabase.com) - optional, for enhanced features
- SendGrid account (sendgrid.com) - for email delivery
- 5-10 minutes

## Step 1: Prepare Your Environment Variables

Before deployment, gather these credentials:

### SendGrid (sendgrid.com) - Required
1. Create a free account or log in at https://app.sendgrid.com
2. Go to Settings → API Keys
3. Create a new API Key with "Full Access" permissions
4. **Copy the full API key immediately** - you won't see it again after leaving the page
5. Note: Free tier includes 100 emails/day

Optional environment variables:
- `SENDGRID_FROM_EMAIL` - Custom sender email (defaults to `no-reply@taggle.ai`)

### Supabase (supabase.com) - Optional
For enhanced session storage or future database features:
1. Go to your Supabase project settings
2. Copy: `Project URL` (e.g., `https://xyz123.supabase.co`)
3. Copy: `Anon Key` from Project Settings → API

### Taggle Branding
- `NEXT_PUBLIC_TAGGLE_URL` - Your Taggle website URL (defaults to `https://taggle.ai`)

## Step 2: Connect Repository to Vercel

### Option A: Import from GitHub (Recommended)
1. Go to https://vercel.com/dashboard
2. Click **"Add New..." → "Project"**
3. Click **"Import Git Repository"**
4. Search for or paste your GitHub repository URL
5. Click **"Import"**
6. Vercel auto-detects it's a Next.js project ✓

### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Follow the prompts to connect to your GitHub repo
```

## Step 3: Configure Environment Variables in Vercel

After importing, you'll see the "Configure Project" page:

### In Vercel Dashboard:
1. Go to your project settings
2. Click **"Environment Variables"** (left sidebar)
3. Add each variable one by one:

| Variable Name | Value | Type | Required |
|--------------|-------|------|----------|
| `SENDGRID_API_KEY` | Your SendGrid API Key | Secret | **Yes** |
| `NEXT_PUBLIC_TAGGLE_URL` | https://taggle.ai | Public | No (default provided) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Public | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Public | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key | Secret | No |
| `SENDGRID_FROM_EMAIL` | no-reply@taggle.ai | Public | No |

**Important Notes:**
- **Secret variables** are only available on the server-side (API routes)
- **Public variables** (prefixed with `NEXT_PUBLIC_`) can be safely used in browser code
- Copy values **exactly** - no extra spaces or characters
- Press Enter after each variable to save it

## Step 4: Deploy

### Automatic Deployment (Recommended)
1. Vercel auto-deploys when you push to the main branch
2. Every commit triggers a new build
3. Preview deployments are created for pull requests
4. Check the Vercel dashboard for live deployment status

### Manual Deploy via CLI
```bash
# Deploy to production
vercel --prod

# Or through Vercel dashboard:
# Go to Deployments → Click "Deploy" button
```

### First Deployment
The first deployment may take 2-3 minutes as Vercel:
1. Installs all npm dependencies
2. Runs the build process
3. Sets up serverless functions
4. Configures caching

## Step 5: Verify Deployment

Once deployment is complete:

### 1. Check Build Status
- Vercel dashboard shows deployment status (✅ Success or ❌ Failed)
- Click on the deployment to see build logs

### 2. Test Home Page
Visit your deployment URL (e.g., `https://your-app.vercel.app`):
- [ ] Homepage loads correctly
- [ ] Hero section displays properly
- [ ] Verification form is visible and accessible
- [ ] Dark mode toggle works
- [ ] Mobile responsive layout (test on mobile)

### 3. Test Verification Flow
- [ ] Fill out the lead verification form
- [ ] Try submitting without consent checkboxes (should be disabled)
- [ ] Check both consent checkboxes
- [ ] Submit form and verify it reaches results page
- [ ] Verify loading progress indicator shows

### 4. Test Results Page
- [ ] Verdict banner displays correctly
- [ ] Score gauge shows 0-100 score
- [ ] Score breakdown shows all 5 categories
- [ ] Reasons for/against pitching are displayed
- [ ] Company profile card shows information
- [ ] Recommended messaging angles are shown

### 5. Test Export Features
- [ ] PDF download works
- [ ] DOCX download works
- [ ] Email report dialog opens
- [ ] Email delivery (check inbox)

### 6. Test API Routes
```bash
# Test /api/verify endpoint
curl -X POST https://your-app.vercel.app/api/verify \
  -H "Content-Type: application/json" \
  -d '{"lead":{"name":"Test","email":"test@test.com","title":"CEO","company":"TestCo","location":"NYC • Tech","historyWindow":"3months"},"consent_scraping":true,"consent_deletion":true}'

# Expected response: { "analysis_id": "...", "expires_at": "...", "analysis": {...} }
```

## Troubleshooting

### Build Errors

**Error: "Cannot find module 'pdfkit'"**
```bash
# Solution: Install missing dependencies
npm install pdfkit docx @sendgrid/mail

# Or add to package.json dependencies and redeploy
```

**Error: "Vercel deployment timeout"**
- Solution: Reduce scraping timeout from 60s to 30s
- File: `/lib/scraping/scraper.ts`
- Change: `timeoutMs: 30_000` (30 seconds per platform)

**Error: "TypeScript compilation failed"**
- Check TypeScript errors in build logs
- Run locally: `npm run build` to see full error messages
- Common issues: missing imports, type mismatches

### Runtime Errors

**Error: "Supabase connection failed"**
- Check: Environment variables are set correctly in Vercel dashboard
- Verify: `NEXT_PUBLIC_SUPABASE_URL` format is correct (https://...)
- Solution: Redeploy after fixing variables (Settings → Environment Variables → Redeploy)

**Error: "SendGrid authentication failed"**
- Check: `SENDGRID_API_KEY` is copied exactly (no spaces before/after)
- Verify: API key hasn't been revoked in SendGrid dashboard
- Solution: Generate new API key in SendGrid and update Vercel variable

**Error: "Web scraping returns empty results"**
- Reason: Social media platforms rate limit or block automated requests
- This is expected behavior - the tool gracefully handles unavailable platforms
- Solution: 
  - Add delays between scrape requests (already implemented)
  - Use rotating user-agents (already implemented)
  - Results return low-confidence empty signals rather than failing

**Error: "413 Payload Too Large"**
- Solution: Increase body size limit in `next.config.mjs`:
```javascript
experimental: {
  serverActions: {
    bodySizeLimit: '5mb'  // increased from 2mb
  }
}
```

### Environment Variable Issues

**Variables not loading:**
1. Verify all env vars are set in Vercel dashboard
2. Check for typos in variable names (case-sensitive!)
3. Redeploy after adding/changing variables:
   - Vercel Dashboard → Deployments → "..." menu → Redeploy
4. Use `console.log(process.env)` in API routes to debug

**Public variables not accessible in browser:**
- Ensure variable name starts with `NEXT_PUBLIC_`
- Example: `NEXT_PUBLIC_SUPABASE_URL` ✓ (public)
- Example: `SUPABASE_SERVICE_ROLE_KEY` ✓ (secret, not exposed to browser)

### Session Storage Issues

**"Analysis not found" errors:**
- Default session TTL is 24 hours
- In-memory storage resets when serverless functions cold-start
- For production, consider using Redis (e.g., Upstash)
- This is expected for serverless/demo deployments

## Performance Optimization

### For Production Use

1. **Enable Caching** (Vercel → Settings → Functions)
   - Reduces cold starts on API routes
   - Caches results for repeated requests
   - Recommended cache time: 60 seconds for scraping endpoints

2. **Optimize Scraping**
   - Timeout set to 60 seconds total (12 seconds per platform × 5)
   - Request queuing to avoid parallel timeouts
   - Rate limiting (2 seconds between requests per platform)

3. **Serverless Function Settings**
   - Memory: 1024 MB (default is sufficient)
   - Timeout: 60 seconds (for scraping endpoints)
   - Region: Default (closest to your users)

4. **Database (Optional)**
   - Use Supabase for persistent session storage
   - Implement row-level security (RLS)
   - Set up automatic cleanup job for expired sessions

## Custom Domain

To use your own domain (e.g., `verify.yourcompany.com`):

### 1. Add Domain in Vercel
1. Vercel Dashboard → Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `verify.yourcompany.com`)
4. Click "Add"

### 2. Configure DNS Records

**For apex domain** (yourcompany.com):
- Add an A record pointing to `76.76.21.21`

**For subdomain** (verify.yourcompany.com):
- Add a CNAME record pointing to `cname.vercel-dns.com` or `alias.vercel-dns.com`

### 3. Verify and Wait
- DNS propagation takes 5-30 minutes
- Vercel auto-provisions SSL certificate
- Domain becomes live automatically

### Example DNS Configuration:
```
Type    Name                    Value
A       @                       76.76.21.21
CNAME   verify                  cname.vercel-dns.com
```

## Monitoring & Logs

### View Logs
1. Vercel Dashboard → Deployments → [Select deployment]
2. Click "Functions" tab to see API route logs
3. Logs show: errors, scraping issues, email delivery status

### Performance Monitoring
1. Vercel Dashboard → Analytics
2. Monitor: response times, serverless function usage
3. Target: < 30 seconds for most verifications (scraping takes time)

### Error Tracking (Optional)
Set up external error monitoring:
- **Sentry** (sentry.io) - Free tier available
- **LogRocket** (logrocket.com) - Session replay
- **Datadog** (datadoghq.com) - Full observability

Example Sentry integration:
```bash
npm install @sentry/nextjs
```

## Rollback Deployment

If something breaks after deployment:

1. Vercel Dashboard → Deployments
2. Find the previous working version (green checkmark)
3. Click "..." menu → "Promote to Production"
4. Site reverts to previous version in ~30 seconds

## Update & Redeploy

### Push Code Changes
```bash
# Make your changes
git add .
git commit -m "Fix scraping issue"
git push origin main

# Vercel auto-deploys within 1-2 minutes
```

### Update Environment Variables
1. Vercel Dashboard → Settings → Environment Variables
2. Edit or add variables
3. Redeploy: Deployments → "..." menu → Redeploy

### Emergency Hotfix
```bash
# Make quick fix
git commit --amend -m "Hotfix"
git push --force origin main

# Vercel redeploys automatically
```

## Cost & Limitations

### Vercel Pricing (Free Tier)
| Resource | Free Limit | Notes |
|----------|-----------|-------|
| Serverless Functions | 1M requests/month | More than enough for lead verification |
| Bandwidth | 100GB/month | Includes all API responses |
| Deployments | Unlimited | Preview deployments for PRs |
| Custom Domain | Free | SSL included automatically |
| Team Members | 1 | Add more on Pro plan |

### SendGrid Pricing
| Tier | Emails/Day | Cost |
|------|-----------|------|
| Free | 100/day | $0 |
| Essentials | 50K/month | $19.95/month |
| Pro | 100K+/month | $79.95+/month |

### Supabase Pricing (Optional)
| Tier | Storage | Bandwidth | Cost |
|------|---------|-----------|------|
| Free | 500MB | 2GB/month | $0 |
| Pro | 8GB | 250GB/month | $25/month |

**Most use cases fit comfortably in the free tiers.**

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use Secret type for API keys in Vercel
- ✅ Rotate API keys periodically
- ✅ Use different keys for production vs staging

### API Routes
- ✅ Validate all inputs with Zod schemas
- ✅ Return proper error messages without sensitive data
- ✅ Rate limit API endpoints (Vercel handles some automatically)

### Scraping
- ✅ Respect robots.txt where applicable
- ✅ Use rate limiting (already implemented)
- ✅ Add delays between requests (already implemented)
- ⚠️ Be aware of each platform's Terms of Service

### Data Storage
- ✅ No lead data persisted to database (by design)
- ✅ In-memory storage with 24-hour TTL
- ✅ User can delete analysis immediately
- ✅ No PII stored permanently

## Support & Help

### Documentation
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **SendGrid Docs**: https://docs.sendgrid.com
- **Supabase Docs**: https://supabase.com/docs

### Community
- **Vercel Discord**: https://vercel.com/chat
- **GitHub Discussions**: Check repository for Q&A
- **Stack Overflow**: Tag questions with `nextjs`, `vercel`, `sendgrid`

### Common Issues
1. **"Analysis not found"** - Session expired (24-hour TTL) or cold start
2. **"SendGrid failed"** - Check API key and from email verification
3. **"Scraping timeout"** - Expected for some platforms; tool handles gracefully
4. **"Styles broken"** - Check Tailwind configuration in Vercel

## Next Steps After Deployment

1. ✅ Share deployment URL with your team
2. ✅ Test with real leads (X, LinkedIn, Reddit profiles)
3. ✅ Iterate on scoring algorithm based on test results
4. ✅ Add custom domain for professional branding
5. ✅ Monitor Vercel analytics for performance
6. ✅ Set up error tracking (Sentry recommended for production)
7. ✅ Configure custom from email in SendGrid (verify sender identity)
8. ✅ Consider upgrading to Pro plans if usage increases

## Quick Reference

### Important Files
```
/app/page.tsx                 # Home page with form
/app/results/page.tsx         # Results display
/app/api/verify/route.ts      # Main verification API
/app/api/send-email/route.ts  # Email delivery API
/lib/scraping/scraper.ts      # Scraping coordinator
/lib/analysis/scorer.ts       # Lead scoring algorithm
/lib/session-store.ts         # In-memory TTL storage
```

### Key Environment Variables
```bash
SENDGRID_API_KEY              # Required for email
NEXT_PUBLIC_TAGGLE_URL        # Your branding URL
NEXT_PUBLIC_SUPABASE_URL      # Optional database
NEXT_PUBLIC_SUPABASE_ANON_KEY # Optional database
```

### Deployment Commands
```bash
# Deploy to production
vercel --prod

# View logs
vercel logs --prod

# Add custom domain
vercel domains add verify.yourcompany.com
```

---

**You're now ready to deploy!** 🚀

Questions? Check the Troubleshooting section above or review the Vercel/Next.js documentation.

For issues specific to this codebase, check the GitHub repository issues or create a new issue.
