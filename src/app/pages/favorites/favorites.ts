import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FavoritesService } from '../../services/favorites.service';
import { ToastService } from '../../services/toast.service';
import { FavoriteAttraction } from '../../models/attraction.model';

/**
 * 網頁 2：我的最愛列表頁
 * 功能：分頁顯示、勾選移除、單筆編輯（含表單驗證）
 */
@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class Favorites {
  private readonly favoritesService = inject(FavoritesService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  // ── 分頁設定 ──────────────────────────────────────────

  readonly pageSize = 10; // 我的最愛每頁 10 筆
  currentPage = signal(1);

  /** 目前頁的資料（從 service signal 切片） */
  pagedFavorites = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.favoritesService.favorites().slice(start, start + this.pageSize);
  });

  totalPages = computed(() =>
    Math.ceil(this.favoritesService.count() / this.pageSize) || 1
  );

  // ── 勾選狀態 ──────────────────────────────────────────

  checkedIds = signal<Set<number>>(new Set());

  allChecked = computed(() => {
    const ids = this.checkedIds();
    return this.pagedFavorites().length > 0 &&
      this.pagedFavorites().every(f => ids.has(f.id));
  });

  toggleCheck(id: number): void {
    const ids = new Set(this.checkedIds());
    ids.has(id) ? ids.delete(id) : ids.add(id);
    this.checkedIds.set(ids);
  }

  toggleAll(): void {
    if (this.allChecked()) {
      this.checkedIds.set(new Set());
    } else {
      this.checkedIds.set(new Set(this.pagedFavorites().map(f => f.id)));
    }
  }

  // ── 移除 ──────────────────────────────────────────────

  /** 移除勾選的項目，並重置勾選狀態 */
  removeChecked(): void {
    const count = this.checkedIds().size;
    const ids = [...this.checkedIds()];
    this.favoritesService.removeFavorites(ids);
    this.checkedIds.set(new Set());
    this.toastService.show(`已移除 ${count} 筆景點`, 'info');

    // 若移除後目前頁超出範圍，退回上一頁
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  // ── 編輯（Modal） ─────────────────────────────────────

  /** 目前正在編輯的景點（null = 未開啟 modal） */
  editingItem = signal<FavoriteAttraction | null>(null);

  /**
   * 編輯表單（ReactiveForm）
   * 驗證規則：
   * - name：必填
   * - tel：只允許數字、+、-、( )，不可輸入中文
   */
  editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    tel: ['', [Validators.pattern(/^[0-9+()\-\s]*$/)]],
    address: [''],
    open_time: [''],
    introduction: [''],
  });

  /** 開啟編輯 Modal，填入目前資料 */
  openEdit(item: FavoriteAttraction): void {
    this.editingItem.set(item);
    this.editForm.setValue({
      name: item.name ?? '',
      tel: item.tel ?? '',
      address: item.address ?? '',
      open_time: item.open_time ?? '',
      introduction: item.introduction ?? '',
    });
  }

  /** 關閉 Modal */
  closeEdit(): void {
    this.editingItem.set(null);
    this.editForm.reset();
  }

  /** 送出編輯（驗證通過才儲存） */
  submitEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const item = this.editingItem()!;
    this.favoritesService.updateFavorite(item.id, this.editForm.value);
    this.toastService.show(`「${item.name}」已儲存`);
    this.closeEdit();
  }

  // ── 分頁 ──────────────────────────────────────────────

  goToPrevPage(): void {
    if (this.currentPage() <= 1) return;
    this.currentPage.update(p => p - 1);
    this.checkedIds.set(new Set());
  }

  goToNextPage(): void {
    if (this.currentPage() >= this.totalPages()) return;
    this.currentPage.update(p => p + 1);
    this.checkedIds.set(new Set());
  }

  goToPage(value: string): void {
    const page = parseInt(value, 10);
    if (isNaN(page) || page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.checkedIds.set(new Set());
  }

  // ── 工具 ──────────────────────────────────────────────

  /** 取得景點第一張圖片網址 */
  getImageSrc(item: FavoriteAttraction): string {
    const img = item.images?.[0] as any;
    return img?.src ?? img?.['<Src>k__BackingField'] ?? '';
  }

  /** 存取 service 的 favorites signal（template 用） */
  get totalCount() {
    return this.favoritesService.count();
  }
}
