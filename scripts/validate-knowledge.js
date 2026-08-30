import { loadKnowledge, detailHtmlFiles, existsSync, join, NODE_ENUMS, RELATION_TYPES, ROOT } from './knowledge-lib.js';

const { modules, nodes, relations, relationCandidates } = loadKnowledge();
const errors = [];
const warnings = [];
const coverageNotes = [];
const nodeIds = new Set();
const pageHrefs = new Set();
const degree = new Map();
// 交互式模块聚合页负责导航多个知识节点，本身不是一个可建立语义关系的知识点。
const nonNodeHtml = new Set(['cs/topic.html', 'golang/topic.html']);

for (const node of nodes) {
  if (!node || typeof node !== 'object') { errors.push('节点必须是对象'); continue; }
  if (!node.id) errors.push('节点缺少 id');
  else if (nodeIds.has(node.id)) errors.push(`重复节点 id: ${node.id}`);
  else nodeIds.add(node.id);
  degree.set(node.id, 0);
  for (const field of ['label', 'module', 'type', 'href', 'desc']) {
    if (typeof node[field] !== 'string' || !node[field].trim()) errors.push(`${node.id || '<unknown>'} 缺少 ${field}`);
  }
  if (!modules[node.module]) errors.push(`${node.id} 引用了不存在的模块 ${node.module}`);
  if (!NODE_ENUMS.type.includes(node.type)) errors.push(`${node.id} 的 type 非法: ${node.type}`);
  if (node.href && !existsSync(join(ROOT, node.href))) errors.push(`${node.id} 页面不存在: ${node.href}`);
  if (node.type !== 'page') continue;
  pageHrefs.add(node.href);
  if (node.embeddedDemos !== undefined) {
    if (!Array.isArray(node.embeddedDemos) || !node.embeddedDemos.length) {
      errors.push(`${node.id} 的 embeddedDemos 必须是非空数组`);
    } else {
      for (const href of node.embeddedDemos) {
        if (typeof href !== 'string' || !href.endsWith('.html')) {
          errors.push(`${node.id} 的 embedded demo 非法: ${href}`);
          continue;
        }
        if (!existsSync(join(ROOT, href))) errors.push(`${node.id} 的 embedded demo 不存在: ${href}`);
        pageHrefs.add(href);
      }
    }
  }
  for (const field of ['kind', 'level', 'interaction']) {
    if (!NODE_ENUMS[field].includes(node[field])) errors.push(`${node.id} 的 ${field} 非法: ${node[field]}`);
  }
  if (!Array.isArray(node.presentations) || !node.presentations.length) errors.push(`${node.id} 缺少 presentations`);
  else for (const value of node.presentations) {
    if (!NODE_ENUMS.presentation.includes(value)) errors.push(`${node.id} 的 presentation 非法: ${value}`);
  }
  if (!node.learning || typeof node.learning.objective !== 'string' || !node.learning.objective.trim()) {
    errors.push(`${node.id} 缺少 learning.objective`);
  }
}

const nodesById = new Map(nodes.map(node => [node.id, node]));
const relationIds = new Set();
const relationPairs = new Set();
for (const relation of relations) validateRelation(relation, 'official');
for (const relation of relationCandidates) validateRelation(relation, 'candidate');

