import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FavoritesService } from './services/favorites.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = '台北旅遊景點';

  /** 注入 FavoritesService，讓 navbar 顯示我的最愛數量 */
  readonly favoritesService = inject(FavoritesService);
}
