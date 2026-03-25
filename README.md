# Supabase Test App - Full CRUD

This is a simple Next.js (App Router) application designed to test full CRUD (Create, Read, Update, Delete) operations with Supabase and deployment on Vercel.

## Database Setup

Run the following SQL in your Supabase project's SQL Editor to create the required table and policies:

```sql
create table notes (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Allow public access for this simple test app
alter table notes enable row level security;
create policy "Allow public insert" on notes for insert with check (true);
create policy "Allow public select" on notes for select using (true);
create policy "Allow public update" on notes for update using (true);
create policy "Allow public delete" on notes for delete using (true);
```

## 1. Instructions to install dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

## 2. Instructions to run locally
First, configure your environment variables. Open the `.env.local` file (or create one in the root of the project) and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

Then, start the development server:
```bash
npm run dev
```

## 3. Instructions to push to GitHub
Initialize a git repository, commit the files, and push to your GitHub account:
```bash
git init
git add .
git commit -m "Full CRUD implementation"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

## 4. Instructions to deploy on Vercel
1. Go to Vercel and log in.
2. Click **Add New...** > **Project**.
3. Import the repository you just pushed to GitHub.
4. **Important**: In the Vercel deployment configuration, expand the **Environment Variables** section and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**.
