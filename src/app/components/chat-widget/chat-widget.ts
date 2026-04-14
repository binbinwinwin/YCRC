import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroqService, ChatMessage } from '../../services/groq.service';

@Component({
  selector: 'app-chat-widget',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
})
export class ChatWidget implements AfterViewChecked {
  private readonly groq = inject(GroqService);

  @ViewChild('messageList') private messageList!: ElementRef<HTMLElement>;

  /** 聊天視窗開關 */
  isOpen = signal(false);

  /** 訊息歷史（顯示用，不含 system prompt） */
  messages = signal<ChatMessage[]>([]);

  /** 輸入框內容 */
  inputText = '';

  /** 等待 AI 回應中 */
  loading = signal(false);

  /** 錯誤訊息 */
  errorMsg = signal('');

  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleOpen(): void {
    this.isOpen.update(v => !v);
  }

  async sendMessage(): Promise<void> {
    const text = this.inputText.trim();
    if (!text || this.loading()) return;

    // 加入使用者訊息
    this.messages.update(m => [...m, { role: 'user', content: text }]);
    this.inputText = '';
    this.loading.set(true);
    this.errorMsg.set('');
    this.shouldScroll = true;

    try {
      const reply = await this.groq.sendMessage(this.messages());
      this.messages.update(m => [...m, { role: 'assistant', content: reply }]);
    } catch {
      this.errorMsg.set('發生錯誤，請稍後再試');
    } finally {
      this.loading.set(false);
      this.shouldScroll = true;
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.messages.set([]);
    this.errorMsg.set('');
  }

  private scrollToBottom(): void {
    const el = this.messageList?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
