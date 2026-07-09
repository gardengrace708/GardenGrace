import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSiteContent, updateSiteContent } from '@/lib/siteContent';

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json({ content });
}

export async function PUT(request) {
  const currentUser = await getCurrentUser();

  if (currentUser?.user !== 1) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const content = await updateSiteContent(body);
  return NextResponse.json({ content });
}
