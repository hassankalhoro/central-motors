import type { Metadata } from "next";
import AuthScreen from "@/components/admin/AuthScreen";
import ForgotPasswordForm from "@/components/admin/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password, Dealer Management Portal",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthScreen title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link.">
      <ForgotPasswordForm />
    </AuthScreen>
  );
}
