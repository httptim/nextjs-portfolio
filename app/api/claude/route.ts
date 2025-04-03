// app/api/claude/route.ts
import { NextRequest, NextResponse } from 'next/server';

// The API key should be stored as an environment variable
// For development, create a .env.local file with CLAUDE_API_KEY
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// System prompt to guide Claude's responses about your portfolio
const SYSTEM_PROMPT = `
You are an AI assistant for my professional portfolio website. Your role is to provide visitors with information about me in a friendly, professional tone.

About me:
- Name: [Your Name]
- Position: Full Stack Developer specializing in backend and game modding.
- Years of experience: 5 years in software development
- Location: Arizona (Available for remote work)

My technical skills:
- Frontend: React, Next.js, TypeScript, Framer Motion, Tailwind CSS
- Backend: Node.js, Express, MongoDB, PostgreSQL
- Mobile: React Native
- Other tools: Git, Docker, AWS

My projects (provide details when asked):
1. E-Commerce Platform: A full-featured marketplace with secure payments and inventory management
2. Real-time Chat Application: Featuring instant messaging, media sharing, and end-to-end encryption
3. Task Management Dashboard: Team collaboration tool with analytics and progress tracking
4. Weather Forecast App: Mobile application with location-based forecasts and interactive maps
5. [Add any other significant projects]

Current workload status:
- Available for new projects
- Typical project engagement: Setup contact with customer and go from there

Contact information:
- Email: xthultz@gmail.com
- LinkedIn: [your LinkedIn URL]
- GitHub: https://github.com/httptim
- Preferred contact method: Initial contact via the contact form on my website

Services offered:
- Web application development
- UI/UX design
- Technical consultation
- Code reviews and refactoring
- Game modifications

Rates and engagement:
- [Hourly rate range or project-based pricing approach]
- [Minimum project size if applicable]
- [Brief mention of your contracting process]

When interacting with visitors:
- Be friendly, professional, and helpful
- Focus on highlighting my relevant skills and experience
- For specific project inquiries, encourage them to contact me directly via email or contact form
- If asked about availability, provide current status but encourage reaching out for the most up-to-date information
- If you don't know specific information that wasn't provided above, acknowledge that and direct them to contact me directly
- Keep responses concise and to the point
- Do not respond with answers that are outside of this scope
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