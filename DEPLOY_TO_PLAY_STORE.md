# 🚀 Deploying YCI Staff App to Google Play Store

Follow these steps to build and publish the YCI Staff Application for Android.

## 1. Prerequisites
- **Google Play Console Account** ($25 one-time fee).
- **Android Studio** installed on your machine.
- **Java JDK** (usually bundled with Android Studio).

## 2. Prepare the Code (I have done this)
Run these commands to ensure the latest code is ready for mobile:
```bash
cd frontend-staff
npm run build
npx cap sync android
```

## 3. Configure Signing (First Time Only)
To publish to the Play Store, you need a **Keystore** file.

1. Open **Android Studio**.
2. Open the project at `frontend-staff/android`.
3. Go to **Build > Generate Signed Bundle / APK**.
4. Select **Android App Bundle** (AAB).
5. Click **Next**.
6. Under "Key store path", click **Create new...**.
   - **Path**: Save it as `yci-release.jks` in a safe place.
   - **Password**: Set a strong password (remember it!).
   - **Key Alias**: `key0` (default) or `yci`.
   - **Key Password**: Same as above.
   - Fill in Certificate details (Organization: Your Choice Ice).
7. Click **OK**, then **Next**.
8. Select **release** variant and click **Finish**.

## 4. Build the Release Bundle
Once you have the keystore setup:

1. In Android Studio, go to **Build > Generate Signed Bundle / APK**.
2. Select **Android App Bundle**.
3. Select your `.jks` file and enter passwords.
4. Select **release**.
5. The `.aab` file will be generated in `android/app/release/`.

## 5. Upload to Google Play Console
1. Go to [Google Play Console](https://play.google.com/console).
2. Click **Create App**.
   - **App Name**: `YCI Staff`
   - **Language**: English
   - **App or Game**: App
   - **Free or Paid**: Free
3. Accept declarations and create.
4. Go to **Testing > Internal testing** (for immediate device testing) or **Production** (for public).
5. Click **Create new release**.
6. Upload the `.aab` file you generated.
7. Fill in store details:
   - **Short Description**: "Driver logistics and delivery management for YCI."
   - **Full Description**: "Official staff application for Your Choice Ice platform. Manage deliveries, routes, and inventory."
   - **Screenshots**: Take screenshots of the app running on your phone/emulator.
   - **Icon**: 512x512 PNG logo.
8. Submit for Review!

## ⚠️ Important Note on API URL
The app expects to connect to the production API.
Ensure `capacitor.config.ts` allows cleartext traffic if using HTTP (localhost), but for Production request, it should hit `https://arctic-ice-api.fly.dev` or `https://staff.yourchoiceice.com`.

I have configured the frontend to use the correct API environment variable.
