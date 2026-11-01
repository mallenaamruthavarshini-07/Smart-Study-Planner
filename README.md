# StudyMate

StudyMate is a study planner with task and exam tracking, progress analytics, and an installable Progressive Web App (PWA). The Express server provides the API and serves the built React app, so devices use the same hosted app and account data.

## Run locally

**Requirements:** Node.js 20.19 or newer and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. To create and run a production build locally:

```bash
npm run build
npm start
```

The app stores its local JSON database in `data/studymate_db.json`. Set `DATA_DIR` to use another directory. Local database files are intentionally excluded from Git.

## Publish and deploy

GitHub stores the source code; it does not run this app by itself. Deploy the repository to a Node.js host that supports a persistent disk, then:

1. Set the build command to `npm ci && npm run build`.
2. Set the start command to `npm start`.
3. Set `NODE_ENV` to `production`.
4. Attach a persistent disk and set `DATA_DIR` to its mount path (for example, `/var/data`).
5. Use the HTTPS URL provided by the host. HTTPS is required for installing the PWA and using service workers.

The app listens on the host-provided `PORT`. Without a persistent disk, saved accounts and study data may be lost when the service restarts or is redeployed. The included JSON database is suitable for a small deployment; use a managed database for production-scale or multi-instance hosting.

To push this project to GitHub, create an empty repository on GitHub, then run these commands from this project directory, replacing the URL with your repository's URL:

```bash
git init
git add .
git commit -m "Prepare StudyMate for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Do not force-add `.env` files or local database files. Configure secrets and persistent storage through your hosting provider instead.
