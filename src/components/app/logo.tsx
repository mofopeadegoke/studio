import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold text-primary font-headline',
        className
      )}
    >
      <ShieldCheck className="h-6 w-6 text-accent" />
      <span>SportLink</span>
    </div>
  );
}
