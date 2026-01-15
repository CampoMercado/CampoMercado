'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    return getSdks(getApp());
  }

  let firebaseApp: FirebaseApp;

  // In development, we get a noisy "app/no-options" error if we try to initialize without a config.
  // In production (on App Hosting), we want to try initializing without options first as it's the preferred method.
  if (process.env.NODE_ENV === 'production') {
    try {
      // This is the preferred method for Firebase App Hosting.
      firebaseApp = initializeApp();
    } catch (e) {
      // Fallback for safety, though it shouldn't be needed in a proper App Hosting env.
      console.warn('Automatic Firebase initialization failed in production. Falling back to config object.', e);
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    // In development, just use the config to avoid the console error.
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
