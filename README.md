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

## Deploy on Render

GitHub stores the source code; it does not run the app. To create a live URL:

1. Open [Render](https://render.com/) and sign in.
2. Choose **New > Blueprint**, then connect the `Smart-Study-Planner` GitHub repository.
3. Review and apply the `render.yaml` configuration. Render will build and start the app.
4. Open the `studymate` web service in Render and use its `onrender.com` URL on your other devices.

The Blueprint uses Render's free service plan. The server listens on Render's `PORT`, and the HTTPS URL supports installing the PWA. **Free services do not provide persistent disks**: account and study data saved in the JSON database can be lost when the service restarts or is redeployed. For persistent data, use a paid Render service with a persistent disk and set `DATA_DIR` to its mount path (for example, `/var/data`).

## Install on a phone or computer

Use the **Install App** button on the sign-in screen or in the app's navigation menu. If the browser does not offer a one-tap install prompt, the button shows the browser-specific steps. The app must be opened from its HTTPS URL; on iPhone and iPad, use Safari's **Share > Add to Home Screen** option.

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
