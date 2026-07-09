import { NextResponse } from 'next/server';
import { getGlobalDiscount, updateGlobalDiscount } from '@/lib/globalDiscount';

export async function GET() {
  try {
    const discount = await getGlobalDiscount();
    return NextResponse.json({ discount });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to get global discount' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const discount = await updateGlobalDiscount(body);
    return NextResponse.json({ discount });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update global discount' }, { status: 500 });
  }
}
