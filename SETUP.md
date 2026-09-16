# Setting up Tada — the step-by-step guide

This takes about an hour the first time. You'll create a few free accounts, paste some keys, and click Deploy. No coding. If a menu name below has moved (they do), look for the nearest thing with the same meaning.

## What you'll end up with

- Your own website (something like `tada-romana.vercel.app`) where people sign in by email, build scrapbooks, chat to change them, verify licences against the web, paint their vision board, share a read-only link, and download a file.
- Everything saved in your own database. You own the data.

## The five accounts

| Account | What it's for | Cost |
|---|---|---|
| **GitHub** (github.com) | Holds the code. Vercel deploys from here. | Free |
| **Vercel** (vercel.com) | Runs the website. | Free "Hobby" plan to start |
| **Supabase** (supabase.com) | Sign-in, the database, and picture storage. | Free tier to start |
| **Anthropic Console** (console.anthropic.com) | The Claude key that writes, researches and verifies. | Pay as you go; add $10 to start |
| **OpenAI** (platform.openai.com) — optional | The key that paints the vision-board pictures. Skip it and the app shows its vector scenes instead. | Pay as you go; add $5 to start |

Sign up for all five with the same email so you can find them later.

## Step 1 — Put the code on GitHub

1. Unzip `tada-web.zip` on your computer. You'll see a folder called `tada-web`.
2. The easiest way is the **GitHub Desktop** app (desktop.github.com): install it, sign in, choose **Add local repository** (or drag the `tada-web` folder onto the window), then click **Publish repository**. Keep it **private**.
3. No Desktop app? On github.com click **New repository**, name it `tada-web`, make it private, create it, then use **Add file → Upload files** and drag everything *inside* the `tada-web` folder onto the page. Commit.

You never need to touch the code again unless you want to.

## Step 2 — Create the Supabase project

