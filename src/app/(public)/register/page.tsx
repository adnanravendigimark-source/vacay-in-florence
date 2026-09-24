import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Join VACAY Florence to book skip-the-line tickets, guided tours, and save your Florentine itineraries.",
  robots: { index: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthCard
      activeTab="register"
      title="Travel with us"
      subtitle="Join us today"
    >
      <RegisterForm defaultEmail={email} />
    </AuthCard>
  );
}
