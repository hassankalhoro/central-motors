import type { Metadata } from "next";
import { Suspense } from "react";
import AuthScreen from "@/components/admin/AuthScreen";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password, Dealer Management Portal",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthScreen title="Set a new password" subtitle="Choose a strong password for your admin account.">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthScreen>
  );
}
