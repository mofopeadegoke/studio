'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/api/auth';
import { useAuth } from '@/context/auth-context';
import { mapBackendUserToFrontendUser } from '@/api/auth';
import Loader from '@/components/ui/loader';


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

  return <Loader />;
}
