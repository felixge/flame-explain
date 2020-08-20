import { ExamplePlan } from './'

const Sample: ExamplePlan = {
  sql: `
EXPLAIN (ANALYZE, FORMAT JSON)
SELECT 1
WHERE EXISTS (SELECT 1);
`,
  queries: [
    {
      'Plan': {
        'Node Type': 'Result',
        'Parallel Aware': false,
        'Startup Cost': 0.01,
        'Total Cost': 0.02,
        'Plan Rows': 1,
        'Plan Width': 4,
        'Actual Startup Time': 0.003,
        'Actual Total Time': 0.004,
        'Actual Rows': 1,
        'Actual Loops': 1,
        'One-Time Filter': '$0',
        'Plans': [
          {
            'Node Type': 'Result',
            'Parent Relationship': 'InitPlan',
            'Subplan Name': 'InitPlan 1 (returns $0)',
            'Parallel Aware': false,
            'Startup Cost': 0.0,
            'Total Cost': 0.01,
            'Plan Rows': 1,
            'Plan Width': 0,
            'Actual Startup Time': 0.001,
            'Actual Total Time': 0.001,
            'Actual Rows': 1,
            'Actual Loops': 1,
          },
        ],
      },
      'Planning Time': 0.038,
      'Triggers': [],
      'Execution Time': 0.019,
    },
  ],
}
export default Sample
