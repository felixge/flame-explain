import { Plan } from "./ExplainJSON"

interface Test {
  query: string;
  explainJSON: Plan;
  explainText?: string;
}

// TODO: This is required to we can define tests in a way that enforces the
// value type and allows type checking/autocomplete on the test names. There
// might be a better way to do this in typescript. OTHO it might be nice to see
// a quick overview of all the available tests.
// TODO: Add at least one test for each Node Type.
export type TestName =
  'Seq Scan' |
  'Limit' |
  'Index Scan' |
  'Function Scan' |
  'Result' |
  'Project Set' |
  'Nested Loop';

// TODO: Indicate if the test is verbose or not, also add text tests
export const tests: { [N in TestName]: Test } = {
  "Seq Scan": {
    query: "SELECT * FROM pg_class",
    explainJSON: [
      {
        "Plan": {
          "Node Type": "Seq Scan",
          "Parallel Aware": false,
          "Relation Name": "pg_class",
          "Alias": "pg_class",
          "Startup Cost": 0.00,
          "Total Cost": 16.09,
          "Plan Rows": 409,
          "Plan Width": 262,
          "Actual Startup Time": 0.010,
          "Actual Total Time": 0.099,
          "Actual Rows": 409,
          "Actual Loops": 1
        },
        "Planning Time": 0.112,
        "Triggers": [
        ],
        "Execution Time": 0.164
      }
    ],
  },

  "Limit": {
    query: "SELECT * FROM pg_class LIMIT 1;",
    explainJSON: [
      {
        "Plan": {
          "Node Type": "Limit",
          "Parallel Aware": false,
          "Startup Cost": 0.00,
          "Total Cost": 0.04,
          "Plan Rows": 1,
          "Plan Width": 262,
          "Actual Startup Time": 0.013,
          "Actual Total Time": 0.014,
          "Actual Rows": 1,
          "Actual Loops": 1,
          "Plans": [
            {
              "Node Type": "Seq Scan",
              "Parent Relationship": "Outer",
              "Parallel Aware": false,
              "Relation Name": "pg_class",
              "Alias": "pg_class",
              "Startup Cost": 0.00,
              "Total Cost": 16.09,
              "Plan Rows": 409,
              "Plan Width": 262,
              "Actual Startup Time": 0.012,
              "Actual Total Time": 0.012,
              "Actual Rows": 1,
              "Actual Loops": 1
            }
          ]
        },
        "Planning Time": 0.114,
        "Triggers": [
        ],
        "Execution Time": 0.047
      }
    ],
  },

  "Index Scan": {
    query: "SELECT * FROM pg_class WHERE relname = 'comments';",
    explainJSON: [
      {
        "Plan": {
          "Node Type": "Index Scan",
          "Parallel Aware": false,
          "Scan Direction": "Forward",
          "Index Name": "pg_class_relname_nsp_index",
          "Relation Name": "pg_class",
          "Alias": "pg_class",
          "Startup Cost": 0.27,
          "Total Cost": 2.49,
          "Plan Rows": 1,
          "Plan Width": 262,
          "Actual Startup Time": 0.028,
          "Actual Total Time": 0.029,
          "Actual Rows": 1,
          "Actual Loops": 1,
          "Index Cond": "(relname = 'comments'::name)",
          "Rows Removed by Index Recheck": 0
        },
        "Planning Time": 0.141,
        "Triggers": [
        ],
        "Execution Time": 0.070
      }
    ],
  },

  "Function Scan": {
    query: "SELECT * FROM unnest(ARRAY[1,2,3])",
    explainJSON: [
      {
        "Plan": {
          "Node Type": "Function Scan",
          "Parallel Aware": false,
          "Function Name": "unnest",
          "Alias": "unnest",
          "Startup Cost": 0.00,
          "Total Cost": 1.00,
          "Plan Rows": 100,
          "Plan Width": 4,
          "Actual Startup Time": 0.012,
          "Actual Total Time": 0.012,
          "Actual Rows": 3,
          "Actual Loops": 1
        },
        "Planning Time": 0.077,
        "Triggers": [
        ],
        "Execution Time": 0.031
      }
    ]
  },

  "Result": {
    query: 'SELECT 1;',
    explainJSON: [
      {
        "Plan": {
          "Node Type": "Result",
          "Parallel Aware": false,
          "Startup Cost": 0.00,
          "Total Cost": 0.01,
          "Plan Rows": 1,
          "Plan Width": 4,
          "Actual Startup Time": 0.002,
          "Actual Total Time": 0.002,
          "Actual Rows": 1,
          "Actual Loops": 1
        },
        "Planning Time": 0.018,
        "Triggers": [
        ],
        "Execution Time": 0.013
      }
    ]
  },

  "Project Set": {
    query: "SELECT unnest(ARRAY[1,2,3])",
    explainJSON: [
      {
        "Plan": {
          "Node Type": "ProjectSet",
          "Parallel Aware": false,
          "Startup Cost": 0.00,
          "Total Cost": 0.52,
          "Plan Rows": 100,
          "Plan Width": 4,
          "Actual Startup Time": 0.004,
          "Actual Total Time": 0.005,
          "Actual Rows": 3,
          "Actual Loops": 1,
          "Plans": [
            {
              "Node Type": "Result",
              "Parent Relationship": "Outer",
              "Parallel Aware": false,
              "Startup Cost": 0.00,
              "Total Cost": 0.01,
              "Plan Rows": 1,
              "Plan Width": 0,
              "Actual Startup Time": 0.001,
              "Actual Total Time": 0.001,
              "Actual Rows": 1,
              "Actual Loops": 1
            }
          ]
        },
        "Planning Time": 0.036,
        "Triggers": [
        ],
        "Execution Time": 0.021
      }
    ],
  },

  "Nested Loop": {
    query: "SELECT * FROM generate_series(1, 1000) a, generate_series(1, 1000) b;",
    explainJSON: [
      {
        "Plan": {
          "Node Type": "Nested Loop",
          "Parallel Aware": false,
          "Join Type": "Inner",
          "Startup Cost": 0.01,
          "Total Cost": 20010.01,
          "Plan Rows": 1000000,
          "Plan Width": 8,
          "Actual Startup Time": 0.323,
          "Actual Total Time": 284.158,
          "Actual Rows": 1000000,
          "Actual Loops": 1,
          "Inner Unique": false,
          "Plans": [
            {
              "Node Type": "Function Scan",
              "Parent Relationship": "Outer",
              "Parallel Aware": false,
              "Function Name": "generate_series",
              "Alias": "a",
              "Startup Cost": 0.00,
              "Total Cost": 10.00,
              "Plan Rows": 1000,
              "Plan Width": 4,
              "Actual Startup Time": 0.165,
              "Actual Total Time": 0.317,
              "Actual Rows": 1000,
              "Actual Loops": 1
            },
            {
              "Node Type": "Function Scan",
              "Parent Relationship": "Inner",
              "Parallel Aware": false,
              "Function Name": "generate_series",
              "Alias": "b",
              "Startup Cost": 0.00,
              "Total Cost": 10.00,
              "Plan Rows": 1000,
              "Plan Width": 4,
              "Actual Startup Time": 0.000,
              "Actual Total Time": 0.096,
              "Actual Rows": 1000,
              "Actual Loops": 1000
            }
          ]
        },
        "Planning Time": 0.054,
        "Triggers": [
        ],
        "Execution Time": 343.329
      }
    ],
  }
};
