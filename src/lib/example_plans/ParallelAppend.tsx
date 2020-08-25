import { ExamplePlan } from './';

const Sample: ExamplePlan = {
  sql: `
/** SET force_parallel_mode=true;
SET parallel_setup_cost=0;
SET parallel_tuple_cost=0; */
EXPLAIN (ANALYZE, VERBOSE, FORMAT JSON)
SELECT pg_sleep(0.1)
UNION ALL
SELECT pg_sleep(0.2)
UNION ALL
SELECT pg_sleep(0.3)
UNION ALL
SELECT pg_sleep(0.4)
UNION ALL
SELECT pg_sleep(0.5)
UNION ALL
SELECT pg_sleep(0.6);
`,
  queries: [
    {
      'Plan': {
        'Node Type': 'Gather',
        'Parallel Aware': false,
        'Startup Cost': 0.0,
        'Total Cost': 0.07,
        'Plan Rows': 6,
        'Plan Width': 4,
        'Actual Startup Time': 101.218,
        'Actual Total Time': 809.72,
        'Actual Rows': 6,
        'Actual Loops': 1,
        'Output': ["(pg_sleep('0.200000000000000011'::double precision))"],
        'Workers Planned': 2,
        'Workers Launched': 2,
        'Single Copy': false,
        'Plans': [
          {
            'Node Type': 'Append',
            'Parent Relationship': 'Outer',
            'Parallel Aware': true,
            'Startup Cost': 0.0,
            'Total Cost': 0.07,
            'Plan Rows': 1,
            'Plan Width': 4,
            'Actual Startup Time': 200.959,
            'Actual Total Time': 702.126,
            'Actual Rows': 2,
            'Actual Loops': 3,
            'Workers': [
              {
                'Worker Number': 0,
                'Actual Startup Time': 301.222,
                'Actual Total Time': 802.539,
                'Actual Rows': 2,
                'Actual Loops': 1,
              },
              {
                'Worker Number': 1,
                'Actual Startup Time': 200.685,
                'Actual Total Time': 601.231,
                'Actual Rows': 2,
                'Actual Loops': 1,
              },
            ],
            'Plans': [
              {
                'Node Type': 'Result',
                'Parent Relationship': 'Member',
                'Parallel Aware': false,
                'Startup Cost': 0.0,
                'Total Cost': 0.01,
                'Plan Rows': 1,
                'Plan Width': 4,
                'Actual Startup Time': 200.68,
                'Actual Total Time': 200.681,
                'Actual Rows': 1,
                'Actual Loops': 1,
                'Output': ["pg_sleep('0.200000000000000011'::double precision)"],
                'Workers': [
                  {
                    'Worker Number': 1,
                    'Actual Startup Time': 200.68,
                    'Actual Total Time': 200.681,
                    'Actual Rows': 1,
                    'Actual Loops': 1,
                  },
                ],
              },
              {
                'Node Type': 'Result',
                'Parent Relationship': 'Member',
                'Parallel Aware': false,
                'Startup Cost': 0.0,
                'Total Cost': 0.01,
                'Plan Rows': 1,
                'Plan Width': 4,
                'Actual Startup Time': 301.218,
                'Actual Total Time': 301.219,
                'Actual Rows': 1,
                'Actual Loops': 1,
                'Output': ["pg_sleep('0.299999999999999989'::double precision)"],
                'Workers': [
                  {
                    'Worker Number': 0,
                    'Actual Startup Time': 301.218,
                    'Actual Total Time': 301.219,
                    'Actual Rows': 1,
                    'Actual Loops': 1,
                  },
                ],
              },
              {
                'Node Type': 'Result',
                'Parent Relationship': 'Member',
                'Parallel Aware': false,
                'Startup Cost': 0.0,
                'Total Cost': 0.01,
                'Plan Rows': 1,
                'Plan Width': 4,
                'Actual Startup Time': 400.534,
                'Actual Total Time': 400.536,
                'Actual Rows': 1,
                'Actual Loops': 1,
                'Output': ["pg_sleep('0.400000000000000022'::double precision)"],
                'Workers': [
                  {
                    'Worker Number': 1,
                    'Actual Startup Time': 400.534,
                    'Actual Total Time': 400.536,
                    'Actual Rows': 1,
                    'Actual Loops': 1,
                  },
                ],
              },
              {
                'Node Type': 'Result',
                'Parent Relationship': 'Member',
                'Parallel Aware': false,
                'Startup Cost': 0.0,
                'Total Cost': 0.01,
                'Plan Rows': 1,
                'Plan Width': 4,
                'Actual Startup Time': 501.307,
                'Actual Total Time': 501.308,
                'Actual Rows': 1,
                'Actual Loops': 1,
                'Output': ["pg_sleep('0.5'::double precision)"],
                'Workers': [
                  {
                    'Worker Number': 0,
                    'Actual Startup Time': 501.307,
                    'Actual Total Time': 501.308,
                    'Actual Rows': 1,
                    'Actual Loops': 1,
                  },
                ],
              },
              {
                'Node Type': 'Result',
                'Parent Relationship': 'Member',
                'Parallel Aware': false,
                'Startup Cost': 0.0,
                'Total Cost': 0.01,
                'Plan Rows': 1,
                'Plan Width': 4,
                'Actual Startup Time': 601.631,
                'Actual Total Time': 601.632,
                'Actual Rows': 1,
                'Actual Loops': 1,
                'Output': ["pg_sleep('0.599999999999999978'::double precision)"],
              },
              {
                'Node Type': 'Result',
                'Parent Relationship': 'Member',
                'Parallel Aware': false,
                'Startup Cost': 0.0,
                'Total Cost': 0.01,
                'Plan Rows': 1,
                'Plan Width': 4,
                'Actual Startup Time': 100.944,
                'Actual Total Time': 100.945,
                'Actual Rows': 1,
                'Actual Loops': 1,
                'Output': ["pg_sleep('0.100000000000000006'::double precision)"],
              },
            ],
          },
        ],
      },
      'Planning Time': 0.134,
      'Triggers': [],
      'Execution Time': 809.799,
    },
  ],
};
export default Sample;
