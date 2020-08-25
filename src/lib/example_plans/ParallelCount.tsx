import { ExamplePlan } from './';

const Sample: ExamplePlan = {
  sql: `/** A simple count(*) query that uses a parallel sequential scan. */
CREATE TABLE foo AS
SELECT g
FROM generate_series(1, 10000000) g;

EXPLAIN (ANALYZE, FORMAT JSON)
SELECT count(*)
FROM foo;
`,
  queries: [
    {
      'Plan': {
        'Node Type': 'Aggregate',
        'Strategy': 'Plain',
        'Partial Mode': 'Finalize',
        'Parallel Aware': false,
        'Startup Cost': 97331.43,
        'Total Cost': 97331.44,
        'Plan Rows': 1,
        'Plan Width': 8,
        'Actual Startup Time': 834.738,
        'Actual Total Time': 834.738,
        'Actual Rows': 1,
        'Actual Loops': 1,
        'Plans': [
          {
            'Node Type': 'Gather',
            'Parent Relationship': 'Outer',
            'Parallel Aware': false,
            'Startup Cost': 97331.21,
            'Total Cost': 97331.42,
            'Plan Rows': 2,
            'Plan Width': 8,
            'Actual Startup Time': 834.619,
            'Actual Total Time': 850.904,
            'Actual Rows': 3,
            'Actual Loops': 1,
            'Workers Planned': 2,
            'Workers Launched': 2,
            'Single Copy': false,
            'Plans': [
              {
                'Node Type': 'Aggregate',
                'Strategy': 'Plain',
                'Partial Mode': 'Partial',
                'Parent Relationship': 'Outer',
                'Parallel Aware': false,
                'Startup Cost': 96331.21,
                'Total Cost': 96331.22,
                'Plan Rows': 1,
                'Plan Width': 8,
                'Actual Startup Time': 830.591,
                'Actual Total Time': 830.591,
                'Actual Rows': 1,
                'Actual Loops': 3,
                'Plans': [
                  {
                    'Node Type': 'Seq Scan',
                    'Parent Relationship': 'Outer',
                    'Parallel Aware': true,
                    'Relation Name': 'foo',
                    'Alias': 'foo',
                    'Startup Cost': 0.0,
                    'Total Cost': 85914.57,
                    'Plan Rows': 4166657,
                    'Plan Width': 0,
                    'Actual Startup Time': 0.019,
                    'Actual Total Time': 473.428,
                    'Actual Rows': 3333333,
                    'Actual Loops': 3,
                  },
                ],
              },
            ],
          },
        ],
      },
      'Planning Time': 0.054,
      'Triggers': [],
      'Execution Time': 850.961,
    },
  ],
};
export default Sample;
