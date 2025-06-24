# InspirHub

A community-powered platform to discover, remix, and share creative project ideas. Built with Next.js, Tailwind CSS, and Supabase.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your environment variables in a `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

- Edit `src/app/page.tsx` to customize the homepage.
- Projects are managed in your Supabase database under the `projects` table.
