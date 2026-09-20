# Image-to-Video Motion Prompt Generator

A GitHub Pages + GitHub Codespaces-ready browser demo for an image-to-video motion prompt workflow.

## Features

✅ Upload Image  
✅ Upload Audio (1 minute)  
✅ Optional Mask Upload  
✅ Motion Prompt Input  
✅ Resolution selection (720p, 1080p, 4K)  
✅ MP4 preview render  
✅ Download generated MP4  

## Workflow

Upload Image
↓
Upload Audio (1 minute)
↓
Upload Mask (Optional)
↓
Enter Motion Prompt
↓
Select Resolution: 1080p
↓
Generate Video
↓
Screen Preview MP4
↓
Download MP4

## Run locally

From the project root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Run in GitHub Codespaces

1. Open the repository in GitHub.
2. Use Code → Codespaces → Create codespace.
3. Once the environment is ready, open the VS Code port preview for `8000` or run:

```bash
python3 -m http.server 8000
```

## Deploy to GitHub Pages

This repository includes a ready-to-use Pages workflow in [.github/workflows/pages.yml](.github/workflows/pages.yml).

1. Push the project to GitHub.
2. In the repository settings, enable GitHub Pages.
3. Choose the GitHub Actions deployment method.
4. The workflow will publish the static site automatically on pushes to `main`.

## Files

- [index.html](index.html) – app structure and UI
- [styles.css](styles.css) – app styling and layout
- [app.js](app.js) – upload handling and mock video generation logic
- [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json) – Codespaces setup
- [.github/workflows/pages.yml](.github/workflows/pages.yml) – GitHub Pages deployment
