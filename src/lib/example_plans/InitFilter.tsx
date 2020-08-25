import { ExamplePlan } from './';

const Sample: ExamplePlan = {
  sql: `
/** A simple plan */
EXPLAIN (ANALYZE, FORMAT JSON)
SELECT *
FROM generate_series(1, 10) g
WHERE g > (SELECT 1);
`,
  queries: [
    {
      'Plan': {
        'Node Type': 'Function Scan',
        'Parallel Aware': false,
        'Function Name': 'generate_series',
        'Alias': 'g',
        'Startup Cost': 0.01,
        'Total Cost': 12.51,
        'Plan Rows': 333,
        'Plan Width': 4,
        'Actual Startup Time': 0.021,
        'Actual Total Time': 0.023,
        'Actual Rows': 9,
        'Actual Loops': 1,
        'Filter': '(g > $0)',
        'Rows Removed by Filter': 1,
        'Plans': [
          {
            'Node Type': 'Result',
            'Parent Relationship': 'InitPlan',
            'Subplan Name': 'InitPlan 1 (returns $0)',
            'Parallel Aware': false,
            'Startup Cost': 0.0,
            'Total Cost': 0.01,
            'Plan Rows': 1,
            'Plan Width': 4,
            'Actual Startup Time': 0.001,
            'Actual Total Time': 0.001,
            'Actual Rows': 1,
            'Actual Loops': 1,
          },
        ],
      },
      'Planning Time': 0.052,
      'Triggers': [],
      'Execution Time': 0.044,
    },
  ],
};
export default Sample;
