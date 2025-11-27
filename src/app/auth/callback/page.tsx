'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/api/auth';
import { useAuth } from '@/context/auth-context';
import { mapBackendUserToFrontendUser } from '@/api/auth';


export default function AuthSuccess() {
  const router = useRouter();
  const { setCurrentUser } = useAuth();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await getUserProfile();
        const frontendUser = mapBackendUserToFrontendUser(profile);
        setCurrentUser(frontendUser);
        router.push('/home'); 
      } catch (error) {
        router.push('/login'); 
      }
    };
    loadUser();
  }, []);

  return <div>Loading...</div>;
}
