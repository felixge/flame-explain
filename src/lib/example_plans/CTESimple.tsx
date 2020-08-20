import { ExamplePlan } from './'

const Sample: ExamplePlan = {
  sql: `
/** A very simple CTE query executed with PG <= 11. Starting with version 12,
PostgreSQL automatically inlines CTEs that are referenced only once.

What's interesting about this query is that the CTE Scan is the parent node
for its own InitPlan, which is usually not the case in more realistic queries. */
EXPLAIN (ANALYZE, FORMAT JSON)
WITH foo AS (
	SELECT pg_sleep(0.1)
)
SELECT * FROM foo;
`.trim(),
  queries: [
    {
      'Plan': {
        'Node Type': 'CTE Scan',
        'Parallel Aware': false,
        'CTE Name': 'foo',
        'Alias': 'foo',
        'Startup Cost': 0.01,
        'Total Cost': 0.03,
        'Plan Rows': 1,
        'Plan Width': 4,
        'Actual Startup Time': 102.165,
        'Actual Total Time': 102.167,
        'Actual Rows': 1,
        'Actual Loops': 1,
        'Plans': [
          {
            'Node Type': 'Result',
            'Parent Relationship': 'InitPlan',
            'Subplan Name': 'CTE foo',
            'Parallel Aware': false,
            'Startup Cost': 0.0,
            'Total Cost': 0.01,
            'Plan Rows': 1,
            'Plan Width': 4,
            'Actual Startup Time': 102.159,
            'Actual Total Time': 102.16,
            'Actual Rows': 1,
            'Actual Loops': 1,
          },
        ],
      },
      'Planning Time': 0.051,
      'Triggers': [],
      'Execution Time': 102.186,
    },
  ],
}
export default Sample
