import { Component, inject, signal, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FavoritesService } from './services/favorites.service';
import { ChatWidget } from './components/chat-widget/chat-widget';
import { ToastContainer } from './components/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ChatWidget, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = '台北旅遊景點';
  readonly favoritesService = inject(FavoritesService);

  /** 手機版漢堡選單 */
  menuOpen = signal(false);

  /** 深色模式 */
  isDark = signal(false);

  constructor() {
    // 讀取已儲存主題或系統偏好（index.html 已提前設定 attribute，這裡同步 signal）
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDark.set(saved ? saved === 'dark' : prefersDark);

    // signal 變化時同步更新 <html> attribute 並儲存
    effect(() => {
      const dark = this.isDark();
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
