import {ExamplePlan} from './';

const Sample: ExamplePlan = {
  sql: `
EXPLAIN (ANALYZE, FORMAT JSON)
WITH tmp_data AS (
	SELECT 1 AS a FROM pg_sleep_for('100ms')
),

foo AS (
	SELECT *
	FROM generate_series(1, 20) b
	JOIN LATERAL (
		SELECT count(*)
		FROM tmp_data
		WHERE a > b
	) q ON TRUE
)

SELECT *
FROM foo, generate_series(1, 5);
`.trim(),
  queries: [
    {
      'Plan': {
        'Node Type': 'Nested Loop',
        'Parallel Aware': false,
        'Join Type': 'Inner',
        'Startup Cost': 65.03,
        'Total Cost': 20085.03,
        'Plan Rows': 1000000,
        'Plan Width': 16,
        'Actual Startup Time': 175.205,
        'Actual Total Time': 175.406,
        'Actual Rows': 100,
        'Actual Loops': 1,
        'Inner Unique': false,
        'Plans': [
          {
            'Node Type': 'Function Scan',
            'Parent Relationship': 'InitPlan',
            'Subplan Name': 'CTE tmp_data',
            'Parallel Aware': false,
            'Function Name': 'pg_sleep',
            'Alias': 'pg_sleep_for',
            'Startup Cost': 0.02,
            'Total Cost': 0.03,
            'Plan Rows': 1,
            'Plan Width': 4,
            'Actual Startup Time': 175.158,
            'Actual Total Time': 175.159,
            'Actual Rows': 1,
            'Actual Loops': 1,
          },
          {
            'Node Type': 'Nested Loop',
            'Parent Relationship': 'InitPlan',
            'Subplan Name': 'CTE foo',
            'Parallel Aware': false,
            'Join Type': 'Inner',
            'Startup Cost': 0.03,
            'Total Cost': 65.0,
            'Plan Rows': 1000,
            'Plan Width': 12,
            'Actual Startup Time': 175.187,
            'Actual Total Time': 175.265,
            'Actual Rows': 20,
            'Actual Loops': 1,
            'Inner Unique': false,
            'Plans': [
              {
                'Node Type': 'Function Scan',
                'Parent Relationship': 'Outer',
                'Parallel Aware': false,
                'Function Name': 'generate_series',
                'Alias': 'b',
                'Startup Cost': 0.0,
                'Total Cost': 10.0,
                'Plan Rows': 1000,
                'Plan Width': 4,
                'Actual Startup Time': 0.008,
                'Actual Total Time': 0.014,
                'Actual Rows': 20,
                'Actual Loops': 1,
              },
              {
                'Node Type': 'Aggregate',
                'Strategy': 'Plain',
                'Partial Mode': 'Simple',
                'Parent Relationship': 'Inner',
                'Parallel Aware': false,
                'Startup Cost': 0.02,
                'Total Cost': 0.03,
                'Plan Rows': 1,
                'Plan Width': 8,
                'Actual Startup Time': 8.761,
                'Actual Total Time': 8.761,
                'Actual Rows': 1,
                'Actual Loops': 20,
                'Plans': [
                  {
                    'Node Type': 'CTE Scan',
                    'Parent Relationship': 'Outer',
                    'Parallel Aware': false,
                    'CTE Name': 'tmp_data',
                    'Alias': 'tmp_data',
                    'Startup Cost': 0.0,
                    'Total Cost': 0.02,
                    'Plan Rows': 1,
                    'Plan Width': 0,
                    'Actual Startup Time': 8.759,
                    'Actual Total Time': 8.759,
                    'Actual Rows': 0,
                    'Actual Loops': 20,
                    'Filter': '(a > b.b)',
                    'Rows Removed by Filter': 1,
                  },
                ],
              },
            ],
          },
          {
            'Node Type': 'CTE Scan',
            'Parent Relationship': 'Outer',
            'Parallel Aware': false,
            'CTE Name': 'foo',
            'Alias': 'foo',
            'Startup Cost': 0.0,
            'Total Cost': 20.0,
            'Plan Rows': 1000,
            'Plan Width': 12,
            'Actual Startup Time': 175.19,
            'Actual Total Time': 175.293,
            'Actual Rows': 20,
            'Actual Loops': 1,
          },
          {
            'Node Type': 'Function Scan',
            'Parent Relationship': 'Inner',
            'Parallel Aware': false,
            'Function Name': 'generate_series',
            'Alias': 'generate_series',
            'Startup Cost': 0.0,
            'Total Cost': 10.0,
            'Plan Rows': 1000,
            'Plan Width': 4,
            'Actual Startup Time': 0.001,
            'Actual Total Time': 0.002,
            'Actual Rows': 5,
            'Actual Loops': 20,
          },
        ],
      },
      'Planning Time': 0.214,
      'Triggers': [],
      'Execution Time': 175.487,
    },
  ],
};
export default Sample;
