'use server';

import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const signupSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function createUserAction(input: z.infer<typeof signupSchema>) {
  const validation = signupSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: 'Datos inválidos.' };
  }

  const { auth, firestore } = initializeFirebase();
  const { email, password, fullName } = validation.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userProfile = {
      fullName,
      email,
    };

    const userDocRef = doc(firestore, 'users', user.uid);
    await setDoc(userDocRef, userProfile);

    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error('Error creating user:', error);
    // Propagate specific Firebase auth errors
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        error: 'El email ingresado ya está en uso.',
      };
    }
    return {
      success: false,
      error: 'Ocurrió un error durante el registro.',
    };
  }
}
