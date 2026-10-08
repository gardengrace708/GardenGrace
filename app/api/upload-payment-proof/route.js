import crypto from 'crypto';
import { NextResponse } from 'next/server';

function signCloudinaryParams(params, apiSecret) {
  const payload = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

export async function POST(request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { message: 'Cloudinary env variables missing' },
        { status: 500 }
      );
    }

    const incomingFormData = await request.formData();
    const file = incomingFormData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { message: 'Image file required' },
        { status: 400 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'makhsoos/payment-proofs';

    const signature = signCloudinaryParams(
      { folder, timestamp },
      apiSecret
    );

    const uploadFormData = new FormData();

    uploadFormData.append('file', file);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', String(timestamp));
    uploadFormData.append('folder', folder);
    uploadFormData.append('signature', signature);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData
      }
    );

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      return NextResponse.json(
        {
          message:
            uploadData?.error?.message || 'Image upload failed'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      url: uploadData.secure_url,
      publicId: uploadData.public_id
    });
  } catch (error) {
    console.error('Payment proof upload error:', error);

    return NextResponse.json(
      {
        message: error.message || 'Server error'
      },
      { status: 500 }
    );
  }
}
