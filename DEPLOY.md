# Vercel Deployment Guide

Follow these steps to deploy the Lead Verification Tool to Vercel.

## 1. Quick Start (Demo Mode)

This app is designed to work out-of-the-box without any environment variables. It will automatically enter **Demo Mode** using mock data.

1. Push this code to a GitHub repository.
2. Go to [Vercel](https://vercel.com).
3. Click **Add New → Project**.
4. Import your repository.
5. **Skip environment variables** (leave them blank).
6. Click **Deploy**.

## 2. Production Setup (Real Integrations)

To enable real scraping and email delivery, you'll need to configure the following environment variables in your Vercel project settings:

### Email (SendGrid)
- `SENDGRID_API_KEY`: Your SendGrid API key.
- `SENDGRID_FROM_EMAIL`: The verified sender email address in your SendGrid account.

### Database (Supabase) - Optional
*Note: The app currently uses in-memory session storage, which is lost on serverless function restarts. For persistence, you can integrate Supabase.*
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Branding
- `NEXT_PUBLIC_TAGGLE_URL`: Your main company website (default: `https://taggle.ai`).

## 3. Custom Domain Setup
1. In Vercel, go to **Settings → Domains**.
2. Add your custom domain.
3. Follow the DNS instructions provided by Vercel.

## 4. Monitoring & Logs
- View real-time logs in the **Logs** tab of your Vercel deployment.
- Check for "🎯 DEMO MODE" in the logs to confirm the app is running with mock data.

## 5. Troubleshooting
- **Scraping blocked?** Public scraping is best-effort. If you experience frequent blocks, consider using a proxy service or a dedicated scraping API.
- **Email not sending?** Ensure your SendGrid API key is correct and the `SENDGRID_FROM_EMAIL` is verified.
