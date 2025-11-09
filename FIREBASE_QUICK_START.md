# 🚀 Firebase Quick Start Guide

## ✅ What's Been Done

### 1. Firebase Integration Complete
- ✅ Firebase SDK installed (`firebase`, `@angular/fire`)
- ✅ Firebase service created (`src/app/services/firebase.service.ts`)
- ✅ Environment files updated with Firebase config placeholders
- ✅ Firebase initialized in app startup

### 2. Services Updated to Use Firebase

#### AuthService
- ✅ Uses Firebase Authentication (Email/Password)
- ✅ User data stored in Firestore `users` collection
- ✅ Automatic data migration from localStorage
- ✅ Real-time auth state management

#### PizzaService
- ✅ Pizzas stored in Firestore `pizzas` collection
- ✅ Automatic seeding of default pizzas
- ✅ Real-time pizza data updates

#### OrderService
- ✅ Cart stored in Firestore `carts` collection (per user)
- ✅ Automatic cart migration from localStorage
- ✅ Real-time cart synchronization

#### OrderHistoryService
- ✅ Orders stored in Firestore `orders` collection
- ✅ Order history per user
- ✅ Order status management
- ✅ Automatic order migration from localStorage

### 3. Pages Updated
- ✅ Login page - Async Firebase authentication
- ✅ Signup page - Firebase user creation
- ✅ Home page - Firestore favorites integration
- ✅ Payment page - Order saving to Firestore
- ✅ Receipt page - Order retrieval from Firestore

---

## 📋 Next Steps - YOU NEED TO DO THIS

### Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project"
   - Project name: `DoeminantPizza`
   - Click "Continue"
   - (Optional) Enable Google Analytics
   - Click "Create project"

### Step 2: Register Web App

1. **Add Web App to Firebase Project**
   - In Firebase Console, click the Web icon (`</>`)
   - App nickname: `DoeminantPizza Web`
   - Click "Register app"

2. **Copy Firebase Configuration**
   - You'll see a config object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

3. **Update Environment Files**
   - Open `src/environments/environment.ts`
   - Replace `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc. with your actual Firebase config values
   - Do the same for `src/environments/environment.prod.ts`

### Step 3: Enable Firebase Services

#### Enable Authentication
1. Go to **Authentication** in Firebase Console
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Click **"Save"**

#### Enable Firestore Database
1. Go to **Firestore Database** in Firebase Console
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll update rules next)
4. Click **"Next"**
5. Select a location (choose closest to your users)
6. Click **"Enable"**

### Step 4: Set Up Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with the rules from `FIREBASE_SETUP_GUIDE.md` (Section 5)
3. Click **"Publish"**

**Important Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pizzas: Read-only for all
    match /pizzas/{pizzaId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Users: Users can read/write their own data
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Carts: Users can read/write their own cart
    match /carts/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Orders: Users can read their own orders
    match /orders/{orderId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Step 5: Test the App

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Test Authentication:**
   - Sign up a new user
   - Check Firebase Console → Authentication to see the user
   - Log in with the credentials

3. **Test Data Operations:**
   - Add items to cart
   - Check Firebase Console → Firestore → `carts` collection
   - Place an order
   - Check Firebase Console → Firestore → `orders` collection

4. **Verify Data Migration:**
   - If you had data in localStorage, it should automatically migrate to Firestore
   - Check Firebase Console to see migrated data

---

## 🔍 Troubleshooting

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution:** Make sure you've added Firebase config to `environment.ts` and `environment.prod.ts`

### Issue: "Firebase: Error (auth/operation-not-allowed)"
**Solution:** Enable Email/Password authentication in Firebase Console

### Issue: "Firestore: Missing or insufficient permissions"
**Solution:** Check Firestore Security Rules and make sure they're published

### Issue: "Cannot read property 'uid' of null"
**Solution:** Make sure user is authenticated before accessing Firestore data

### Issue: Data not appearing in Firestore
**Solution:** 
- Check browser console for errors
- Verify Security Rules allow write operations
- Check if user is authenticated

---

## 📚 Database Structure

### Collections Created:

1. **`pizzas`** - Pizza menu items
2. **`users`** - User profiles and favorites
3. **`carts`** - Shopping carts (one per user)
4. **`orders`** - Order history (one per order)
5. **`feedback`** - User feedback (optional)

---

## 🎯 What Works Now

✅ **Authentication**
- Sign up with email/password
- Login with email/password
- Logout
- User session persistence

✅ **Data Storage**
- Pizzas stored in Firestore
- User data in Firestore
- Cart stored in Firestore (per user)
- Orders stored in Firestore (per user)

✅ **Real-time Updates**
- Cart syncs across devices
- Order history updates in real-time
- User favorites sync in real-time

✅ **Data Migration**
- Automatic migration from localStorage to Firestore
- Favorites migration
- Cart migration
- Orders migration

---

## 🚨 Important Notes

1. **Firebase Config:** You MUST update the Firebase config in `environment.ts` and `environment.prod.ts` with your actual Firebase project credentials.

2. **Security Rules:** The default security rules are permissive for testing. Update them for production.

3. **Authentication:** Email/Password authentication MUST be enabled in Firebase Console.

4. **Firestore:** Firestore database MUST be created and security rules MUST be configured.

5. **Data Migration:** Data will automatically migrate from localStorage to Firestore on first login.

---

## 📖 Additional Resources

- **Full Setup Guide:** See `FIREBASE_SETUP_GUIDE.md` for detailed instructions
- **Firebase Documentation:** https://firebase.google.com/docs
- **AngularFire Documentation:** https://github.com/angular/angularfire
- **Firestore Security Rules:** https://firebase.google.com/docs/firestore/security/get-started

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Web app registered in Firebase
- [ ] Firebase config added to `environment.ts`
- [ ] Firebase config added to `environment.prod.ts`
- [ ] Email/Password authentication enabled
- [ ] Firestore database created
- [ ] Security rules configured and published
- [ ] App tested (signup, login, cart, orders)
- [ ] Data migration verified

---

**Once you complete these steps, your app will be fully connected to Firebase! 🎉**

