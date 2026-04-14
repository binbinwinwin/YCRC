import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({ providedIn: 'root' })
export class GroqService {
  private readonly apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly model = 'llama-3.1-8b-instant';

  private readonly systemPrompt = `你是「台北旅遊小幫手」，專門回答有關台北景點、美食、交通、文化活動的問題。
請用繁體中文回答，語氣親切活潑，回答盡量簡潔（200字以內）。
如果問題與台北旅遊無關，請友善地引導回台北旅遊相關話題。`;

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${environment.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages,
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();
    return data.choices[0].message.content as string;
  }
}
