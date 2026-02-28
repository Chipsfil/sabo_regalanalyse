# OTA Update Testing Guide

This guide provides step-by-step instructions for testing Over-The-Air (OTA) updates with this Electron application.

## Prerequisites

- GitHub account
- macOS, Windows, or Linux computer
- Node.js v14+ installed
- A new GitHub repository (public)

## Initial Setup

### 1. Clone and Prepare the Project

```bash
# Clone this project or copy it to your machine
cd electron-ota-test

# Install dependencies
npm install
```

### 2. Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `electron-ota-test`
3. Make it **Public** (required for electron-updater to access releases)
4. Copy the repository URL (e.g., `https://github.com/yourusername/electron-ota-test.git`)

### 3. Configure Your Repository

1. Edit `package.json` and update:
   ```json
   "homepage": "https://github.com/Chipsfil/test_update_OTA.git",
   "build": {
     "publish": {
       "owner": "yourusername",
       "repo": "electron-ota-test"
     }
   }
   ```

2. Push the project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/electron-ota-test.git
   git push -u origin main
   ```

### 4. Create GitHub Personal Access Token

For automated releases, you'll need a personal access token:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select scope: `public_repo`
4. Copy the token
5. Set environment variable:
   ```bash
   export GH_TOKEN=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
   ```

## Testing OTA Updates

### Phase 1: Build and Release Version 1.0.0

**Step 1: Create First Release**

```bash
# Ensure version is 1.0.0 in package.json
# npm run publish will:
# 1. Build the application
# 2. Create a GitHub release
# 3. Upload build artifacts

