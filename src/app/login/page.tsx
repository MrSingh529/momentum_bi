"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, User } from "firebase/auth";
import { db } from "@/lib/firebase"; // Using db to get the initialized app
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

async function checkAndCreateUserProfile(user: User) {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        // Document doesn't exist, create it
        let roles: string[] = [];
        // Assign admin role based on email
        if (user.email === "harpinder.singh@rvsolutions.in") {
            roles.push("admin");
        }
        
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            roles: roles,
            createdAt: new Date()
        });
    }
}


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("manager@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const auth = getAuth(db.app);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkAndCreateUserProfile(userCredential.user);
      router.push("/dashboard");
    } catch (error: any) {
        switch (error.code) {
            case 'auth/invalid-email':
              setError('Invalid email address format.');
              break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              setError('Invalid email or password.');
              break;
            default:
              setError('An unexpected error occurred. Please try again.');
              break;
          }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center pb-4">
             <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Momentum BI</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="manager@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Login
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Don&apos;t have an account? <a href="#" className="underline text-primary">Sign up</a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
