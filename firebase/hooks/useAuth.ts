import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "../services/AuthService";

// Hook for Sign Up
export const useSignUp = () => {
  return useMutation({
    mutationFn: async ({ email, password, displayName }: { email: string; password: string; displayName?: string }) => {
      return await AuthService.signUp(email, password, displayName);
    },
    onError: (error: Error) => {
      // You can add a toast or alert here for better UX
      console.error("Sign Up Error:", error.message);
    }
  });
};

// Hook for Sign In
export const useSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await AuthService.signIn(email, password);
    },
    onSuccess: (user) => {
      // Update the user state if you have a global store or context
      queryClient.setQueryData(["currentUser"], user);
    },
    onError: (error: Error) => {
      console.error("Sign In Error:", error.message);
    }
  });
};

// Hook for Google Sign In
export const useGoogleSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await AuthService.signInWithGoogle();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["currentUser"], user);
    },
    onError: (error: Error) => {
      console.error("Google Sign In Error:", error.message);
    }
  });
};

// Hook for GitHub Sign In
export const useGithubSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await AuthService.signInWithGithub();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["currentUser"], user);
    },
    onError: (error: Error) => {
      console.error("GitHub Sign In Error:", error.message);
    }
  });
};

// Hook for Logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await AuthService.logout();
    },
    onSuccess: () => {
      // Clear user data on logout
      queryClient.setQueryData(["currentUser"], null);
    },
    onError: (error: Error) => {
      console.error("Logout Error:", error.message);
    }
  });
};

// Hook for Password Reset
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return await AuthService.sendPasswordReset(email);
    },
    onError: (error: Error) => {
      console.error("Password Reset Error:", error.message);
    }
  });
};