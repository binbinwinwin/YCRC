import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Attraction, AttractionsResponse, Category } from '../models/attraction.model';

/**
 * AttractionService
 * 讀取 public/api/ 的本地 JSON（由 fetch-data.mjs 從 travel.taipei 抓取）
 * client-side 做分頁與分類篩選，不需要 proxy 或 CORS 設定
 */
@Injectable({ providedIn: 'root' })
export class AttractionService {
  private readonly http = inject(HttpClient);
  private readonly pageSize = 10;

  /**
   * 取得景點列表（client-side 分頁 + 分類篩選）
   * @param page        頁碼（從 1 開始）
   * @param categoryIds 分類 id 字串；空字串表示全部
   */
  getAttractions(page: number = 1, categoryIds: string = ''): Observable<AttractionsResponse> {
    return this.http.get<Attraction[]>('/api/attractions.json').pipe(
      map(all => {
        // 分類篩選（以逗號分隔支援多選，目前 UI 單選）
        const idSet = categoryIds ? new Set(categoryIds.split(',').map(s => s.trim())) : null;
        const filtered = idSet
          ? all.filter(a => a.category?.some(c => idSet.has(String(c.id))))
          : all;

        // 分頁
        const start = (page - 1) * this.pageSize;
        const data = filtered.slice(start, start + this.pageSize);

        return { total: filtered.length, data };
      })
    );
  }

  /** 取得景點分類清單 */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[] | any>('/api/categories.json').pipe(
      map((data: any) => Array.isArray(data) ? data : (data?.Category ?? data?.data ?? []))
    );
  }
}
