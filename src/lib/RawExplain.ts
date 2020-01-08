/**
 * This file tries to capture the various shapes of PostgreSQL
 * EXPLAIN (FORMAT JSON) output using Typescript's advanced type features. This
 * makes it easier to document/auto-complete which JSON Fields appear together
 * when certain EXPLAIN flags are enabled (e.g. TIMING), and which JSON Fields
 * are unique to certain node types. All supported PostgreSQL releases
 * (i.e. >= 9.4) are covered.
 *
 * This file is manually derrived from the PostgreSQL source code, and was last
 * updated for PostgreSQL 12.0 [1].
 *
 * TROUBLESHOOTING ADVICE: Typescript may sometimes produce very long and
 * cryptic error messages when trying to assign a value to the Plan type. The
 * best way to debug those is to remove parts from the plan until it passes
 * type checking, which usually allows to identify the true source of the error.
 *
 * [1] https://github.com/postgres/postgres/blob/REL_12_0/src/backend/commands/explain.c
 */

/** Queries defines the JSON array that is produced by EXPLAIN (FORMAT JSON).
 * Each element contains the explanation of one query. In most cases, there is
 * only a single query element, however query rewrite rules can produce multiple
 * queries.
 */
export type Queries = Array<Query>;

export type Query = Partial<{
  "Plan": Node;
  "Planning Time": number;
  "Execution Time": number;
  "Triggers": Array<any>;
}>;

// TODO Describe or group fields below
export type Node = Partial<
  CommonFragment
  & (AggregateFragment | SetOpFragment)
  & AnalyzedFragment
  & CTENameFragment
  & CostFragment
  & FunctionScanFragment
  & IndexFragment
  & JoinFragment
  & (ModifyTableFragment | ForeignScanFragment)
  & NamedTupleStoreScanFragment
  & ResultFragment
  & TableFunctionScanFragment
  & TargetRelFragment
  & TimingFragment
  & HashFragment
  & GatherFragment
>;

type CommonFragment = {
  "Node Type": NodeType;
  "Parent Relationship": 'InitPlan' | 'Outer' | 'Inner' | 'Member' | 'Subquery';
  /** Available starting in PostgreSQL 9.6 and later for parallel query. */
  "Parallel Aware": boolean;
  "Subplan Name": string,
  "Filter": string;
  "Rows Removed by Filter": number;
  "Output": string[];
  "Workers": WorkerFragment[];
  "Plans": Node[];

  /** Average startup time / per 'Actual Loops' of this node. */
  "Actual Startup Time": number;
  /** Average total time / per 'Actual Loops' of this node. */
  "Actual Total Time": number;
};

/**
 * NodeType is a list of all Node Type values implemented by PostgreSQL.
 */
export type NodeType =
  'Result' |
  'ProjectSet' |
  'ModifyTable' |
  'Append' |
  'Merge Append' |
  'Recursive Union' |
  'BitmapAnd' |
  'BitmapOr' |
  'Nested Loop' |
  'Merge Join' |
  'Hash Join' |
  'Seq Scan' |
  'Sample Scan' |
  'Gather' |
  'Gather Merge' |
  'Index Scan' |
  'Index Only Scan' |
  'Bitmap Index Scan' |
  'Bitmap Heap Scan' |
  'Tid Scan' |
  'Subquery Scan' |
  'Function Scan' |
  'Table Function Scan' |
  'Values Scan' |
  'CTE Scan' |
  'Named Tuplestore Scan' |
  'WorkTable Scan' |
  'Foreign Scan' |
  'Custom Scan' |
  'Materialize' |
  'Sort' |
  'Group' |
  'Aggregate' |
  'WindowAgg' |
  'Unique' |
  'SetOp' |
  'LockRows' |
  'Limit' |
  'Hash';

/**
 * TargetRelFragment is present when Node Type is "Seq Scan" | "Sample Scan" |
 * "Index Scan" | "Index Only Scan" | "Bitmap Heap Scan" | "Tid Scan" |
 * "Foreign Scan" | "Custom Scan" | "ModifyTable".
 */
type TargetRelFragment = {
  "Schema": string;
  "Relation Name": string;
  "Alias": string;
};

/**
 * CostFragment is present when the COSTS option is enabled.
 */
