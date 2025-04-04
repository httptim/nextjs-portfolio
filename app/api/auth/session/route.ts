// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';  // Updated import path

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  return NextResponse.json(session);
}