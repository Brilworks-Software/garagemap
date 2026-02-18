import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    User
  } from "firebase/auth";
  import { auth } from "../config/firebaseConfig";
  
  export const AuthService = {
    // Sign Up with Email and Password
    signUp: async (email: string, password: string, displayName?: string) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Set displayName if provided
        if (displayName) {
          await updateProfile(user, { displayName });
        }
        
        await sendEmailVerification(user);
        return user;
      } catch (error: unknown) {
        const err = error as { message?: string };
        throw new Error(err.message || "Failed to sign up");
      }
    },
  
    // Sign In with Email and Password
    signIn: async (email: string, password: string) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error: unknown) {
        const err = error as { message?: string };
        throw new Error(err.message || "Failed to sign in");
      }
    },
  
    // Sign Out
    logout: async () => {
      try {
        await signOut(auth);
      } catch (error: unknown) {
        const err = error as { message?: string };
        throw new Error(err.message || "Failed to sign out");
      }
    },
  
    // Google Sign-In (Web compatible, for Native needs Credential)
    signInWithGoogle: async () => {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
      } catch (error: unknown) {
        const err = error as { message?: string };
        throw new Error(err.message || "Failed to sign in with Google");
      }
    },
  
    // GitHub Sign-In (Web compatible)
    signInWithGithub: async () => {
      try {
        const provider = new GithubAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
      } catch (error: unknown) {
        const err = error as { message?: string };
        throw new Error(err.message || "Failed to sign in with GitHub");
      }
    },
  
    // Get Current User
    getCurrentUser: () => {
      return auth.currentUser;
    },
  
    // Send Password Reset Email
    sendPasswordReset: async (email: string) => {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error: unknown) {
        const err = error as { message?: string };
        throw new Error(err.message || "Failed to send password reset email");
      }
    },

    // Auth State Listener
    onAuthStateChanged: (callback: (user: User | null) => void) => {
      return onAuthStateChanged(auth, callback);
    }
  };