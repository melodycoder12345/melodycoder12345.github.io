// Semantic-relation query helpers. Rendering is handled by page-framework.js.
(function (global) {
  'use strict';

  if (global.KnowledgeRelations) return;

  function forNode(id) {
    var nodes = Object.fromEntries((global.GRAPH_NODES || []).map(function (node) { return [node.id, node]; }));
    return (global.KNOWLEDGE_RELATIONS || []).filter(function (relation) {
      return relation.source === id || relation.target === id;
    }).map(function (relation) {
      var outgoing = relation.source === id;
      return {
        relation: relation,
        node: nodes[outgoing ? relation.target : relation.source] || null,
        outgoing: outgoing
      };
    }).filter(function (item) { return item.node && item.node.type === 'page'; })
      .sort(function (a, b) { return b.relation.strength - a.relation.strength; });
  }

  function group(id) {
    var result = { before: [], related: [], next: [] };
    forNode(id).forEach(function (item) {
      var relation = item.relation;
      if (relation.type === 'prerequisite') {
        (item.outgoing ? result.next : result.before).push(item);
      } else if (relation.type === 'causal' && item.outgoing) {
        result.next.push(item);
      } else {
        result.related.push(item);
      }
    });
    return result;
  }

  global.KnowledgeRelations = Object.freeze({ forNode: forNode, group: group });
})(window);