function validateRelation(relation, collection) {
  if (!relation.id) errors.push(`关系缺少 id: ${relation.source} -> ${relation.target}`);
  else if (relationIds.has(relation.id)) errors.push(`重复关系 id: ${relation.id}`);
  else relationIds.add(relation.id);
  if (!nodeIds.has(relation.source)) errors.push(`${relation.id} source 不存在: ${relation.source}`);
  if (!nodeIds.has(relation.target)) errors.push(`${relation.id} target 不存在: ${relation.target}`);
  if (relation.source === relation.target) errors.push(`${relation.id} 不允许自环`);
  if (!RELATION_TYPES[relation.type]) errors.push(`${relation.id} 关系类型非法: ${relation.type}`);
  if (typeof relation.summary !== 'string' || !relation.summary.trim()) errors.push(`${relation.id} 缺少 summary`);
  const expectedStatus = collection === 'official' ? 'reviewed' : 'generated';
  if (relation.status !== expectedStatus) errors.push(`${relation.id} 位于 ${collection} 集合但状态为 ${relation.status}`);
  if (nodesById.get(relation.source)?.type === 'module' || nodesById.get(relation.target)?.type === 'module') {
    errors.push(`${relation.id} 把分类模块当成了语义关系端点`);
  }
  if (relation.type === 'analogy' && relation.status === 'reviewed' && !relation.details?.boundary) {
    errors.push(`${relation.id} 是已审核类比关系，但缺少 details.boundary`);
  }
  const type = RELATION_TYPES[relation.type];
  const pair = type?.directed
    ? `${relation.type}:${relation.source}->${relation.target}`
    : `${relation.type}:${[relation.source, relation.target].sort().join('<->')}`;
  if (relationPairs.has(pair)) errors.push(`正式关系与候选中存在重复语义关系: ${pair}`);
  relationPairs.add(pair);
  if (collection === 'official') {
    if (degree.has(relation.source)) degree.set(relation.source, degree.get(relation.source) + 1);
    if (degree.has(relation.target)) degree.set(relation.target, degree.get(relation.target) + 1);
  }
}

const isolated = [];
const lowDegree = [];
const highDegree = [];
const pageNodes = nodes.filter(item => item.type === 'page');
for (const node of pageNodes) {
  const count = degree.get(node.id) || 0;
  if (count === 0) isolated.push(node.id);
  else if (count < 3) lowDegree.push(`${node.id}(${count})`);
  else if (count > 7) highDegree.push(`${node.id}(${count})`);
}
// Relation degree is a coverage signal, not a correctness constraint. A sparse
// graph is intentional: module membership is classification rather than a
// semantic edge, and some pages legitimately have no reviewed cross-topic
// relation yet. Keep the backlog visible without making validation unhealthy.
const connectedCount = pageNodes.length - isolated.length;
const coveragePercent = pageNodes.length ? (connectedCount / pageNodes.length * 100).toFixed(1) : '100.0';
coverageNotes.push(`关系覆盖 ${connectedCount}/${pageNodes.length} (${coveragePercent}%): 待补 ${isolated.length}，1～2 条 ${lowDegree.length}，枢纽节点(>7) ${highDegree.length}`);
if (isolated.length) coverageNotes.push(`待补正式关系 ${isolated.length} 个: ${isolated.join(', ')}`);
if (process.argv.includes('--verbose-coverage')) {
  if (lowDegree.length) coverageNotes.push(`1～2 条正式关系 ${lowDegree.length} 个: ${lowDegree.join(', ')}`);
  if (highDegree.length) coverageNotes.push(`关系枢纽 ${highDegree.length} 个: ${highDegree.join(', ')}`);
}

for (const href of detailHtmlFiles()) {
  if (!pageHrefs.has(href) && !nonNodeHtml.has(href)) warnings.push(`HTML 未登记为知识节点: ${href}`);
}

for (const cycle of prerequisiteCycles(relations, nodeIds)) errors.push(`前置依赖循环: ${cycle.join(' -> ')}`);

if (relationCandidates.length) warnings.push(`待审核候选关系 ${relationCandidates.length} 条，不会进入正式图谱`);

for (const warning of warnings) console.warn(`WARN  ${warning}`);
for (const note of coverageNotes) console.log(`INFO  ${note}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Knowledge validation: ${nodes.length} nodes, ${relations.length} official relations, ${relationCandidates.length} candidates, ${errors.length} errors, ${warnings.length} warnings.`);
if (errors.length) process.exitCode = 1;

function prerequisiteCycles(items, ids) {
  const graph = new Map([...ids].map(id => [id, []]));
  for (const item of items) if (item.type === 'prerequisite') graph.get(item.source)?.push(item.target);
  const state = new Map();
  const stack = [];
  const found = new Map();
  function visit(id) {
    state.set(id, 1); stack.push(id);
    for (const next of graph.get(id) || []) {
      if (!state.get(next)) visit(next);
      else if (state.get(next) === 1) {
        const cycle = stack.slice(stack.indexOf(next)).concat(next);
        const key = [...new Set(cycle.slice(0, -1))].sort().join('|');
        found.set(key, cycle);
      }
    }
    stack.pop(); state.set(id, 2);
  }
  for (const id of ids) if (!state.get(id)) visit(id);
  return [...found.values()];
}
