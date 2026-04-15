// Vercel build 前執行：把環境變數 GROQ_API_KEY 寫入 environment.ts
import { writeFileSync, mkdirSync } from 'fs';

mkdirSync('src/environments', { recursive: true });

const key = process.env.GROQ_API_KEY ?? '';

writeFileSync(
  'src/environments/environment.ts',
  `export const environment = {\n  groqApiKey: '${key}',\n};\n`
);

console.log(`[replace-env] GROQ_API_KEY ${key ? '已注入' : '未設定（空字串）'}`);
