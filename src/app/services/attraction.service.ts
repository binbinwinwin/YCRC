import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attraction, AttractionsResponse, Category } from '../models/attraction.model';

/**
 * AttractionService
 * 負責呼叫台北旅遊網 Open API 取得景點與分類資料。
 * API 文件：https://www.travel.taipei/open-api/swagger/docs/V1
 */
@Injectable({ providedIn: 'root' })
export class AttractionService {
  private readonly http = inject(HttpClient);

  /**
   * API base URL
   * 開發時走 proxy.conf.json（/open-api → https://www.travel.taipei/open-api）避免 CORS
   */
  private readonly baseUrl = '/open-api';

  /** 預設語系：正體中文 */
  private readonly lang = 'zh-tw';

  /**
   * 取得景點列表
   * @param page      頁碼（從 1 開始，每頁 30 筆）
   * @param categoryIds 分類編號，多個以逗號分隔，例如 '12,34'；空字串表示全部
   */
  getAttractions(page: number = 1, categoryIds: string = ''): Observable<AttractionsResponse> {
    let params = new HttpParams().set('page', page);

    // 有傳分類才加入參數，避免 API 收到空字串產生非預期結果
    if (categoryIds) {
      params = params.set('categoryIds', categoryIds);
    }

    return this.http.get<AttractionsResponse>(
      `${this.baseUrl}/${this.lang}/Attractions/All`,
      { params }
    );
  }

  /**
   * 取得景點分類清單（用於下拉選單篩選）
   * type 固定傳 'Attractions'，只取景點相關分類
   */
  getCategories(): Observable<Category[]> {
    const params = new HttpParams().set('type', 'Attractions');

    return this.http.get<Category[]>(
      `${this.baseUrl}/${this.lang}/Miscellaneous/Categories`,
      { params }
    );
  }
}
