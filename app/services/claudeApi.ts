// app/services/claudeApi.ts

export interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: string;
  }
  
  export interface ClaudeRequest {
    model: string;
    max_tokens: number;
    messages: ClaudeMessage[];
    system?: string;
  }
  
  export interface ClaudeResponse {
    id: string;
    type: string;
    role: string;
    content: Array<{
      type: string;
      text: string;
    }>;
    model: string;
    stop_reason: string;
    stop_sequence: string | null;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  }
  
  /**
   * Sends a message to the Claude API
   */
  export const sendMessageToClaude = async (
    apiKey: string,
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): Promise<string> => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 1000,
          messages: messages,
          system: systemPrompt || "You are a helpful AI assistant for a portfolio website. Answer questions about the portfolio owner's skills, projects, and experience. Be professional, friendly, and concise."
        } as ClaudeRequest),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error communicating with Claude API');
      }
  
      const data: ClaudeResponse = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error in Claude API call:', error);
      throw error;
    }
  };