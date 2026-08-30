import { readFileSync } from 'node:fs';
import { join, ROOT } from './knowledge-lib.js';
import { generateKnowledgeData } from './knowledge-generator.js';

const target = join(ROOT, 'knowledge-data.js');
const actual = readFileSync(target, 'utf8');
const expected = generateKnowledgeData();

if (actual !== expected) {
  console.error('knowledge-data.js 与 knowledge/ 结构化数据不一致。');
  console.error('请运行 npm run knowledge:build，并提交更新后的生成文件。');
  process.exitCode = 1;
} else {
  console.log('knowledge-data.js is up to date.');
}
