import {Plan} from '../ExplainJSON'

/*
Note: Looped Materialize with average execution time of 0.

SELECT * FROM pg_indexes;
*/
const plan: Plan = [{
  "Plan": {
    "Node Type": "Nested Loop",
    "Parallel Aware": false,
    "Join Type": "Left",
    "Startup Cost": 19.62,
    "Total Cost": 40.91,
    "Plan Rows": 14,
    "Plan Width": 288,
    "Actual Startup Time": 0.416,
    "Actual Total Time": 7.580,
    "Actual Rows": 130,
    "Actual Loops": 1,
    "Inner Unique": true,
    "Join Filter": "(t.oid = i.reltablespace)",
    "Rows Removed by Join Filter": 242,
    "Plans": [
      {
        "Node Type": "Hash Join",
        "Parent Relationship": "Outer",
        "Parallel Aware": false,
        "Join Type": "Left",
        "Startup Cost": 19.62,
        "Total Cost": 39.50,
        "Plan Rows": 14,
        "Plan Width": 200,
        "Actual Startup Time": 0.320,
        "Actual Total Time": 1.153,
        "Actual Rows": 130,
        "Actual Loops": 1,
        "Inner Unique": true,
        "Hash Cond": "(c.relnamespace = n.oid)",
        "Plans": [
          {
            "Node Type": "Nested Loop",
            "Parent Relationship": "Outer",
            "Parallel Aware": false,
            "Join Type": "Inner",
            "Startup Cost": 18.49,
            "Total Cost": 38.31,
            "Plan Rows": 14,
            "Plan Width": 140,
            "Actual Startup Time": 0.300,
            "Actual Total Time": 1.025,
            "Actual Rows": 130,
            "Actual Loops": 1,
            "Inner Unique": true,
            "Plans": [
              {
                "Node Type": "Hash Join",
                "Parent Relationship": "Outer",
                "Parallel Aware": false,
                "Join Type": "Inner",
                "Startup Cost": 18.21,
                "Total Cost": 24.25,
                "Plan Rows": 35,
                "Plan Width": 72,
                "Actual Startup Time": 0.285,
                "Actual Total Time": 0.441,
                "Actual Rows": 130,
                "Actual Loops": 1,
                "Inner Unique": true,
                "Hash Cond": "(x.indrelid = c.oid)",
                "Plans": [
                  {
                    "Node Type": "Seq Scan",
                    "Parent Relationship": "Outer",
                    "Parallel Aware": false,
                    "Relation Name": "pg_index",
                    "Alias": "x",
                    "Startup Cost": 0.00,
                    "Total Cost": 5.61,
                    "Plan Rows": 161,
                    "Plan Width": 8,
                    "Actual Startup Time": 0.011,
                    "Actual Total Time": 0.052,
                    "Actual Rows": 161,
                    "Actual Loops": 1
                  },
                ]
              },
              {
                "Node Type": "Index Scan",
                "Parent Relationship": "Inner",
                "Parallel Aware": false,
                "Scan Direction": "Forward",
                "Index Name": "pg_class_oid_index",
                "Relation Name": "pg_class",
                "Alias": "i",
                "Startup Cost": 0.27,
                "Total Cost": 0.40,
                "Plan Rows": 1,
                "Plan Width": 72,
                "Actual Startup Time": 0.003,
                "Actual Total Time": 0.003,
                "Actual Rows": 1,
                "Actual Loops": 130,
                "Index Cond": "(oid = x.indexrelid)",
                "Rows Removed by Index Recheck": 0,
                "Filter": "(relkind = 'i'::\"char\")",
                "Rows Removed by Filter": 0
              }
            ]
          },
          {
            "Node Type": "Hash",
            "Parent Relationship": "Inner",
            "Parallel Aware": false,
            "Startup Cost": 1.06,
            "Total Cost": 1.06,
            "Plan Rows": 6,
            "Plan Width": 68,
            "Actual Startup Time": 0.014,
            "Actual Total Time": 0.014,
            "Actual Rows": 12,
            "Actual Loops": 1,
            "Hash Buckets": 1024,
            "Original Hash Buckets": 1024,
            "Hash Batches": 1,
            "Original Hash Batches": 1,
            "Peak Memory Usage": 10,
            "Plans": [
              {
                "Node Type": "Seq Scan",
                "Parent Relationship": "Outer",
                "Parallel Aware": false,
                "Relation Name": "pg_namespace",
                "Alias": "n",
                "Startup Cost": 0.00,
                "Total Cost": 1.06,
                "Plan Rows": 6,
                "Plan Width": 68,
                "Actual Startup Time": 0.006,
                "Actual Total Time": 0.009,
                "Actual Rows": 12,
                "Actual Loops": 1
              }
            ]
          }
        ]
      },
      {
        "Node Type": "Materialize",
        "Parent Relationship": "Inner",
        "Parallel Aware": false,
        "Startup Cost": 0.00,
        "Total Cost": 1.03,
        "Plan Rows": 2,
        "Plan Width": 68,
        "Actual Startup Time": 0.000,
        "Actual Total Time": 0.000,
        "Actual Rows": 2,
        "Actual Loops": 130,
        "Plans": [
          {
            "Node Type": "Seq Scan",
            "Parent Relationship": "Outer",
            "Parallel Aware": false,
            "Relation Name": "pg_tablespace",
            "Alias": "t",
            "Startup Cost": 0.00,
            "Total Cost": 1.02,
            "Plan Rows": 2,
            "Plan Width": 68,
            "Actual Startup Time": 0.004,
            "Actual Total Time": 0.005,
            "Actual Rows": 2,
            "Actual Loops": 1
          }
        ]
      }
    ]
  },
  "Planning Time": 1.287,
  "Triggers": [
  ],
  "Execution Time": 7.698
}]
export default plan;
