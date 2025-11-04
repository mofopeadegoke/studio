
'use client';

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push('/home');
    }
  }, [currentUser, router]);

  if (currentUser) {
    return null; // or a loading spinner
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {children}
    </div>
  );
}