type CostFragment = {
  "Startup Cost": number,
  "Total Cost": number,
  "Plan Rows": number,
  "Plan Width": number,
};

/**
 * AnalyzedFragment is present when the ANALYZE option is enabled.
 */
type AnalyzedFragment = {
  /** Number of rows returned by this node. */
  "Actual Rows": number;
  /** Number of times this node was executed in a loop. Can be 0 if the
   * node was not executed at all. */
  "Actual Loops": number;
};

/**
 * TimingFragment is present when the TIMING option is enabled.
 */
type TimingFragment = {
  /** Average startup time / per 'Actual Loops' of this node. */
  "Actual Startup Time": number;
  /** Average total time / per 'Actual Loops' of this node. */
  "Actual Total Time": number;
};

/**
 * CTENameFragment is present when "Node Type" is "CTE Scan" | "WorkTable Scan".
 */
type CTENameFragment = {
  "CTE Name": string;
};

/**
 * JoinFragment is present when "Node Type" is "Nested Loop" | "Hash Join" |
 * "Merge Join". Some fields are only present when the VERBOSE option is
 * enabled.
 */
type JoinFragment = {
  "Join Type": "Inner" | "Left" | "Full" | "Right" | "Semi" | "Anti" | "???";
  "Inner Unique": boolean;
  "Join Filter": string;
  "Rows Removed by Join Filter": number;

  // Only available for "Hash Join".
  "Hash Cond": string;
};

/**
 * ModifyTableFragment is available when "Node Type" is "ModifyTable".
 */
type ModifyTableFragment = {
  "Operation": "Insert" | "Update" | "Delete";
};

/**
 * ForeignScanFragment is available when "Node Type" is "Foreign Scan".
 */
type ForeignScanFragment = {
  "Operation": "Select" | "Insert" | "Update" | "Delete";
};

/**
 * IndexFragment is available when "Node Type" is "Bitmap Index Scan" | "Index
 * Scan" | "Index Only Scan".
 */
type IndexFragment = {
  "Index Name": string;
  "Index Cond": string;
  // Not available for "Bitmap Index Scan".
  "Rows Removed by Index Recheck": number;
  // Not available for "Bitmap Index Scan".
  "Scan Direction": "Backward" | "NoMovement" | "Forward" | "?";
};

/**
 * AggregateFragment is available when "Node Type" is "Aggregate".
 */
type AggregateFragment = {
  "Strategy": "Plain" | "Sorted" | "Hashed" | "Mixed" | "???";
  /** Available since PostgreSQL 9.6 and later for parallel query. */
  "Partial Mode"?: "Simple" | "Partial" | "Finalize";
};

/**
 * SetOpFragment is available when "Node Type" is "SetOp".
 */
type SetOpFragment = {
  "Strategy": "Sorted" | "Hashed" | "???";
  "Command": "Intersect" | "Intersect All" | "Except" | "Except All" | "???";
};

/**
 * FunctionScanFragment is available when "Node Type" is "Function Scan".
 */
type FunctionScanFragment = {
  "Function Name": string;
  "Schema": string;
  "Function Call"?: string;
};

/**
 * TableFunctionScanFragment is available when "Node Type" is "Table Function
 * Scan".
 */
type TableFunctionScanFragment = {
  "Table Function Name": string;
};

/**
 * NamedTupleStoreScanFragment is available when "Node Type" is "Named
 * Tuplestore Scan".
 */
type NamedTupleStoreScanFragment = {
  "Tuplestore Name": string;
};

/**
 * ResultFragment is available when "Node Type" is "Result".
 */
type ResultFragment = {
  "One-Time Filter"?: string;
};

/**
 * HashFragment is available when "Node Type" is "Hash".
 */
type HashFragment = {
  "One-Time Filter"?: string;
  "Hash Buckets": number;
  "Original Hash Buckets": number;
  "Hash Batches": number;
  "Original Hash Batches": number,
  /** kB */
  "Peak Memory Usage": number,
};

/**
 * GatherFragment is available when "Node Type" is "Gather" | "Gather Merge". 
 */
type GatherFragment = {
  "Workers Planned": number;
  "Workers Launched": number;
  // Only available for "Gather".
  "Single Copy": boolean;
};

type WorkerFragment = {
  "Worker Number": number;
} & TimingFragment & AnalyzedFragment;
