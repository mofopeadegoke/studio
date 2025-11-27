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
import { User } from '@/lib/types';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.58 2.66-4.8 2.66-3.35 0-6.03-2.8-6.03-6.25s2.68-6.25 6.03-6.25c1.8 0 3.1.75 3.8 1.45l2.5-2.5C16.65 3.55 14.45 2.5 12 2.5c-5.15 0-9.25 4.15-9.25 9.25s4.1 9.25 9.25 9.25c5.3 0 9-3.9 9-9.45v-.45z" />
  </svg>
);

function getRandomDummyUser() {
  return dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
}

function mapBackendUserToFrontendUser(backendUser: any): User {
  const randomDummy = getRandomDummyUser();

  return {
    id: backendUser.id,

    // Combine real backend data with dummy data
    name: `${backendUser.firstName} ${backendUser.lastName}`,
    type: backendUser.accountType,

    // Use dummy user's avatar instead of placeholder
    avatarId: randomDummy.avatarId,

    // Use dummy user's bio
    bio: randomDummy.bio ?? "",

    // Use dummy user's social graph
    connections: randomDummy.connections ?? [],
    followers: randomDummy.followers ?? [],
    following: randomDummy.following ?? [],

    // Use dummy user's stats if they exist
    stats: randomDummy.stats ?? {},

    // Use their dummy profile cover if available
    profileCoverId: randomDummy.profileCoverId,
  };
}

export default function LoginPage() {
  const { login, setCurrentUser } = useAuth();
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
      const frontendUser = mapBackendUserToFrontendUser(response.user);
      setCurrentUser(frontendUser);
      router.push('/home');

    } catch (error) {
      console.error("Error during login:", error);
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

  const handleAdminLogin = () => {
    login('admin');
    router.push('/admin');
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
                <Input id="password" type="password" defaultValue="password" required {...register('password')} />
              </div>
              <div className="grid gap-2">
                <Label>Simulate login as:</Label>
                <Select onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {regularUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Login
              </Button>
            </div>
          </form>
          <Separator className="my-4" />
          <div className="grid gap-4">
            <Button variant="outline" className="w-full" type="button">
              <GoogleIcon className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link href="#" onClick={handleAdminLogin} className="underline">
              Login as Admin
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}