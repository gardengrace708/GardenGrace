import { NextResponse } from 'next/server';
import { isGlobalDiscountActive } from '@/lib/globalDiscount';

export async function GET() {
  try {
    const status = await isGlobalDiscountActive();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ active: false, discountPercent: 0 }, { status: 500 });
  }
}
