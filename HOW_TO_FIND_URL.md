# How to Find Your Vercel Deployment URL

## The Problem:
You're using: `https://vercel.com/charlie9286s-projects/streamwise/...`
This is the **dashboard URL** (where you view the deployment), NOT the API URL.

## The Solution:

### Step 1: Go to Your Vercel Project
Visit: https://vercel.com/charlie9286s-projects/streamwise

### Step 2: Find the "Domains" Section
- Click on your project name
- Look for a section called **"Domains"** or **"Deployment URL"**
- You'll see something like:
  - `streamwise.vercel.app`
  - `streamwise-backend.vercel.app`
  - `streamwise-abc123.vercel.app`

### Step 3: Use That URL
The URL should:
- ✅ Start with `https://`
- ✅ End with `.vercel.app`
- ✅ NOT contain `vercel.com/charlie9286s-projects/...`

### Step 4: Test It
```bash
curl https://your-url.vercel.app/health
```

Should return: `{"ok":true}`

### Step 5: Update Config
Update `frontend/src/config.ts` with the correct URL.

## Example:
❌ Wrong: `https://vercel.com/charlie9286s-projects/streamwise/G6NwCeEuLLw31zvdRE6tkGH4FjMY`
✅ Correct: `https://streamwise.vercel.app` (or whatever your actual domain is)
