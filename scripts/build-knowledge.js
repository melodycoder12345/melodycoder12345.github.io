import { writeFileSync } from 'node:fs';
import { join, loadKnowledge, ROOT } from './knowledge-lib.js';
import { generateKnowledgeData } from './knowledge-generator.js';

const knowledge = loadKnowledge();
writeFileSync(join(ROOT, 'knowledge-data.js'), generateKnowledgeData(knowledge));
const { nodes, relations } = knowledge;
console.log(`Generated knowledge-data.js (${nodes.length} nodes, ${relations.length} relations).`);
