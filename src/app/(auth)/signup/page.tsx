'use client';

import Link from 'next/link';
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
import { Logo } from '@/components/app/logo';
import { Separator } from '@/components/ui/separator';
import { registerUser } from '@/api/auth';
import { RegisterSchema } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/types';
import { useRouter } from 'next/navigation';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.58 2.66-4.8 2.66-3.35 0-6.03-2.8-6.03-6.25s2.68-6.25 6.03-6.25c1.8 0 3.1.75 3.8 1.45l2.5-2.5C16.65 3.55 14.45 2.5 12 2.5c-5.15 0-9.25 4.15-9.25 9.25s4.1 9.25 9.25 9.25c5.3 0 9-3.9 9-9.45v-.45z" />
  </svg>
);

export default function SignupPage() {
  const router = useRouter();
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema), 
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      accountType: 'Player'
    }
  });

  async function onSubmit(data: RegisterSchema) {
    try {
      const response = await registerUser(data);
      router.push('/login');
    }
    catch (error) {
      console.error("Error during signup:", error);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="flex justify-center mb-6">
        <Logo />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" placeholder="Max" required {...register('firstName')}/>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" placeholder="Robinson" required {...register('lastName')}/>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                {...register('email')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
            </div>
            <div className="grid gap-2">
              <Label>I am a...</Label>
              <Select required {...register('accountType')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Player">Player</SelectItem>
                  <SelectItem value="Team">Team</SelectItem>
                  <SelectItem value="Scout">Scout</SelectItem>
                  <SelectItem value="Fan">Fan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create an account'}
            </Button>
            <Separator className="my-2" />
            <Button variant="outline" className="w-full" type="button">
              <GoogleIcon className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}