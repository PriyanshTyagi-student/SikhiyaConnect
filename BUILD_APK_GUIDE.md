# 📱 Building Android APK - Global Distribution Guide

## Quick Build (Development APK)

### Step 1: Build the APK
```bash
cd c:\Users\tpriy\Desktop\project\SikhiyaConnect
npm run android:release
```

**Output location:**
```
android\app\build\outputs\apk\release\app-release-unsigned.apk
```

### Step 2: Install on Any Android Device

**Method A: Direct Transfer**
1. Copy `app-release-unsigned.apk` to your phone
2. Enable "Install from Unknown Sources" in phone settings
3. Tap the APK file to install
4. Share the APK file with anyone to install globally

**Method B: ADB Install**
```bash
adb install android\app\build\outputs\apk\release\app-release-unsigned.apk
```

---

## Production Build (Signed APK for Play Store)

### Step 1: Generate a Signing Key

```bash
cd android\app
keytool -genkey -v -keystore sikhiya-release-key.keystore -alias sikhiya -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** Save your password securely!

### Step 2: Configure Signing

Create `android\keystore.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=sikhiya
storeFile=sikhiya-release-key.keystore
```

### Step 3: Update build.gradle

Add to `android/app/build.gradle` before `android {`:

```groovy
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside `android { }`, update `buildTypes`:

```groovy
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        shrinkResources false
    }
}
```

### Step 4: Build Signed APK

```bash
npm run android:release
```

**Output:**
```
android\app\build\outputs\apk\release\app-release.apk
```

---

## Distribution Options

### Option 1: Google Play Store (Recommended)
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Upload your signed APK
4. Complete store listing
5. Publish globally

### Option 2: Direct Distribution
- Share the APK file via:
  - Google Drive / Dropbox
  - WhatsApp / Telegram
  - Your website
  - Email

### Option 3: Alternative App Stores
- **Amazon App Store**
- **Samsung Galaxy Store**
- **APKPure**
- **F-Droid** (for open-source)

---

## Update Backend API URL

### For Production Backend

1. Edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

2. Rebuild:
```bash
npm run android:release
```

### For Dynamic Backend (Current Setup)
The app auto-detects the backend using your IP discovery service.

---

## Troubleshooting

### "Installation Blocked"
- Enable "Install from Unknown Sources"
- Settings > Security > Unknown Sources

### "App Not Installed"
- Check if an older version is installed
- Uninstall old version first
- Clear data before reinstalling

### Build Errors
```bash
cd android
.\gradlew clean
cd ..
npm run android:release
```

---

## Version Updates

Update version in `android/app/build.gradle`:
```groovy
versionCode 2        // Increment for each release
versionName "1.1.0"  // User-visible version
```

---

## Current APK Info

- **Package Name:** `com.sikhiyaconnect.edu`
- **App Name:** Sikhiya Connect
- **Version:** 1.0.0
- **Min Android:** API 22 (Android 5.0)
- **Target Android:** API 34 (Android 14)

---

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `npm run android:build` | Build and open in Android Studio |
| `npm run android:release` | Build release APK |
| `npx cap sync android` | Sync web assets to Android |
| `npx cap open android` | Open in Android Studio |

