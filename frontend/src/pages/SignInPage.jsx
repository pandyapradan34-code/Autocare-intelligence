import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <SignIn
      routing="path"
      path="/login"
      signUpUrl="/register"
      fallbackRedirectUrl="/redirect"
    />
  );
}