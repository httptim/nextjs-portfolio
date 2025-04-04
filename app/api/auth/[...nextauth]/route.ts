// app/api/auth/[...nextauth]/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return NextResponse.json({ message: 'Auth Route OK' });
}

export async function POST(request: Request) {
  return NextResponse.json({ message: 'Auth Route OK' });
}