1. In Supabase click **New project**. Name it `tada`, choose the region closest to your users, set a database password (save it somewhere; you won't need it day to day).
2. When it finishes, open **SQL Editor** in the left menu, click **New query**, and paste the entire contents of the file `supabase/schema.sql` (open it in any text editor, select all, copy). Click **Run**. You should see "Success". This creates the tables, the privacy rules, and the picture storage.
3. Open **Authentication → Providers** (sometimes "Sign In / Providers"). Make sure **Email** is enabled. Leave the defaults.
4. Open **Project Settings → API** (or **API Keys**). Copy two things into a notes file:
   - the **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - the **Publishable key** (starts with `sb_publishable_`) — on older projects this is called the **anon** key; either works
   - the **Secret key** (starts with `sb_secret_`; older name: **service_role**). Treat this one like a password.

## Step 3 — Get your Claude key

1. In the Anthropic Console open **API Keys**, click **Create Key**, name it `tada`, and copy it (it starts with `sk-ant-`). You can only see it once.
2. Open **Billing** and add credit. $10 is plenty to test with a handful of people.

## Step 4 — (Optional) Get your image key

1. In the OpenAI platform open **API keys**, create one named `tada`, copy it (starts with `sk-`).
2. Add a little credit under **Billing**. If you skip this step entirely, leave `OPENAI_API_KEY` blank in the next step and the app will simply not offer "Paint my vision board".

## Step 5 — Deploy on Vercel

1. In Vercel click **Add New → Project**, connect GitHub if asked, and pick the `tada-web` repository. Click **Import**.
2. Before clicking Deploy, open the **Environment Variables** section and add these, one by one (name on the left, value on the right). Use the values you saved:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your publishable (or anon) key |
   | `SUPABASE_SECRET_KEY` | your secret (or service_role) key |
   | `ANTHROPIC_API_KEY` | your Claude key |
   | `OPENAI_API_KEY` | your OpenAI key, or leave it out |
   | `NEXT_PUBLIC_APP_URL` | leave blank for now |

   The other settings in `.env.example` have sensible defaults; add them only if you want to change the models or the daily limits.
3. Click **Deploy**. Two or three minutes later you'll get a URL like `https://tada-web-xxxx.vercel.app`. Open it — you should see the Tada landing page.

## Step 6 — Tell Supabase where the site lives

Sign-in emails need to know your address.

1. Back in Supabase, open **Authentication → URL Configuration**.
2. Set **Site URL** to your Vercel URL (e.g. `https://tada-web-xxxx.vercel.app`).
3. Under **Redirect URLs** add `https://tada-web-xxxx.vercel.app/auth/confirm` (and, if you ever run it on your computer, `http://localhost:3000/auth/confirm`). Save.
4. In Vercel, open your project → **Settings → Environment Variables**, set `NEXT_PUBLIC_APP_URL` to the same URL, then go to **Deployments** and **Redeploy** the latest one so it picks up the change.

## Step 7 — Try it

1. Open your site, type your email, click **Email me a sign-in link**, open the email and click the link. You'll land on **My scrapbooks**.
2. **New idea** → describe a business → answer the questions → wait a minute or two for the build.
3. Try the things that need the keys: **Talk to Tada** (change your mind), the **Money** tile's workbook, **Check every item live** inside Legal & licences (uses web search), **Paint my vision board** on the vision board tab (uses the image key), **Share** (copies a read-only link), **Save as file**.

If a step fails, the message on screen says why — usually a key pasted with a stray space, or Supabase's URL settings from Step 6.

## What it costs to run

Rough numbers, per scrapbook, at today's prices: building ≈ 15–25¢ (Claude), each chat message a fraction of a cent, a live licence check ≈ 15–30¢ (searches plus reading), painting the vision board ≈ 5–20¢ depending on the image model. Vercel and Supabase are free at this scale. The app caps each person at 40 build calls, 10 live checks and one set of pictures per scrapbook per day, so a curious tester can't run up a bill; change the caps in Vercel's environment variables if you want.

## Things worth knowing

- **Sign-in emails are rate-limited** on Supabase's built-in mailer (a few per hour). Fine for testing; before you invite lots of people, add a custom SMTP provider under **Authentication → SMTP Settings** (Resend, Postmark, etc. have free tiers).
- **Your own domain**: in Vercel, **Settings → Domains** lets you attach e.g. `tada.yourdomain.com`. Then update Step 6 with the new address.
- **Changing the AI's instructions**: every prompt lives in `src/lib/prompts.ts`. Edit the file on GitHub (the pencil icon), commit, and Vercel redeploys automatically.
- **Swapping models**: `CLAUDE_MODEL_SMART`, `CLAUDE_MODEL_QUICK` and `IMAGE_MODEL` in Vercel's environment variables. Redeploy after changing.
- **Deleting a person's data**: Supabase → **Authentication → Users** → delete the user; their scrapbooks go with them.

## When something's wrong

| You see | Try |
|---|---|
| "This page needs permission…" or a blank build | The `ANTHROPIC_API_KEY` is missing or wrong in Vercel. Check for spaces. Redeploy. |
| Sign-in link says it expired | Ask for a new one; check Step 6's URLs; check Supabase's email rate limit. |
| "Pictures are switched off" | No `OPENAI_API_KEY`. Add one or ignore. |
| Build stops after ~60 seconds with a timeout | On Vercel, open **Settings → Functions** and make sure the maximum duration allows 300 s (Fluid compute). Or upgrade the plan. |
| "You've reached today's limit" | The safety caps. Raise `DAILY_BUILD_LIMIT` / `DAILY_VERIFY_LIMIT` in Vercel if you meant to. |
| Pictures don't show on the vision board | In Supabase → **Storage**, confirm a bucket called `tada-images` exists and is **public** (Step 2 creates it; re-run the SQL if not). |

You're done. Every scrapbook your users build from here on is saved in your Supabase project, and every improvement I make lands as a new zip you upload the same way.
