# MET Tour Business System

A full-stack premium guided art experience platform for the Metropolitan Museum of Art European Art History Tour — including booking, payment, surveys, CRM, referrals, and analytics.

## Overview

```
Landing Page → Book (Stripe) → Pre-Survey → [TOUR DAY] → Post-Survey
                                    ↓                           ↓
                             Guide Dashboard              CRM + Analytics
```

## Features

| Module | Description |
|--------|-------------|
| **Landing Page** | Premium marketing page with tour route, testimonials, and pricing |
| **Booking** | Stripe checkout with full payment ($75) or deposit ($20) |
| **Pre-Tour Survey** | 5-step intake form, generates guest profile tag |
| **Post-Tour Survey** | 5-step feedback form with ratings, NPS, and testimonial |
| **Guide Dashboard** | Admin view of upcoming bookings + guest preferences |
| **CRM** | Guest profiles with interest tags and segmentation |
| **Analytics** | Avg ratings, NPS gauge, price perception, interest breakdown |
| **Referral System** | Auto-generates unique referral link after post-tour survey |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Payments | Stripe (with mock fallback) |
| Storage | Local JSON files (`/data`) |
| Fonts | Playfair Display · EB Garamond |

## Quick Start

### 1. Install dependencies

```bash
cd met-tour-business-system
npm install
```

### 2. Configure environment (optional)

```bash
cp .env.local.example .env.local
# Add your Stripe keys
```

> Without Stripe keys the app works in **mock mode** — payments are simulated and bookings are saved directly.

### 3. Start the dev server

```bash
npm run dev
```

Opens at **http://localhost:3000**

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/book` | Booking form + Stripe checkout |
| `/book/success` | Post-payment confirmation |
| `/survey/pre` | Pre-tour survey (5 steps) |
| `/survey/post` | Post-tour survey (5 steps) |
| `/admin` | Admin overview |
| `/admin/bookings` | All bookings |
| `/admin/crm` | Guest CRM |
| `/admin/analytics` | Charts and metrics |

## Stripe Setup

1. Create an account at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy test keys to `.env.local`:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Data Storage

All data is persisted as JSON in `data/`:

```
data/
  bookings.json
  pre-surveys.json
  post-surveys.json
  referrals.json
```

Created automatically on first use.

## Guest Profile Tags

The system auto-assigns a profile tag based on pre-tour survey responses:

| Tag | Description |
|-----|-------------|
| `academic` | Professional background or academic depth preference |
| `storytelling` | Prefers narrative-rich experience |
| `photo-type` | Casual, photo-friendly preference |
| `beginner` | First-time art history visitor |
| `curious-learner` | General interest, moderate knowledge |

## Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

Set environment variables in the Vercel dashboard. Note: local JSON storage is ephemeral on Vercel — for production, migrate to a database (Vercel KV, PlanetScale, Supabase).

## Design System

| Token | Value |
|-------|-------|
| Primary Red | `#A6192E` |
| Background | `#F8F5F0` |
| Gold | `#C9A84C` |
| Text | `#1A1A1A` |
| Muted | `#8B7D72` |
| Border | `#E0D5C8` |
| Heading Font | Playfair Display (serif) |
| Body Font | EB Garamond (serif) |
