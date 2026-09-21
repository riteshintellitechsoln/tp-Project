import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <Link
        href="/"
        className="mb-6 flex items-center justify-center gap-2 font-display text-xl font-bold"
      >
        <BookOpen className="h-6 w-6 text-primary" />
        TradeHub
      </Link>

      <Card className="border-t-4 border-t-seal shadow-lg">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your account email and we&apos;ll send you a link to set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}