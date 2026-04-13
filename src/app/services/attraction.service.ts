import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Attraction, AttractionsResponse, Category } from '../models/attraction.model';

/**
 * AttractionService
 * 資料來源：/mock-attractions.json（本地 mock 資料）
 *
 * 注意：台北旅遊網 API（https://www.travel.taipei/open-api）
 * 已啟用 Cloudflare Bot Protection，所有非真實瀏覽器請求（包含 Node.js proxy、curl）
 * 均被攔截回傳 403。Mock 資料格式與真實 API 完全一致，切換時只需
 * 將 getAttractions / getCategories 改回呼叫 this.http.get(realApiUrl) 即可。
 */
@Injectable({ providedIn: 'root' })
export class AttractionService {
  private readonly http = inject(HttpClient);

  /** 每頁筆數（與真實 API 一致） */
  private readonly PAGE_SIZE = 30;

  /**
   * 取得景點列表（從 mock JSON，模擬分頁與分類篩選）
   * @param page        頁碼（從 1 開始）
   * @param categoryIds 分類 id，空字串表示全部
   */
  getAttractions(page: number = 1, categoryIds: string = ''): Observable<AttractionsResponse> {
    return this.http.get<AttractionsResponse>('/mock-attractions.json').pipe(
      map(res => {
        let data = res.data;

        // 模擬分類篩選
        if (categoryIds) {
          const ids = categoryIds.split(',').map(Number);
          data = data.filter(a =>
            a.category.some(c => ids.includes(c.id))
          );
        }

        const total = data.length;

        // 模擬分頁
        const start = (page - 1) * this.PAGE_SIZE;
        const paged = data.slice(start, start + this.PAGE_SIZE);

        return { total, data: paged };
      })
    );
  }

  /**
   * 取得景點分類清單（從 mock 資料中提取不重複的分類）
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<AttractionsResponse>('/mock-attractions.json').pipe(
      map(res => {
        const categoryMap = new Map<number, string>();
        res.data.forEach(a =>
          a.category.forEach(c => categoryMap.set(c.id, c.name))
        );
        return Array.from(categoryMap, ([id, name]) => ({ id, name }));
      })
    );
  }
}
