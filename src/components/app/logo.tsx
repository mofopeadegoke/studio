import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import logo from "../../public/logoAlone.png";

// Logo component
export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold text-primary font-headline',
        className
      )}
    >
      <Image src={logo} alt="Bask Logo" width={45} height={45} className="rounded-full" />
      <span>Bask</span>
    </div>
  );
}
