# 🌿 Plantify PWA — Deployment Guide

## Files in this folder

```
plantify-pwa/
├── index.html        ← The entire app (one file!)
├── manifest.json     ← Makes it installable as an app
├── sw.js             ← Service worker (offline support)
├── icons/
│   ├── icon-192.png  ← App icon (home screen)
│   └── icon-512.png  ← App icon (splash screen)
└── README.md         ← This file
```

---

## Step 1 — Get Your Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up for a free account
3. Click **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

You enter this key directly inside the Plantify app the first time you open it.
It is stored only on your device — never sent anywhere except to Anthropic.

---

## Step 2 — Deploy for Free (Choose One)

### Option A: Vercel ⭐ Easiest

1. Go to https://vercel.com and sign up (free)
2. Click **Add New → Project**
3. Drag and drop the `plantify-pwa` folder onto the page
4. Click **Deploy**
5. In ~30 seconds you get a URL like `plantify.vercel.app` 🎉

### Option B: Netlify

1. Go to https://netlify.com and sign up (free)
2. Go to **Sites** → drag and drop the `plantify-pwa` folder
3. Done — you get a URL like `plantify.netlify.app`

### Option C: GitHub Pages (also free)

1. Create a free account at https://github.com
2. Create a new repository called `plantify`
3. Upload all files from `plantify-pwa/` into the repo
4. Go to repo **Settings → Pages → Source: main branch**
5. Your app is at `yourusername.github.io/plantify`

---

## Step 3 — Install on Your Phone

### iPhone / iPad (Safari):
1. Open your Plantify URL in **Safari**
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **"Add"**
5. Plantify appears on your home screen like a real app! ✅

### Android (Chrome):
1. Open your Plantify URL in **Chrome**
2. Tap the **three dots menu** (⋮)
3. Tap **"Add to Home screen"** or **"Install app"**
4. Tap **"Install"**
5. Plantify icon appears on your home screen! ✅

---

## Step 4 — Share with Others

Once deployed, just share your URL! Anyone can:
- Open it in their phone browser
- Use it immediately without installing anything
- Optionally install it to their home screen

---

## Custom Domain (Optional — also free)

If you want `plantify.com` or similar:
- Buy a domain at Namecheap (~$10/year)
- In Vercel/Netlify, go to **Domains** → add your domain
- Follow their DNS setup instructions (5 minutes)

---

## That's it! 🎉

Total cost: **$0** to launch publicly
Time to deploy: **~5 minutes**
