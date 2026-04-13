/**
 * Vite proxy 設定（Angular 21 / Vite 格式）
 * 使用 configure + proxy.on('proxyReq') 修改送出的 request headers
 */
module.exports = {
  '/open-api': {
    target: 'https://www.travel.taipei',
    secure: false,
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
        proxyReq.setHeader('Accept', 'application/json');
        // Chrome 143 完整指紋（需與 cf_clearance 簽發的版本一致）
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36');
        proxyReq.setHeader('sec-ch-ua', '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"');
        proxyReq.setHeader('sec-ch-ua-mobile', '?0');
        proxyReq.setHeader('sec-ch-ua-platform', '"Windows"');
        // Cloudflare cf_clearance cookie（過期需重新取得）
        proxyReq.setHeader('Cookie', 'cf_clearance=pDVavnSxja9XNDUiPos72hDMTXsz_1t9..KpoD18BS4-1776090196-1.2.1.1-4iVHMXu97W4943dwghUEi1VI9YND.etd_dUw_dQ2ALpxh3cKmzgloPtGCyYqTEvR6xcEAcCBuGybAAAZ29bJddlORnhv9T4aQUYDm49sOJpCs5zruo2y1AlXuXWvqwH6tjb7EVXnzpx10SgPMDT4ur2nYrxUVeRfK0dUMRl6axepTsQB.6R1QJS9wof7gRBGlw8JSTH6Kh81UdhvHwNjTeTBpckJuHWob9TfRnjd5gZ720mY2cIuF.m27rXDfD0e.YNL9kLU9Ve6A9stTjvfU5xiYuQCNbvHClWqs4NMtmkGOgqiQbenHCJ_ifS3VfQ.DGJ3HpxwNRPpnY58JUub4g');
        console.log('[Proxy] →', proxyReq.method, proxyReq.path);
      });
    },
  },
};
