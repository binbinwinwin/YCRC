/**
 * 台北旅遊網 Open API - 資料模型定義
 * API 文件：https://www.travel.taipei/open-api/swagger/docs/V1
 */

/** 分類（用於 category、target、service、friendly 欄位） */
export interface Category {
  id: number;
  name: string;
}

/** 圖片（API 回傳的欄位名稱為 C# BackingField 格式） */
export interface AttractionImage {
  '<Src>k__BackingField': string;
  '<Subject>k__BackingField': string;
  '<Ext>k__BackingField': string;
}

/** 景點資料完整結構（對應 API Attraction definition） */
export interface Attraction {
  id: number;
  name: string;
  name_zh: string;
  open_status: number;
  introduction: string;
  open_time: string;
  zipcode: string;
  distric: string;       // 行政區（API 原文拼法）
  address: string;
  tel: string;
  fax: string;
  email: string;
  months: string;
  nlat: number;          // 北緯
  elong: number;         // 東經
  official_site: string;
  facebook: string;
  ticket: string;        // 門票資訊
  remind: string;        // 旅遊叮嚀
  staytime: string;      // 建議停留時間
  modified: string;
  url: string;
  category: Category[];
  target: Category[];
  service: Category[];
  friendly: Category[];
  images: AttractionImage[];
}

/** API 景點列表回傳結構 */
export interface AttractionsResponse {
  total: number;
  data: Attraction[];
}

/** localStorage 儲存的我的最愛項目（允許使用者編輯部分欄位） */
export interface FavoriteAttraction extends Attraction {
  /** 加入我的最愛的時間戳記 */
  addedAt: number;
}
