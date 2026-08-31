# 📈 Trading Journal Dashboard

A modern, responsive Trading Journal built with **Next.js 16**, **React 19**, and **Tailwind CSS**. It leverages **Supabase** for secure authentication and real-time cloud database synchronization.

## ✨ Features
- **User Authentication**: Secure Sign Up and Log In using Supabase Auth.
- **Cloud Sync**: All your trades and account settings are saved securely to a Supabase PostgreSQL database.
- **Advanced Metrics**: Automatically calculates Win Rate, Total P/L, Average Win/Loss, and more.
- **Interactive UI**: Includes charts for account growth, a trading calendar, and Dark/Light themes.
- **Bilingual**: Supports English and Thai languages.
- **Trade Images**: Attach chart screenshots directly to your trade logs.

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) 18.17 or later
- A [Supabase](https://supabase.com/) account and project

### 2. Database Setup (Supabase)
Go to your Supabase project's **SQL Editor** and run the following queries to create the necessary tables and secure them:

```sql
-- Create trades table
create table public.trades (
    id text primary key,
    user_id uuid references auth.users not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null,
    pair text not null,
    direction text not null,
    result text not null,
    pl numeric not null,
    notes text,
    trade_type text default 'TRADE',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at bigint not null,
    image_url text
);

-- Create user settings table
create table public.user_settings (
    user_id uuid references auth.users primary key,
    capital numeric not null default 0,
    target_profit numeric not null default 0,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Secure tables with Row Level Security (RLS)
alter table public.trades enable row level security;
alter table public.user_settings enable row level security;

-- Policies for trades
create policy "Users can view own trades" on trades for select using (auth.uid() = user_id);
create policy "Users can insert own trades" on trades for insert with check (auth.uid() = user_id);
create policy "Users can update own trades" on trades for update using (auth.uid() = user_id);
create policy "Users can delete own trades" on trades for delete using (auth.uid() = user_id);

-- Policies for user_settings
create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);
```

*Note: For the image upload feature, you must also create a **Public Storage Bucket** named `charts` in Supabase.*

### 3. Environment Variables
Create a `.env.local` file in the root directory of your project and add your Supabase API credentials (found in Project Settings -> API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Installation
Install the project dependencies:
```bash
npm install
```

### 5. Run the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## ☁️ Deployment
The easiest way to deploy this app is using [Vercel](https://vercel.com).

**Important:** Make sure to add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Vercel project's **Environment Variables** before deploying, otherwise the build will fail!
