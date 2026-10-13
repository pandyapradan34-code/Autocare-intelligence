import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <SignUp
      routing="path"
      path="/register"
      signInUrl="/login"
      fallbackRedirectUrl="/redirect"
    />
  );
}