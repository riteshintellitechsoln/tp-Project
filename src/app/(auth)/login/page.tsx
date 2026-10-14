//  import { redirect } from "next/navigation";
// import { Suspense } from "react";
// import { LogIn } from "lucide-react";
// import { auth } from "@/lib/auth";
// import { isAdminRole } from "@/lib/rbac";
// import { LoginForm } from "@/components/forms/login-form";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// interface LoginPageProps {
//   searchParams: Promise<{ callbackUrl?: string }>;
// }

// export default async function LoginPage({ searchParams }: LoginPageProps) {
//   const session = await auth();
//   if (session?.user) {
//     redirect(isAdminRole(session.user.role) ? "/admin" : "/my-library");
//   }

//   const sp = await searchParams;
//   const cameFromProtectedPage = !!sp.callbackUrl;

//   return (
//     <Card className="w-full max-w-sm">
//       <CardHeader>
//         <CardTitle>Sign in to TradeHub</CardTitle>
//         <CardDescription>
//           Admins and returning members sign in here.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {cameFromProtectedPage && (
//           <div className="mb-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
//             <LogIn className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
//             <span>Please sign in to continue — your session may have expired.</span>
//           </div>
//         )}
//         <Suspense>
//           <LoginForm />
//         </Suspense>
//       </CardContent>
//     </Card>
//   );
// }

// import { redirect } from "next/navigation";
// import { Suspense } from "react";
// import Link from "next/link";
// import { ArrowLeft, BookOpen, Library, LogIn } from "lucide-react";
// import { auth } from "@/lib/auth";
// import { isAdminRole } from "@/lib/rbac";
// import { LoginForm } from "@/components/forms/login-form";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// interface LoginPageProps {
//   searchParams: Promise<{ callbackUrl?: string }>;
// }

// export default async function LoginPage({ searchParams }: LoginPageProps) {
//   const session = await auth();
//   if (session?.user) {
//     redirect(isAdminRole(session.user.role) ? "/admin" : "/my-library");
//   }

//   const sp = await searchParams;
//   const cameFromProtectedPage = !!sp.callbackUrl;

//   return (
//     <div className="w-full max-w-sm">
//       <Link
//         href="/"
//         className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
//       >
//         <ArrowLeft className="h-4 w-4" />
//         Back to Home
//       </Link>

//       <Link
//         href="/"
//         className="mb-6 flex items-center justify-center gap-2 font-display text-xl font-bold"
//       >
//         <BookOpen className="h-6 w-6 text-primary" />
//         TradeHub
//       </Link>

//       <Card className="border-t-4 border-t-seal shadow-lg">
//         <CardHeader>
//           <CardTitle>Sign in to TradeHub</CardTitle>
//           <CardDescription>This is for Admins signing in with a password.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {cameFromProtectedPage && (
//             <div className="mb-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
//               <LogIn className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
//               <span>Please sign in to continue — your session may have expired.</span>
//             </div>
//           )}

//           <div className="mb-4 flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
//             <Library className="mt-0.5 h-4 w-4 shrink-0 text-seal" />
//             <span>
//               Just checking your downloads?{" "}
//               <Link href="/my-library" className="font-medium text-foreground underline">
//                 Go to My Library
//               </Link>{" "}
//               — no password needed, just your email.
//             </span>
//           </div>

//           <Suspense>
//             <LoginForm />
//           </Suspense>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
 


import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Library, LogIn } from "lucide-react";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { LoginForm } from "@/components/forms/login-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) {
    redirect(isAdminRole(session.user.role) ? "/admin" : "/my-library");
  }

  const sp = await searchParams;
  const cameFromProtectedPage = !!sp.callbackUrl;

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
          <CardTitle>Sign in to TradeHub</CardTitle>
          <CardDescription>This is for Admins signing in with a password.</CardDescription>
        </CardHeader>
        <CardContent>
          {cameFromProtectedPage && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
              <LogIn className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Please sign in to continue — your session may have expired.</span>
            </div>
          )}

          <div className="mb-4 flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <Library className="mt-0.5 h-4 w-4 shrink-0 text-seal" />
            <span>
              Just checking your downloads?{" "}
              <Link href="/my-library" className="font-medium text-foreground underline">
                Go to My Library
              </Link>{" "}
              — no password needed, just your email.
            </span>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>

          <Button asChild className="mt-3 w-full">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>


          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?
          </p>

          <div className="mt-4 flex items-center justify-center gap-3 text-sm">
            <Link
              href="/signup"
              className="group inline-flex items-center rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 font-semibold text-primary shadow-[0_4px_0_rgba(0,0,0,0.08),0_8px_18px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_6px_0_rgba(0,0,0,0.12),0_12px_24px_rgba(0,0,0,0.12)] active:translate-y-0 active:shadow-[0_2px_0_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.08)]"
            >
              Create one
            </Link>

            <span className="text-muted-foreground/60">•</span>

            <Link
              href="/forgot-password"
              className="group inline-flex items-center rounded-xl border border-border bg-background px-4 py-2 font-semibold text-muted-foreground shadow-[0_4px_0_rgba(0,0,0,0.06),0_8px_18px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-[0_6px_0_rgba(0,0,0,0.1),0_12px_24px_rgba(0,0,0,0.1)] active:translate-y-0 active:shadow-[0_2px_0_rgba(0,0,0,0.06),0_4px_10px_rgba(0,0,0,0.06)]"
            >
              Forgot password?
            </Link>
          </div>

          
          
        </CardContent>
      </Card>
    </div>
  );
}