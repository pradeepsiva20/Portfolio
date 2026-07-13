# Pradeep S — Portfolio Website

A full-stack personal portfolio: a static frontend (HTML/CSS/JS) styled as a
data-analyst "dashboard console", plus a small Node/Express backend that
handles the contact form.

```
portfolio/
├── client/              ← the website (frontend)
│   ├── index.html
│   ├── css/style.css
│   ├── js/main.js
│   └── assets/Pradeep_S_Resume.pdf
└── server/               ← the contact-form API (backend)
    ├── server.js
    ├── package.json
    ├── .env.example
    └── data/messages.json   ← submitted messages get stored here
```

## 1. Run it locally

**Frontend** — no build step needed. Just open `client/index.html` in a
browser, or serve it properly (recommended, so `fetch()` calls work
cleanly):

```bash
cd client
npx serve .
# or: python3 -m http.server 5500
```

**Backend**:

```bash
cd server
npm install
cp .env.example .env      # optional: fill in Gmail creds if you want email alerts
npm start
```

The API runs at `http://localhost:4000`. The frontend already points at
`http://localhost:4000` automatically when you open it on `localhost`.

Submit the contact form once everything is running — you should see a new
entry appear in `server/data/messages.json`.

## 2. Make it yours

- Replace `client/assets/Pradeep_S_Resume.pdf` with your latest resume (keep the filename, or update the `href` in `index.html`'s nav).
- Update project links: right now the project cards don't link out anywhere — add your live demo / GitHub repo links inside `.project-card` in `index.html` once those projects are hosted.
- Swap the KPI numbers in the hero panel (`data-count` attributes) for real numbers once you have them, or leave them as illustrative.

## 3. Deploy it for free

**Frontend → Vercel**
1. Push this whole folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Set the **Root Directory** to `client`.
4. Framework preset: "Other" (it's static, no build command needed).
5. Deploy. You'll get a URL like `pradeep-portfolio.vercel.app`.

**Backend → Render**
1. Go to render.com → New → Web Service → connect the same repo.
2. Set **Root Directory** to `server`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add the environment variables from `.env.example` under "Environment" (SMTP_USER, SMTP_PASS, NOTIFY_EMAIL, ADMIN_KEY) if you want email notifications.
5. Deploy. You'll get a URL like `pradeep-portfolio-api.onrender.com`.

**Connect them**
- In `client/js/main.js`, set `API_BASE` (the `else` branch) to your Render URL, e.g.:
  ```js
  : "https://pradeep-portfolio-api.onrender.com"
  ```
- Redeploy the frontend (Vercel auto-redeploys on every git push).

That's it — a live site with a working contact form, backed by a real API,
that you can put straight on your resume and LinkedIn.

## Notes for interviews

If someone asks about the stack: vanilla HTML/CSS/JS frontend (no
framework, so it loads instantly and is easy to walk through line by line),
Express backend with basic input validation and rate limiting, messages
persisted to disk, optional email relay via Nodemailer + Gmail app
passwords. Small, deliberately simple, and everything in it is something
you can explain.
