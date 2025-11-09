# 🔥 Firebase Integration Guide - DoeminantPizza

## 📋 Table of Contents
1. [Firebase Console Setup](#1-firebase-console-setup)
2. [Firebase Configuration](#2-firebase-configuration)
3. [Firebase Services Setup](#3-firebase-services-setup)
4. [Database Structure](#4-database-structure)
5. [Security Rules](#5-security-rules)
6. [Testing](#6-testing)

---

## 1. Firebase Console Setup

### Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Add project" or "Create a project"
   - Project name: `DoeminantPizza` (or your preferred name)
   - Click "Continue"

3. **Configure Google Analytics** (Optional)
   - Choose whether to enable Google Analytics
   - If yes, select or create an Analytics account
   - Click "Create project"

4. **Wait for project creation** (takes a few seconds)
   - Click "Continue" when ready

### Step 2: Register Your Web App

1. **Add Web App**
   - In Firebase Console, click the Web icon (`</>`)
   - App nickname: `DoeminantPizza Web`
   - Check "Also set up Firebase Hosting" (optional)
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
   - **IMPORTANT:** Save this config - you'll need it in Step 3

3. **Click "Continue to console"**

### Step 3: Enable Firebase Services

#### Enable Authentication

1. **Go to Authentication**
   - In left sidebar, click "Authentication"
   - Click "Get started"

2. **Enable Sign-in Methods**
   - Click "Sign-in method" tab
   - Enable "Email/Password"
     - Click on "Email/Password"
     - Toggle "Enable" to ON
     - Click "Save"

#### Enable Firestore Database

1. **Go to Firestore Database**
   - In left sidebar, click "Firestore Database"
   - Click "Create database"

2. **Choose Security Rules**
   - Select "Start in test mode" (we'll update rules later)
   - Click "Next"

3. **Choose Location**
   - Select a location closest to your users
   - Click "Enable"

---

## 2. Firebase Configuration

### Step 1: Add Firebase Config to Environment

1. **Open `src/environments/environment.ts`**
2. **Add your Firebase config** (from Step 2 above):

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

3. **Open `src/environments/environment.prod.ts`**
4. **Add the same config** (use production values if different):

```typescript
export const environment = {
  production: true,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

### Step 2: Initialize Firebase in App

The Firebase initialization is already set up in `src/main.ts`. 
Firebase is initialized through the `FirebaseService` when the app starts.
You don't need to do anything - it's already configured!

---

## 3. Firebase Services Setup

### Services Created:

1. **FirebaseService** (`src/app/services/firebase.service.ts`)
   - Initializes Firebase
   - Provides Firestore and Auth instances

2. **Updated AuthService** (`src/app/services/auth.service.ts`)
   - Uses Firebase Authentication
   - Email/Password authentication
   - User session management

3. **Updated PizzaService** (`src/app/services/pizza.service.ts`)
   - Stores pizzas in Firestore
   - Real-time updates

4. **Updated OrderService** (`src/app/services/order.service.ts`)
   - Stores cart in Firestore (per user)
   - Real-time cart sync

5. **Updated OrderHistoryService** (`src/app/services/order-history.service.ts`)
   - Stores orders in Firestore
   - Order history per user

---

## 4. Database Structure

### Firestore Collections:

#### 1. `pizzas` Collection
```
pizzas/
  └── {pizzaId}/
      ├── id: number
      ├── name: string
      ├── ingredients: string
      ├── price: number
      ├── size: string[]
      ├── img: string
      ├── rating: number
      ├── time: string
      ├── discount: number (optional)
      └── customizable: boolean
```

#### 2. `users` Collection
```
users/
  └── {userId}/
      ├── name: string
      ├── email: string
      ├── role: string
      ├── phone: string (optional)
      ├── address: string (optional)
      ├── bio: string (optional)
      ├── favorites: number[] (array of pizza IDs)
      └── createdAt: timestamp
```

#### 3. `carts` Collection
```
carts/
  └── {userId}/
      └── items: CartItem[]
          ├── pizza: PizzaItem
          ├── size: string
          ├── quantity: number
          └── customization: PizzaCustomization (optional)
```

#### 4. `orders` Collection
```
orders/
  └── {orderId}/
      ├── userId: string
      ├── id: string
      ├── date: timestamp
      ├── items: CartItem[]
      ├── subtotal: number
      ├── deliveryFee: number
      ├── total: number
      ├── status: string
      ├── address: string
      ├── phone: string
      ├── paymentMethod: string
      └── createdAt: timestamp
```

#### 5. `feedback` Collection
```
feedback/
  └── {feedbackId}/
      ├── userId: string
      ├── rating: number
      ├── comment: string
      ├── tags: string[]
      └── createdAt: timestamp
```

---

## 5. Security Rules

### Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules tab

Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Pizzas: Read-only for all, write for admins only
    match /pizzas/{pizzaId} {
      allow read: if true; // Everyone can read pizzas
      allow write: if false; // Only admins can write (configure admin check if needed)
    }
    
    // Users: Users can read/write their own data
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if isAuthenticated() && isOwner(userId);
    }
    
    // Carts: Users can read/write their own cart
    match /carts/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId);
    }
    
    // Orders: Users can read their own orders, create new orders
    match /orders/{orderId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Feedback: Users can create feedback, read all feedback
    match /feedback/{feedbackId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### Click "Publish" to save the rules

---

## 6. Testing

### Step 1: Seed Initial Data

1. **Add Pizzas to Firestore**
   - The app will automatically seed pizzas on first run
   - Or manually add pizzas through Firebase Console

2. **Test Authentication**
   - Sign up a new user
   - Log in with credentials
   - Check Firebase Console → Authentication to see the user

3. **Test Cart**
   - Add items to cart
   - Check Firebase Console → Firestore → `carts` collection
   - Verify cart is saved per user

4. **Test Orders**
   - Complete an order
   - Check Firebase Console → Firestore → `orders` collection
   - Verify order is saved with user ID

### Step 2: Verify Data Sync

1. **Open Firebase Console**
2. **Navigate to Firestore Database**
3. **Check collections:**
   - `pizzas` - Should have 5 pizzas
   - `users` - Should have user documents
   - `carts` - Should have cart for logged-in user
   - `orders` - Should have orders after placing orders

### Step 3: Test Real-time Updates

1. **Open app in two browsers**
2. **Log in with same user**
3. **Add item to cart in one browser**
4. **Check if cart updates in other browser** (real-time sync)

---

## 7. Migration from localStorage

The app automatically migrates data from localStorage to Firebase:

- **On first login:** User data is migrated
- **Cart:** Migrated when user logs in
- **Favorites:** Migrated when user logs in
- **Orders:** Existing orders remain in localStorage (new orders go to Firebase)

---

## 8. Troubleshooting

### Issue: Firebase not initializing
- **Check:** Firebase config in `environment.ts`
- **Check:** Browser console for errors
- **Solution:** Verify API keys are correct

### Issue: Authentication not working
- **Check:** Firebase Console → Authentication → Sign-in methods
- **Check:** Email/Password is enabled
- **Solution:** Enable Email/Password authentication

### Issue: Permission denied errors
- **Check:** Firestore Security Rules
- **Check:** User is authenticated
- **Solution:** Update security rules, verify user is logged in

### Issue: Data not saving
- **Check:** Browser console for errors
- **Check:** Firestore Security Rules
- **Solution:** Verify rules allow write operations

---

## 9. Next Steps

1. ✅ Configure Firebase project
2. ✅ Add Firebase config to environment files
3. ✅ Test authentication
4. ✅ Test data operations
5. ✅ Verify security rules
6. ✅ Deploy to production

---

## 10. Production Deployment

### Before deploying:

1. **Update Security Rules** - Remove test mode, add proper rules
2. **Enable App Check** - Protect your Firebase resources
3. **Set up Custom Domain** - For Firebase Hosting (optional)
4. **Enable Analytics** - Track app usage
5. **Set up Error Reporting** - Monitor errors

### Deploy to Firebase Hosting:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Build your app
npm run build

# Deploy
firebase deploy
```

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [AngularFire Documentation](https://github.com/angular/angularfire)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

## ✅ Checklist

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created
- [ ] Firebase config added to environment files
- [ ] Security rules configured
- [ ] Test authentication
- [ ] Test data operations
- [ ] Verify real-time sync
- [ ] Deploy to production

---

**Need Help?** Check the Firebase Console or refer to the Firebase documentation.

