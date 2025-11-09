# 🔐 Social Login Setup Guide

This guide will help you configure Facebook, Google, and Apple Sign-In for your Doughminant Pizza app.

## ✅ Code Implementation Status

The social login functionality has been **fully implemented** in the codebase:
- ✅ Google Sign-In method added
- ✅ Facebook Sign-In method added
- ✅ Apple Sign-In method added
- ✅ Login page UI updated with clickable buttons
- ✅ Error handling implemented
- ✅ User document creation for new social users
- ✅ Profile image sync from social accounts

## 🔧 Firebase Console Configuration

### Step 1: Enable Social Providers in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable each provider:

#### Google Sign-In
1. Click on **Google** provider
2. Toggle **Enable** to ON
3. Enter your **Project support email**
4. Click **Save**

#### Facebook Sign-In
1. Click on **Facebook** provider
2. Toggle **Enable** to ON
3. You'll need:
   - **App ID** (from Facebook Developer Console)
   - **App Secret** (from Facebook Developer Console)
4. Click **Save**

#### Apple Sign-In
1. Click on **Apple** provider
2. Toggle **Enable** to ON
3. You'll need:
   - **Services ID** (from Apple Developer Console)
   - **Apple Team ID** (from Apple Developer Console)
   - **Key ID** (from Apple Developer Console)
   - **Private Key** (.p8 file from Apple Developer Console)
4. Click **Save**

---

## 📱 Provider-Specific Setup

### 1. Google Sign-In Setup

#### For Web (Current Implementation)
- ✅ **Already configured** - Firebase handles Google Sign-In for web automatically
- No additional setup needed if you've enabled it in Firebase Console

#### For Mobile (Future Enhancement)
If you want to add native Google Sign-In for iOS/Android:
1. Install Capacitor Firebase Auth plugin:
   ```bash
   npm install @capacitor-firebase/authentication
   npx cap sync
   ```
2. Add SHA-1 fingerprint to Firebase (Android)
3. Configure iOS bundle ID in Firebase

---

### 2. Facebook Sign-In Setup

#### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** app type
4. Fill in app details:
   - **App Name**: Doughminant Pizza
   - **App Contact Email**: Your email
5. Click **Create App**

#### Step 2: Add Facebook Login Product

1. In your Facebook App dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** platform

#### Step 3: Configure Facebook Login Settings

1. Go to **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   https://<YOUR-FIREBASE-PROJECT-ID>.firebaseapp.com/__/auth/handler
   ```
   - Replace `<YOUR-FIREBASE-PROJECT-ID>` with your actual Firebase project ID
   - You can find this in Firebase Console → Project Settings → General

#### Step 4: Get App ID and App Secret

1. Go to **Settings** → **Basic** in Facebook App dashboard
2. Copy:
   - **App ID**
   - **App Secret** (click Show to reveal)

#### Step 5: Add to Firebase

1. Go to Firebase Console → Authentication → Sign-in method
2. Click on **Facebook**
3. Paste **App ID** and **App Secret**
4. Click **Save**

#### Step 6: Add App Domains (Optional but Recommended)

In Facebook App → Settings → Basic:
- Add your domain (e.g., `yourdomain.com`)
- Add `localhost` for development

---

### 3. Apple Sign-In Setup

#### Prerequisites
- ✅ Apple Developer Account ($99/year)
- ✅ App registered in Apple Developer Portal

#### Step 1: Create Service ID

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add new)
4. Select **Services IDs** → **Continue**
5. Fill in:
   - **Description**: Doughminant Pizza Web
   - **Identifier**: `com.yourcompany.doughminantpizza.web` (must be unique)
6. Check **Sign In with Apple**
7. Click **Continue** → **Register**

#### Step 2: Configure Service ID

1. Click on your newly created Service ID
2. Check **Sign In with Apple** → **Configure**
3. Select your **Primary App ID** (your main app identifier)
4. Add **Return URLs**:
   ```
   https://<YOUR-FIREBASE-PROJECT-ID>.firebaseapp.com/__/auth/handler
   ```
5. Click **Save** → **Continue** → **Save**

#### Step 3: Create Key for Sign In with Apple

1. Go to **Keys** → **+** (Add new)
2. Enter **Key Name**: Doughminant Pizza Sign In Key
3. Check **Sign In with Apple**
4. Click **Configure** → Select your **Primary App ID**
5. Click **Save** → **Continue** → **Register**
6. **Download the .p8 key file** (you can only download it once!)
7. Note the **Key ID**

#### Step 4: Get Your Team ID

1. In Apple Developer Portal, go to **Membership**
2. Copy your **Team ID** (looks like: `ABC123DEF4`)

#### Step 5: Add to Firebase

1. Go to Firebase Console → Authentication → Sign-in method
2. Click on **Apple**
3. Enter:
   - **Services ID**: The identifier you created (e.g., `com.yourcompany.doughminantpizza.web`)
   - **Apple Team ID**: Your Team ID
   - **Key ID**: The Key ID from Step 3
   - **Private Key**: Open the .p8 file in a text editor and copy its contents
4. Click **Save**

---

## 🧪 Testing Social Login

### Testing Checklist

1. **Google Sign-In**
   - ✅ Click Google icon on login page
   - ✅ Should open Google sign-in popup
   - ✅ After signing in, should redirect to home page
   - ✅ User profile should be created in Firestore

2. **Facebook Sign-In**
   - ✅ Click Facebook icon on login page
   - ✅ Should open Facebook sign-in popup
   - ✅ After signing in, should redirect to home page
   - ✅ User profile should be created in Firestore

3. **Apple Sign-In**
   - ✅ Click Apple icon on login page
   - ✅ Should open Apple sign-in popup
   - ✅ After signing in, should redirect to home page
   - ✅ User profile should be created in Firestore

### Common Issues & Solutions

#### Issue: "Operation not allowed"
**Solution**: Enable the provider in Firebase Console → Authentication → Sign-in method

#### Issue: "Popup blocked"
**Solution**: 
- Allow popups for your site
- Check browser settings
- Try a different browser

#### Issue: Facebook login fails
**Solution**:
- Verify App ID and App Secret in Firebase
- Check OAuth Redirect URI is correct
- Ensure Facebook App is in "Live" mode (not Development)

#### Issue: Apple login fails
**Solution**:
- Verify all credentials in Firebase (Services ID, Team ID, Key ID, Private Key)
- Ensure .p8 key file content is correct (include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
- Check Service ID is configured with correct Return URL

#### Issue: "Account exists with different credential"
**Solution**: User already has an account with email/password. They should use email login or link accounts.

---

## 📝 Important Notes

1. **Development vs Production**
   - For development, you can test with localhost
   - For production, update OAuth redirect URIs with your production domain

2. **User Data**
   - Social login automatically creates user documents in Firestore
   - Profile images from social accounts are synced automatically
   - User name and email are extracted from social accounts

3. **Security**
   - Never commit App Secrets or Private Keys to version control
   - Use environment variables for sensitive data
   - Regularly rotate keys and secrets

4. **Mobile App (Future)**
   - Current implementation works for web
   - For native iOS/Android, additional Capacitor plugins may be needed
   - Native implementation provides better UX

---

## 🎉 You're All Set!

Once you've configured all three providers in Firebase Console, the social login buttons will work automatically. Users can now sign in with:
- ✅ Google
- ✅ Facebook  
- ✅ Apple

The code is already implemented and ready to use!

