import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttractionService } from '../../services/attraction.service';
import { FavoritesService } from '../../services/favorites.service';
import { ToastService } from '../../services/toast.service';
import { AttractionModal } from '../../components/attraction-modal/attraction-modal';
import { Attraction, Category } from '../../models/attraction.model';

/**
 * 網頁 1：景點列表頁
 * 功能：API 分頁載入、分類篩選、勾選加入我的最愛
 */
@Component({
  selector: 'app-attractions',
  imports: [CommonModule, FormsModule, AttractionModal],
  templateUrl: './attractions.html',
  styleUrl: './attractions.scss',
})
export class Attractions implements OnInit {
  private readonly attractionService = inject(AttractionService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly toastService = inject(ToastService);

  /** 目前開啟詳情的景點 */
  selectedAttraction = signal<Attraction | null>(null);

  // ── 狀態 signals ──────────────────────────────────────

  /** 目前頁碼（從 1 開始） */
  currentPage = signal(1);

  /** API 回傳的景點總筆數 */
  total = signal(0);

  /** 目前頁的景點列表 */
  attractions = signal<Attraction[]>([]);

  /** 所有分類選項（用於下拉選單） */
  categories = signal<Category[]>([]);

  /** 目前選擇的分類 id，空字串 = 全部 */
  selectedCategoryId = signal('');

  /** 是否正在載入 API 資料 */
  loading = signal(false);

  /** API 錯誤訊息 */
  errorMsg = signal('');

  /** 目前勾選的景點 id set */
  checkedIds = signal<Set<number>>(new Set());

  // ── Computed ──────────────────────────────────────────

  /** 每頁 30 筆（API 固定），計算總頁數 */
  readonly pageSize = 10;
  totalPages = computed(() => Math.ceil(this.total() / this.pageSize) || 1);

  /** 是否全選（目前頁所有景點都勾選） */
  allChecked = computed(() => {
    const ids = this.checkedIds();
    return this.attractions().length > 0 && this.attractions().every(a => ids.has(a.id));
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadAttractions();
  }

  // ── 資料載入 ──────────────────────────────────────────

  /** 載入景點分類（下拉選單用） */
  loadCategories(): void {
    this.attractionService.getCategories().subscribe({
      next: (data: any) => {
        // API 可能直接回陣列，也可能包在 { data: [] } 裡
        const arr = Array.isArray(data) ? data : (data?.Category ?? data?.data ?? []);
        this.categories.set(arr);
      },
      error: () => {},  // 分類失敗不影響主流程
    });
  }

  /** 載入景點列表 */
  loadAttractions(): void {
    this.loading.set(true);
    this.errorMsg.set('');
    this.checkedIds.set(new Set()); // 換頁或換分類時清空勾選

    this.attractionService
      .getAttractions(this.currentPage(), this.selectedCategoryId())
      .subscribe({
        next: (res) => {
          this.attractions.set(res.data ?? []);
          this.total.set(res.total ?? 0);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[Attractions] error:', err);
          this.errorMsg.set('景點資料載入失敗，請稍後再試');
          this.loading.set(false);
        },
      });
  }

  // ── 分類篩選 ──────────────────────────────────────────

  /** 切換分類時回到第一頁並重新載入 */
  onCategoryChange(value: string): void {
    this.selectedCategoryId.set(value);
    this.currentPage.set(1);
    this.loadAttractions();
  }

  // ── 分頁 ──────────────────────────────────────────────

  goToPrevPage(): void {
    if (this.currentPage() <= 1) return;
    this.currentPage.update(p => p - 1);
    this.loadAttractions();
  }

  goToNextPage(): void {
    if (this.currentPage() >= this.totalPages()) return;
    this.currentPage.update(p => p + 1);
    this.loadAttractions();
  }

  goToPage(value: string): void {
    const page = parseInt(value, 10);
    if (isNaN(page) || page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadAttractions();
  }

  // ── 勾選 ──────────────────────────────────────────────

  /** 切換單筆勾選 */
  toggleCheck(id: number): void {
    const ids = new Set(this.checkedIds());
    ids.has(id) ? ids.delete(id) : ids.add(id);
    this.checkedIds.set(ids);
  }

  /** 全選 / 取消全選（目前頁） */
  toggleAll(): void {
    if (this.allChecked()) {
      this.checkedIds.set(new Set());
    } else {
      this.checkedIds.set(new Set(this.attractions().map(a => a.id)));
    }
  }

  // ── 我的最愛 ──────────────────────────────────────────

  /** 判斷某景點是否已在我的最愛 */
  isFavorite(id: number): boolean {
    return this.favoritesService.isFavorite(id);
  }

  /** 開啟景點詳情 Modal */
  openDetail(attraction: Attraction): void {
    this.selectedAttraction.set(attraction);
  }

  /** 關閉景點詳情 Modal */
  closeDetail(): void {
    this.selectedAttraction.set(null);
  }

  /** 從 Modal 加入單筆我的最愛 */
  addFromModal(attraction: Attraction): void {
    this.favoritesService.addFavorites([attraction]);
    this.toastService.show(`「${attraction.name}」已加入我的最愛`);
  }

  /** 將勾選的景點加入我的最愛 */
  addCheckedToFavorites(): void {
    const checked = this.attractions().filter(a => this.checkedIds().has(a.id));
    if (checked.length === 0) return;
    this.favoritesService.addFavorites(checked);
    this.toastService.show(`已加入 ${checked.length} 筆景點到我的最愛`);
    this.checkedIds.set(new Set());
  }

  /** 取得景點第一張圖片網址 */
  getImageSrc(attraction: Attraction): string {
    const img = attraction.images?.[0] as any;
    return img?.src ?? img?.['<Src>k__BackingField'] ?? '';
  }

  /** 截斷文字，超過 max 字元加上省略號 */
  truncate(text: string, max = 80): string {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '...' : text;
  }
}
