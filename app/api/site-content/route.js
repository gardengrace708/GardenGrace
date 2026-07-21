import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSiteContent, updateSiteContent } from '@/lib/siteContent';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ message: 'Failed to get site content' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const currentUser = await getCurrentUser();

    console.log('PUT request - currentUser:', currentUser);

    if (currentUser?.user !== 1) {
      console.log('PUT request - auth failed, user:', currentUser);
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    console.log('PUT request - body:', body);
    const content = await updateSiteContent(body);

    // Revalidate home page to reflect changes immediately
    revalidatePath('/');
    revalidatePath('/about');

    return NextResponse.json({ content });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update site content' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