npm run publish
```

**Step 2: Publish the Release on GitHub**

1. Go to your repository on GitHub
2. Click on "Releases" (or Packages)
3. Find the draft release for v1.0.0
4. Click "Publish release"

**Step 3: Install the Application**

1. Go to the release page
2. Download the installer for your platform:
   - macOS: `.dmg` file
   - Windows: `.exe` installer
   - Linux: `.AppImage` file
3. Install the application on your desktop

**Step 4: Verify Installation**

1. Launch the installed application
2. Check that the version shows `1.0.0`
3. The app should check for updates on startup

### Phase 2: Create Version 1.1.0 with Updates

**Step 1: Make Visible Changes**

Make changes to the UI so you can see the update worked:

Edit `index.html` and change the title:
```html
<h2>Welcome to Electron OTA Update Test (v1.1.0 with new features!)</h2>
```

Or edit `style.css` to change the gradient color:
```css
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); /* Changed colors */
```

**Step 2: Update Version Number**

In `package.json`, change:
```json
"version": "1.1.0"
```

**Step 3: Commit and Push Changes**

```bash
git add .
git commit -m "Version 1.1.0 - UI improvements"
git push
```

**Step 4: Build and Publish Version 1.1.0**

```bash
npm run publish
```

**Step 5: Publish Release on GitHub**

1. Go to your repository releases
2. Find the draft for v1.1.0
3. Click "Publish release"

### Phase 3: Test the Update

**Step 1: Run Installed Application**

1. Launch the application you installed (v1.0.0)
2. The app should automatically check for updates
3. You should see a notification that an update is available

**Alternative: Manual Update Check**

If the app doesn't automatically detect:
1. Go to Settings tab
2. Click "Check for Updates"

**Step 2: Download Update**

Wait for the download to complete. You'll see:
- "Update available and downloading..."
- Then "Update downloaded!"

**Step 3: Install Update**

1. You'll see a message about the update being downloaded
2. Click "Install Update Now" button
3. The application will quit and reinstall
4. The app should restart with version 1.1.0

**Step 4: Verify Update**

Check that:
- Version now shows 1.1.0
- Your UI changes are visible
- Application works normally

## What's Happening Behind the Scenes

### File Structure in Release

When you run `npm run publish`, GitHub release contains:
```
v1.0.0/
├── electron-ota-test-1.0.0.dmg    (macOS)
├── electron-ota-test-1.0.0.exe    (Windows)
├── electron-ota-test-1.0.0.AppImage (Linux)
├── latest-mac.yml                  (macOS update metadata)
├── latest.yml                       (Generic metadata)
└── [other platform files]
```

### Update Flow

1. **Check**: App calls `autoUpdater.checkForUpdatesAndNotify()`
2. **Compare**: Latest version in GitHub release compared to current version
3. **Download**: If newer version exists, app downloads it in background
4. **Notify**: User gets notification that update is ready
5. **Install**: User clicks install, app quits and runs installer
6. **Launch**: New version starts automatically

### Update Metadata Files

The `.yml` and `.json` files are crucial:
- Contain version information
- List file hashes for security verification
- Specify download URLs
- electron-updater reads these to find available updates

## Troubleshooting

### Issue: Update Not Detected

**Check Repository URL:**
```json
// package.json
"homepage": "https://github.com/yourusername/electron-ota-test",
"publish": {
  "owner": "yourusername",
  "repo": "electron-ota-test"
}
```

**Verify Release is Published:**
- Go to GitHub releases page
- Make sure release shows "Published" not "Draft"
- Check that all files are uploaded

**Check Version Number:**
- Installed version: Check in Settings tab
- New version: Must be higher than current
- Verify it's updated in package.json

### Issue: "Update error: Cannot find latest.yml"

**Solution:**
1. The release files may not be properly generated
2. Run `npm run build` to check build output
3. Check that release contains `.yml` files
4. Manually re-publish the release

### Issue: Download Fails

**Solutions:**
- Check internet connection
- Verify GitHub repository is public
- Check firewall/antivirus isn't blocking downloads
- Open DevTools (Cmd+Option+I) to see error details

### Issue: Installation Never Completes

**Solutions:**
- Check that app has write permissions to installation directory
- Try closing other instances of the app
- Check disk space is available
- On macOS, check if quarantine attributes are blocking installation:
  ```bash
  xattr -d com.apple.quarantine /Applications/Electron\ OTA\ Test.app
  ```

### View Debug Information

To see detailed logs:

1. Open DevTools when app is running:
   - Press `Cmd+Option+I` (macOS)
   - Press `Ctrl+Shift+I` (Windows/Linux)

2. Look at Console tab for messages from electron-updater

3. On macOS, view system logs:
   ```bash
   log show --predicate 'process == "Electron OTA Test"' --last 1h
   ```

## Advanced Testing Scenarios

### Test Skipping an Update

1. Release v1.1.0
2. Release v1.2.0 (skip v1.1.0)
3. Install v1.0.0
4. App should detect v1.2.0 as the newest

### Test Downgrade Prevention

1. The app only updates if new version > current version
2. Release v1.0.0, then v0.9.0
3. Running v1.0.0, it will NOT "update" to v0.9.0

### Test Multiple Platforms

1. Build and publish for macOS, Windows, and Linux
2. Each gets platform-specific updates
3. Windows installer updates Windows version, etc.

## Testing Checklist

- [ ] GitHub repository is created and public
- [ ] package.json has correct GitHub owner and repo
- [ ] Personal access token is set as GITHUB_TOKEN
- [ ] First version (1.0.0) is released and published
- [ ] Application installs successfully
- [ ] Version shows correctly in installed app
- [ ] Second version (1.1.0) is released and published
- [ ] Running v1.0.0 detects v1.1.0
- [ ] Update downloads in background
- [ ] Installation completes and app restarts
- [ ] New version shows in installed/running app
- [ ] UI changes from v1.1.0 are visible

## Success Indicators

✅ OTA Update is working when:
1. Installed v1.0.0 automatically detects available v1.1.0
2. Update downloads without user intervention
3. Installation completes successfully
4. Application restarts with new version
5. No reinstallation of the app was required

## Next Steps

Once OTA updates are working:
1. Automate releases in CI/CD pipeline (GitHub Actions)
2. Add release notes to GitHub releases
3. Implement update rollback for critical bugs
4. Add staged rollouts (update % of users gradually)
5. Implement update analytics to track adoption

## Resources

- [electron-updater Documentation](https://www.electron.build/auto-update)
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases)
- [GitHub CLI for Release Management](https://cli.github.com/)
