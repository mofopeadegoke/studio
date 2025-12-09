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
import { Eye, EyeOff } from 'lucide-react'; // Add this import
import { useState } from 'react'; // Add this import


export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false); // Add this state
  
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
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
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
            <div className="grid gap-2">
              <Label>I am a...</Label>
              <Select required {...register('accountType')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Player">Player</SelectItem>
                  <SelectItem value="Team">Team</SelectItem>
                  <SelectItem value="Scout">Scout / Coach / Academy</SelectItem>
                  <SelectItem value="Fan">Fan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create an account'}
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