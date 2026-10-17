# Offline Sheets

A minimal offline spreadsheet starter packaged for Android with Capacitor.

## What is included

- Editable grid
- Local device persistence with `localStorage`
- Add rows and columns
- CSV import and export
- GitHub Actions workflow that builds a debug APK artifact

This is a starter app, not a complete Microsoft Excel replacement. It does not yet implement formulas, XLSX import/export, formatting, multiple sheets, charts, or a full spreadsheet calculation engine.

## Build in GitHub Actions

1. Commit the repository contents to your default branch.
2. Open the **Actions** tab.
3. Select **Build Offline Sheets APK** and click **Run workflow**.
4. Download the `offline-sheets-debug-apk` artifact from the completed run.
5. Extract the ZIP and install `app-debug.apk` on an Android device.

## Local development requirements

- Node.js 20
- Java 17
- Android SDK
- Compatible Android build tools

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

If an `android/` project already exists, do not run `npx cap add android` again. Use `npx cap sync android` instead.

## Existing repository migration

Back up your existing code before copying files. If you already have a spreadsheet UI in `www/`, keep that UI and copy only the configuration/workflow files you need. Keep your existing app ID and align all Capacitor packages to the same major version.
