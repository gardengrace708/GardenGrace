import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCoupons, createCoupon } from '@/lib/coupons';

export async function GET(request) {
  const coupons = await getCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(request) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  
  if (!body.code || !body.discountPercent) {
    return NextResponse.json({ message: 'Code and discount percent are required' }, { status: 400 });
  }

  try {
    const coupon = await createCoupon(body);
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create coupon' }, { status: 500 });
  }
}
