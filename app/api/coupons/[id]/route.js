import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateCoupon, deleteCoupon, getCouponById } from '@/lib/coupons';

export async function PUT(request, { params }) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  
  try {
    const coupon = await updateCoupon(params.id, body);
    if (!coupon) {
      return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
    }
    return NextResponse.json({ coupon });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  try {
    const deleted = await deleteCoupon(params.id);
    if (!deleted) {
      return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete coupon' }, { status: 500 });
  }
}
