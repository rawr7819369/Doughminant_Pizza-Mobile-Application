import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  Firestore 
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

const USER_KEY = 'dp_user_data';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  bio?: string;
  profileImageUrl?: string;
  favorites?: number[];
  createdAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private _user$ = new BehaviorSubject<User | null>(null);
  private _firebaseUser$ = new BehaviorSubject<FirebaseUser | null>(null);
  
  isAuthenticated$ = this._isAuthenticated$.asObservable();
  user$ = this._user$.asObservable();
  firebaseUser$ = this._firebaseUser$.asObservable();

  get isAuthenticated(): boolean {
    return this._isAuthenticated$.value;
  }

  get user(): User | null {
    return this._user$.value;
  }

  get firebaseUser(): FirebaseUser | null {
    return this._firebaseUser$.value;
  }

  get firestore(): Firestore {
    return this.firebaseService.firestore;
  }

  constructor(private firebaseService: FirebaseService) {
    // Listen to auth state changes
    onAuthStateChanged(this.firebaseService.auth, async (firebaseUser) => {
      if (firebaseUser) {
        this._firebaseUser$.next(firebaseUser);
        this._isAuthenticated$.next(true);
        // Load user data from Firestore
        await this.loadUserData(firebaseUser.uid);
      } else {
        this._firebaseUser$.next(null);
        this._user$.next(null);
        this._isAuthenticated$.next(false);
      }
    });
  }

  /**
   * Load user data from Firestore
   */
  private async loadUserData(uid: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user: User = {
          uid,
          name: userData['name'] || '',
          email: userData['email'] || '',
          role: userData['role'] || 'Customer',
          phone: userData['phone'],
          address: userData['address'],
          bio: userData['bio'],
          profileImageUrl: userData['profileImageUrl'],
          favorites: userData['favorites'] || [],
          createdAt: userData['createdAt']?.toDate()
        };
        this._user$.next(user);
        
        // Migrate localStorage data if exists
        await this.migrateLocalStorageData(uid);
      } else {
        // User document doesn't exist, create it
        const firebaseUser = this.firebaseUser;
        if (firebaseUser) {
          const user: User = {
            uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            role: 'Customer',
            favorites: []
          };
          await this.createUserDocument(user);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  /**
   * Migrate data from localStorage to Firestore
   */
  private async migrateLocalStorageData(uid: string): Promise<void> {
    try {
      // Migrate favorites
      const favoritesRaw = localStorage.getItem('dp_favorites');
      if (favoritesRaw) {
        const favorites = JSON.parse(favoritesRaw);
        if (favorites.length > 0) {
          await this.updateUserFavorites(uid, favorites);
          localStorage.removeItem('dp_favorites');
        }
      }

      // Migrate profile data
      const profileRaw = localStorage.getItem('dp_profile');
      if (profileRaw) {
        const profile = JSON.parse(profileRaw);
        await this.updateUserProfile(uid, profile);
        localStorage.removeItem('dp_profile');
      }
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  }

  /**
   * Sign up with email and password
   */
  async signup(name: string, email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.firebaseService.auth,
        email,
        password
      );

      // Update Firebase profile with display name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Create user document in Firestore
      const user: User = {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        role: 'Customer',
        favorites: []
      };

      await this.createUserDocument(user);
      
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(
        this.firebaseService.auth,
        email,
        password
      );
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<boolean> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(this.firebaseService.auth, provider);
      const user = result.user;

      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      if (!userDoc.exists()) {
        const newUser: User = {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          role: 'Customer',
          favorites: [],
          profileImageUrl: user.photoURL || undefined
        };
        await this.createUserDocument(newUser);
      } else {
        // Update profile image if available and not set
        const userData = userDoc.data();
        if (user.photoURL && !userData['profileImageUrl']) {
          await this.updateUserProfile(user.uid, {
            profileImageUrl: user.photoURL
          });
        }
      }

      return true;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code) || 'Google sign-in failed');
    }
  }

  /**
   * Sign in with Facebook
   */
  async signInWithFacebook(): Promise<boolean> {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.addScope('public_profile');
      
      const result = await signInWithPopup(this.firebaseService.auth, provider);
      const user = result.user;

      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      if (!userDoc.exists()) {
        const newUser: User = {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          role: 'Customer',
          favorites: [],
          profileImageUrl: user.photoURL || undefined
        };
        await this.createUserDocument(newUser);
      } else {
        // Update profile image if available and not set
        const userData = userDoc.data();
        if (user.photoURL && !userData['profileImageUrl']) {
          await this.updateUserProfile(user.uid, {
            profileImageUrl: user.photoURL
          });
        }
      }

      return true;
    } catch (error: any) {
      console.error('Facebook sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code) || 'Facebook sign-in failed');
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<boolean> {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      
      const result = await signInWithPopup(this.firebaseService.auth, provider);
      const user = result.user;

      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      if (!userDoc.exists()) {
        const newUser: User = {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          role: 'Customer',
          favorites: [],
          profileImageUrl: user.photoURL || undefined
        };
        await this.createUserDocument(newUser);
      } else {
        // Update profile image if available and not set
        const userData = userDoc.data();
        if (user.photoURL && !userData['profileImageUrl']) {
          await this.updateUserProfile(user.uid, {
            profileImageUrl: user.photoURL
          });
        }
      }

      return true;
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      throw new Error(this.getErrorMessage(error.code) || 'Apple sign-in failed');
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.firebaseService.auth);
      this._user$.next(null);
      this._isAuthenticated$.next(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Create user document in Firestore
   */
  private async createUserDocument(user: User): Promise<void> {
    try {
      await setDoc(doc(this.firestore, 'users', user.uid), {
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        favorites: user.favorites || [],
        createdAt: serverTimestamp()
      });
      
      this._user$.next(user);
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  /**
   * Update user profile in Firestore
   */
  async updateUserProfile(uid: string, profileData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await setDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update local user data
      const currentUser = this._user$.value;
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          ...profileData
        };
        this._user$.next(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Update user favorites
   */
  async updateUserFavorites(uid: string, favorites: number[]): Promise<void> {
    try {
      await this.updateUserProfile(uid, { favorites });
    } catch (error) {
      console.error('Error updating favorites:', error);
      throw error;
    }
  }

  /**
   * Get error message from Firebase error code
   */
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/operation-not-allowed':
        return 'Operation not allowed. Please enable this sign-in method in Firebase Console.';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/user-disabled':
        return 'User account is disabled';
      case 'auth/user-not-found':
        return 'User not found';
      case 'auth/wrong-password':
        return 'Wrong password';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later';
      case 'auth/popup-closed-by-user':
        return 'Sign-in cancelled';
      case 'auth/popup-blocked':
        return 'Popup blocked. Please allow popups for this site.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using a different sign-in method.';
      case 'auth/credential-already-in-use':
        return 'This credential is already associated with a different account.';
      case 'auth/invalid-credential':
        return 'Invalid credential. Please try again.';
      default:
        return 'An error occurred. Please try again';
    }
  }
}
