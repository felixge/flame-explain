import {FlameKey, FlameFragment} from './FlameExplain';
import {postgresVersion, nodeTypes} from './RawExplain';

const flameExplainKeys: {[K in keyof FlameFragment]: boolean} = {
  "CTE Node": true,
  "CTE Scans": true,
  "Children": true,
  "Depth": true,
  "Filter Nodes": true,
  "Filter Refs": true,
  "ID": true,
  "Kind": true,
  "Label": true,
  "Parent": true,
  "Rows X": true,
  "Self Time": true,
  "Self Time %": true,
  "Total Time %": true,
  "Total Time": true,
  "Warnings": true,
  "Total Blocks": true,
  "Self Blocks": true,
};


export const blockKeys: FlameKey[] = [
  'Shared Hit Blocks',
  'Shared Read Blocks',
  'Shared Dirtied Blocks',
  'Shared Written Blocks',
  'Local Hit Blocks',
  'Local Read Blocks',
  'Local Dirtied Blocks',
  'Local Written Blocks',
  'Temp Read Blocks',
  'Temp Written Blocks',
  'Total Blocks',
  'Self Blocks',
];

export const categories = [
  "Node",
  "Rows",
  "Timing",
  "I/O",
  "Misc"
] as const;

export type Category = (typeof categories)[number];

export const categoryKeys: {[K in Exclude<Category, 'Misc'>]: FlameKey[]} = {
  "Node": [
    "Node Type",
    "Schema",
    "Relation Name",
    "Index Name",
    "Alias",
    "Join Type",
    "Output",

  ],
  "Rows": [
    "Actual Loops",
    "Plan Rows",
    "Actual Rows",
    "Join Filter",
    "Filter",
    "Index Cond",
    "Hash Cond",
    "One-Time Filter",
    "Rows X",
    "Rows Removed by Filter",
    "Rows Removed by Join Filter",
    "Rows Removed by Index Recheck",
  ],
  "Timing": [
    "Planning Time",
    "Execution Time",
    "Actual Total Time",
    "Actual Startup Time",
    "Self Time",
    "Self Time %",
    "Total Time",
    "Total Time %",
    "I/O Read Time",
    "I/O Write Time",
  ],
  "I/O": [
    "Shared Hit Blocks",
    "Shared Read Blocks",
    "Shared Dirtied Blocks",
    "Shared Written Blocks",
    "Local Hit Blocks",
    "Local Read Blocks",
    "Local Dirtied Blocks",
    "Local Written Blocks",
    "Temp Read Blocks",
    "Temp Written Blocks",
    "Total Blocks",
    "Self Blocks",
  ],
};

//const categories: {[K: string]: {[]}} = {
//'Time': [],
//};

type FlameKeyMeta = {
  Source: 'PostgreSQL' | 'FlameExplain',
  Category: Category,
};

export const flameKeyMeta = (() => {
  const meta: {[K in FlameKey]?: FlameKeyMeta} = {};
  Object
    .keys(flameExplainKeys)
    .map(key => key as keyof typeof flameExplainKeys)
    .forEach(key => {
      let category: Category = 'Misc';
      let c: keyof typeof categoryKeys;
      for (c in categoryKeys) {
        if (categoryKeys[c].includes(key)) {
          category = c;
          break;
        }
      }

      meta[key] = {
        Source: flameExplainKeys[key] ? 'FlameExplain' : 'PostgreSQL',
        Category: category,
      };
    });
  return meta;
})()

//const hiddenKeys: { [K in FlameKey]?: boolean } = {
//"CTE Node": true,
//"CTE Scans": true,
//"Children": true,
//"Filter Nodes": true,
//"Filter Refs": true,
//"Parent": true,
//};

export type FlameKeyDesc = {
  FlameExplainKey?: boolean,
  Source?: 'PostgreSQL' | 'FlameExplain';
  Unit?: 'millisecond' | 'row' | 'percent';
  Description?: string;
};

export const flameKeyDescs: {[K in FlameKey]?: FlameKeyDesc} = {
  'ID': {
    Source: 'FlameExplain',
    Description: `
A unique sequential identifier that FlameExplain assigns to all nodes in the
query, including virtual nodes created by FlameExplain itself. It has no deeper
meaning and is primarely useful to refer to FlameExplain output in
discussions.`,
  },

  'Label': {
    Source: 'FlameExplain',
    Description: `
A short human readable label derrived from various PostgreSQL fields such as
\`Node Type\`, \`Relation Name\`, \`Alias\` etc. It attempts to be identical
to the node labels produced by \`EXPLAIN (ANALYZE, FORMAT TEXT)\`.`,
  },

  'Node Type': {
    Source: 'PostgreSQL',
    Description: `
The type of the PostgreSQL query plan node. As of version ${postgresVersion}, PostgreSQL
currently implements ${nodeTypes.length} different node types: ${nodeTypes.map(t => '`' + t + '`').join(', ')}.
`,
  },

  'Plan Rows': {
    Source: 'PostgreSQL',
    Unit: 'row',
    Description: `
The number of rows the query planner expected this node to produce. This value
is a key input into how the query planner picks a query plan, and a big
mismatch mismatch with \`Actual Rows\` will often result in sub-optimal plan.
Figuring out the root cause (e.g. stale statistics) and fixing it (e.g. by
running VACUUM) can often produce great performance improvements.`,
  },

  'Actual Rows': {
    Source: 'PostgreSQL',
    Unit: 'row',
    Description: `
The actual number of rows the executor produced for this node. See
\`Plan Rows\` for more information.`,
  },

  'Actual Total Time': {
    Source: 'PostgreSQL',
    Unit: 'millisecond',
    Description: `
The total amount of time PostgreSQL spent on executing this node. For looped
nodes, this is value is the average time per loop. When InitPlans or parallel
queries are involved the sum of the node's children \`Actual Total Time\` might
exceed the parents node \`Actual Total Time\`.`,
  },

  'Actual Startup Time': {
    Source: 'PostgreSQL',
    Unit: 'millisecond',
    Description: `
The amount of time it took PostgreSQL to produce the first row for this node. For looped
nodes, this is value is the average startup time per loop.`,
  },

  'Total Time': {
    Source: 'FlameExplain',
    Unit: 'millisecond',
    Description: `
In simple cases, this is identical to \`Actual Startup Time\`, but the
value is adjusted for loops, parallel queries, filters and CTEs so that it
represents the wall clock time exclusively attributable to this node and its
children. There should be no cases where the sum of a node's children
\`Total Time\` exceeds the parent node's \`Total Time\`. If you find such a
case, please report it as a bug.`,
  },

  'Self Time': {
    Source: 'FlameExplain',
    Unit: 'millisecond',
    Description: `
The wall clock time spent on executing this node, while excluding the time
spent on child nodes. Thanks to FlameExplain's advanced adjustments, this value
should never be negative. See \`Total Time\`.`,
  },

  'Self Time %': {
    Source: 'FlameExplain',
    Unit: 'percent',
    Description: `
The \`Self Time\` of this node divided by the largest \`Self Time\` of the root node.`,
  },

  'Total Time %': {
    Source: 'FlameExplain',
    Unit: 'percent',
    Description: `
The \`Total Time\` of this node divided by the \`Total Time\` of the root node.`,
  },
}
