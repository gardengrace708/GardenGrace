'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/components/providers/NavigationProvider';

export default function NavLink({ href, children, onClick, ...props }) {
  const router = useRouter();
  const { triggerNavigation } = useNavigation();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    
    // Trigger navigation animation
    triggerNavigation();
    
    // Navigate after a small delay to let animation start
    setTimeout(() => {
      router.push(href);
    }, 300);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
