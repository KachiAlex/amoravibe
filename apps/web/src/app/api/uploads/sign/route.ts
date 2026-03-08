import { NextResponse } from 'next/server';
import { buildUploadSignature } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    console.log('[uploads/sign] received body:', body);
    const folder = typeof body.folder === 'string' ? body.folder : undefined;
    const extraTags = Array.isArray(body.tags) ? body.tags.join(',') : undefined;

    // Build signature with cleaned parameters
    const signature = buildUploadSignature({
      folder,
      tags: extraTags,
      context: body.context,
    });
    console.log('[uploads/sign] generated signature:', {
      cloudName: signature.cloudName,
      timestamp: signature.timestamp,
      params: signature.paramsToSign,
    });

    return NextResponse.json({
      signature: signature.signature,
      timestamp: signature.timestamp,
      cloudName: signature.cloudName,
      apiKey: signature.apiKey,
      uploadPreset: signature.uploadPreset,
      params: signature.paramsToSign,
    });
  } catch (error) {
    console.error('[uploads/sign] failed', error);
    return NextResponse.json({ error: 'Unable to generate upload signature' }, { status: 500 });
  }
}
