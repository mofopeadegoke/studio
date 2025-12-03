
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Trophy,
  ShieldCheck,
  Settings,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/app/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!currentUser || currentUser.type !== 'Admin') {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.type !== 'Admin') {
    return null; // or a loading spinner
  }

  const userAvatar = PlaceHolderImages.find(img => img.id === currentUser.avatarId);

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/posts', icon: FileText, label: 'Posts' },
    { href: '/admin/events', icon: Calendar, label: 'Events' },
    { href: '/admin/challenges', icon: Star, label: 'Challenges' },
    { href: '/admin/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
           <div className="flex flex-col items-center justify-center p-4 gap-2 mb-4 border-b">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <h2 className="text-lg font-semibold font-headline">Admin Panel</h2>
            </div>
          <SidebarMenu>
            {navItems.map(item => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
                    <a>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Link href="#" legacyBehavior passHref>
            <SidebarMenuButton asChild tooltip="Settings">
              <a>
                <Settings />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="md:hidden" />
           <div className="flex-1">
             <h1 className="text-xl font-bold font-headline">
                {navItems.find(item => item.href === pathname)?.label ?? 'Dashboard'}
            </h1>
           </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userAvatar?.imageUrl} alt={currentUser.name} data-ai-hint={userAvatar?.imageHint} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
