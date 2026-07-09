import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons';

export async function POST(request) {
  const body = await request.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json({ message: 'Coupon code is required' }, { status: 400 });
  }

  try {
    const result = await validateCoupon(code);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to validate coupon' }, { status: 500 });
  }
}
