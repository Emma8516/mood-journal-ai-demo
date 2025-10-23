// /src/lib/authErrors.ts
export function authErrorMessage(err: unknown): string {
  const code = (err as any)?.code as string | undefined;

  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already in use.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/weak-password":
      return "Password must be at least 8 characters.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/network-request-failed":
      return "Network error. Please try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in window was closed.";
    default:
      return "Something went wrong. Please try again.";
  }
}
