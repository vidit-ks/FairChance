# FairChance Lottery Platform

FairChance is a modern, premium web application that combines the thrill of a monthly lottery draw with the impact of charitable giving. Users can subscribe, enter their lucky numbers, and redirect a percentage of the jackpot to partnered charities when they win.

## Features Built

- **Premium UI/UX:** A bespoke dark charcoal and emerald theme with subtle Framer Motion animations and React Hot Toast notifications.
- **Robust Subscription Logic:** Secure state handling blocking free users from protected routes.
- **Dual-Step Draw Engine:** Admins generate a draw (Step A) and officially publish it, which automatically maps against the global user pool and distributes payouts (Step B).
- **Match 3/4/5 Logic:** The engine dynamically creates results based on matched scoring and handles jackpot rollover when no one hits a perfect 5.
- **Verification Queue:** A winner verification pipeline allowing users to upload proof URLs, and admins to approve or reject them to authorize final payments.
- **Charity Integration:** Users select 'featured' or standard charities to represent during their plays, ensuring direct real-world impact.

## Architecture

**Frontend:** React, Vite, TailwindCSS (v3), Framer Motion, Lucide-React, React Hot Toast.
**Backend:** Node.js, Express.js.
**Database:** Supabase (PostgreSQL).

## Local Development Setup

### 1. Supabase Setup
You need a Supabase project. In your Supabase SQL Editor, run the schema migration found in `supabase_migrations.sql` (if you were provided one) to set up the `subscriptions`, `draws`, `charities`, and `winners` tables correctly.

### 2. Backend Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

### 3. Frontend Environment Variables
Set the API connection in your `client` directory (or rely on the hardcoded Render fallback provided in `api/index.js`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Running the App
Open two terminals.

**Terminal 1 (Backend):**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
npm run dev
```

*(Optional: Add screenshots of your application here demonstrating the Landing Page, Dashboard, and Admin Control Center)*
