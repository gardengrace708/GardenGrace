'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/components/providers/NavigationProvider';
import { safeNavigate } from '@/lib/errorHandler';

export default function NavLink({ href, children, onClick, ...props }) {
  const router = useRouter();
  const { triggerNavigation } = useNavigation();

  const handleClick = (e) => {
    if (onClick) onClick(e);

    // Trigger navigation animation
    triggerNavigation();

    // Navigate after a small delay to let animation start
    setTimeout(() => {
      safeNavigate(router, href, 10000); // 10 second timeout
    }, 300);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
