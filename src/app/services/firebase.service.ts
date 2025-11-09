import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  private _auth: Auth;
  private _firestore: Firestore;
  private _storage: FirebaseStorage;

  constructor() {
    // Initialize Firebase
    this.app = initializeApp(environment.firebase);
    
    // Initialize Auth
    this._auth = getAuth(this.app);
    
    // Initialize Firestore
    this._firestore = getFirestore(this.app);
    
    // Initialize Storage
    this._storage = getStorage(this.app);
    
    // Connect to emulators in development (optional)
    // Uncomment if you want to use Firebase Emulators
    // if (!environment.production) {
    //   connectAuthEmulator(this._auth, 'http://localhost:9099');
    //   connectFirestoreEmulator(this._firestore, 'localhost', 8080);
    //   connectStorageEmulator(this._storage, 'localhost', 9199);
    // }
  }

  get auth(): Auth {
    return this._auth;
  }

  get firestore(): Firestore {
    return this._firestore;
  }

  get storage(): FirebaseStorage {
    return this._storage;
  }

  get appInstance(): FirebaseApp {
    return this.app;
  }
}

