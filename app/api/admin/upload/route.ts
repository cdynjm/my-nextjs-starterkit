import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }
  if (!request.body) {
    return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
  }
  
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Server misconfiguration: Missing Blob token' }, { status: 500 });
  }

  const blob = await put(filename, request.body, {
    access: 'public',
    addRandomSuffix: true,
    token,
  });

  return NextResponse.json(blob);
}