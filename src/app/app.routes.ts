import { Routes } from '@angular/router';

export const routes: Routes = [
  // 根路徑直接載入景點列表（不跳轉 URL）
  {
    path: '',
    loadComponent: () =>
      import('./pages/attractions/attractions').then(m => m.Attractions),
  },

  // 網頁 1：景點列表（lazy load）
  {
    path: 'attractions',
    loadComponent: () =>
      import('./pages/attractions/attractions').then(m => m.Attractions),
  },

  // 網頁 2：我的最愛列表（lazy load）
  {
    path: 'favorites',
    loadComponent: () =>
      import('./pages/favorites/favorites').then(m => m.Favorites),
  },

  // 其餘路徑導回首頁
  { path: '**', redirectTo: 'attractions' },
];
