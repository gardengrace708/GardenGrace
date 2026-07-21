import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

function signCloudinaryParams(params, apiSecret) {
  const payload = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();

    if (currentUser?.user !== 1) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { message: 'Cloudinary env variables missing' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { filename } = body;

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'makhsoos/hero';

    const signature = signCloudinaryParams(
      { folder, timestamp },
      apiSecret
    );

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      resource_type: 'video'
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: error.message || 'Server error'
      },
      { status: 500 }
    );
  }
}
