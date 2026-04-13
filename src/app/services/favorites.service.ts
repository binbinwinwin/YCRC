import { Injectable, signal, computed } from '@angular/core';
import { Attraction, FavoriteAttraction } from '../models/attraction.model';

/**
 * FavoritesService
 * 管理「我的最愛」資料，使用 localStorage 儲存，頁面重整後仍保留。
 * 使用 Angular Signals 讓元件可以響應式追蹤資料變化。
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  /** localStorage 的 key */
  private readonly STORAGE_KEY = 'taipei-travel-favorites';

  /**
   * 內部 signal，儲存我的最愛清單。
   * 初始化時從 localStorage 讀取，確保重整後資料保留。
   */
  private readonly _favorites = signal<FavoriteAttraction[]>(this.loadFromStorage());

  /** 對外公開的唯讀 signal（元件用這個讀資料） */
  readonly favorites = this._favorites.asReadonly();

  /** 我的最愛總筆數（computed signal，自動跟著 _favorites 更新） */
  readonly count = computed(() => this._favorites().length);

  /**
   * 判斷某景點是否已在我的最愛中
   * @param id 景點 id
   */
  isFavorite(id: number): boolean {
    return this._favorites().some(f => f.id === id);
  }

  /**
   * 加入我的最愛（單筆或多筆）
   * 已存在的景點不會重複加入
   */
  addFavorites(attractions: Attraction[]): void {
    const current = this._favorites();
    const newItems: FavoriteAttraction[] = attractions
      .filter(a => !current.some(f => f.id === a.id))  // 過濾已存在的
      .map(a => ({ ...a, addedAt: Date.now() }));       // 加上加入時間

    if (newItems.length === 0) return;

    const updated = [...current, ...newItems];
    this._favorites.set(updated);
    this.saveToStorage(updated);
  }

  /**
   * 從我的最愛移除（單筆或多筆）
   * @param ids 要移除的景點 id 陣列
   */
  removeFavorites(ids: number[]): void {
    const updated = this._favorites().filter(f => !ids.includes(f.id));
    this._favorites.set(updated);
    this.saveToStorage(updated);
  }

  /**
   * 編輯單筆我的最愛資料（更新 client 端，不影響 API）
   * @param id      要編輯的景點 id
   * @param changes 要更新的欄位（Partial 允許只傳部分欄位）
   */
  updateFavorite(id: number, changes: Partial<FavoriteAttraction>): void {
    const updated = this._favorites().map(f =>
      f.id === id ? { ...f, ...changes } : f
    );
    this._favorites.set(updated);
    this.saveToStorage(updated);
  }

  // ── 私有方法 ──────────────────────────────────────────

  /** 從 localStorage 讀取資料，讀取失敗時回傳空陣列 */
  private loadFromStorage(): FavoriteAttraction[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      // JSON 解析失敗時（資料損毀）回傳空陣列
      return [];
    }
  }

  /** 將資料存入 localStorage */
  private saveToStorage(data: FavoriteAttraction[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
}
