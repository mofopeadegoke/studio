'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { users as dummyUsers } from '@/lib/data';
import { useState } from 'react';
import { Logo } from '@/components/app/logo';
import { Separator } from '@/components/ui/separator';
import { loginUser } from '@/api/auth';
import { LoginSchema } from '@/lib/types';
import { loginSchema } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import googleIcon from '@/public/googleLogo.png';
import { mapBackendUserToFrontendUser } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react'; // Add this import


export default function LoginPage() {
  const { login, setCurrentUser } = useAuth();
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // Add this state
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginSchema) {
    try {
      const response = await loginUser(data.email, data.password);
      console.log("Login response:", response);
      const frontendUser = mapBackendUserToFrontendUser(response);
      setCurrentUser(frontendUser);
      if(frontendUser.type === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/home');
      }
      toast({
          title: "Success",
          description: "Login successful!",
        });

    } catch (error) {
      console.error("Error during login:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Login failed. Please try again.",
      });
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      const user = dummyUsers.find(u => u.id === selectedUserId);
      if (user?.type === 'Admin') {
        login(selectedUserId);
        router.push('/admin');
      } else {
        login(selectedUserId);
        router.push('/home');
      }
    }
  };

  const regularUsers = dummyUsers.filter(u => u.type !== 'Admin');

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="flex justify-center mb-6">
        <Logo />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Select a user to simulate logging in. In a real app, this would be a username/password form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  defaultValue="user@example.com"
                  required
                  {...register('email')}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    defaultValue="password" 
                    required 
                    {...register('password')} 
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
          <Separator className="my-4" />
          <div className="grid gap-4">
            <Button variant="outline" className="w-full" type="button">
              <Image src={googleIcon} alt="Google" className="h-8 w-8" onClick={() => {window.location.href = "https://bask-backend.onrender.com/api/auth/google"}}/>
              Sign in with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}