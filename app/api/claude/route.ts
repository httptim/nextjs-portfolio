// app/api/claude/route.ts
import { NextRequest, NextResponse } from 'next/server';

// The API key should be stored as an environment variable
// For development, create a .env.local file with CLAUDE_API_KEY
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// System prompt to guide Claude's responses about your portfolio
const SYSTEM_PROMPT = `
You are an AI assistant for a portfolio website. Your role is to help visitors learn more about the portfolio owner.

Here's information about the portfolio owner:
- Skilled full-stack developer with experience in React, Next.js, TypeScript, and Node.js
- Has worked on e-commerce platforms, real-time chat applications, task management systems, and mobile apps
- Specializes in creating responsive, user-friendly interfaces with clean, maintainable code
- Open to new opportunities and freelance projects

Answer questions helpfully, professionally, and concisely. If you don't know specific information about the portfolio owner that wasn't provided above, acknowledge that and offer to direct the visitor to the contact form where they can ask the portfolio owner directly.
`;

export async function POST(req: NextRequest) {
  try {
    // Check if API key is configured
    if (!CLAUDE_API_KEY) {
      console.error('Claude API key is not configured');
      return NextResponse.json(
        { error: 'Claude API is not configured' },
        { status: 500 }
      );
    }
    
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: messages,
        system: SYSTEM_PROMPT
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      return NextResponse.json(
        { error: 'Error communicating with Claude' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in Claude API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}