# Lead Verification Tool

A professional, production-ready lead verification tool built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. It allows users to verify leads before pitching by analyzing real-time public signals.

## 🚀 Features

- **Real-time Signal Scraping**: Best-effort scraping of social platforms (LinkedIn, X, etc.)
- **Scoring Algorithm**: Comprehensive analysis based on activity, growth, and hiring signals.
- **Mock Data Mode**: Works perfectly without environment variables for demo purposes.
- **Export Options**: Download reports as PDF or DOCX, or email them via SendGrid.
- **Privacy First**: Zero-data storage. Analyses are stored in-memory and deleted after 24 hours or on demand.
- **Responsive UI**: Modern, mobile-first design with dark mode support.
- **No Login Required**: Immediate access for users.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Export**: PDFKit (PDF) & docx (Word)
- **Validation**: Zod
- **Type Safety**: TypeScript

## 🏁 Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment

See [DEPLOY.md](./DEPLOY.md) for a step-by-step guide on deploying to Vercel.

## 🎯 Demo Mode

The app automatically detects if environment variables are missing and enters **Demo Mode**. In this mode:
- Mock analysis data is generated based on user input.
- PDF and DOCX exports use the mock data.
- Email sending shows a simulated success message.

## 🔒 Privacy & Data

- We do not persist any user data to a permanent database by default.
- Analyses are stored in a temporary in-memory store.
- Users can click "Delete Data" to immediately remove their analysis.
- All temporary data is automatically cleared after 24 hours.

## 🤝 Built by Taggle

This tool is part of the Taggle ecosystem for lead generation and automation. Visit [taggle.ai](https://taggle.ai) for more information.
