/**
 * This file tries to capture the various shapes of PostgreSQL EXPLAIN (FORMAT
 * JSON) output for all supported releases (i.e. >= 9.4).
 *
 * This file is manually derrived from the PostgreSQL source code, and was last
 * updated for PostgreSQL 12.0 [1].
 *
 * [1] https://github.com/postgres/postgres/blob/REL_12_0/src/backend/commands/explain.c
 */
export const postgresVersion = "12.0"

/**
 * Queries defines the JSON array that is produced by EXPLAIN (FORMAT JSON).
 * Each element contains the explanation of one query. In most cases, there is
 * only a single query element, however query rewrite rules can produce multiple
 * queries.
 */
export type RawQueries = Array<RawQuery>

export type RawQuery = Partial<{
  "Planning Time": number
  "Execution Time": number
  "Triggers": Array<any>
  "Plan": RawNode
  "JIT": JITFragment
}>

// TODO Describe or group fields below
export type RawNode = Partial<
  CommonFragment &
    AggregateFragment &
    SetOpFragment &
    AnalyzedFragment &
    CTENameFragment &
    CostFragment &
    FunctionScanFragment &
    IndexFragment &
    JoinFragment &
    ModifyTableFragment &
    ForeignScanFragment &
    NamedTupleStoreScanFragment &
    ResultFragment &
    TableFunctionScanFragment &
    TargetRelFragment &
    TimingFragment &
    HashFragment &
    SortFragment &
    GatherFragment &
    BuffersFragment &
    IOTimingFragment
>

type CommonFragment = {
  "Node Type": NodeType

  /**
   * "Parent Relationship" is available for all plan nodes except the root
   * node. It gives some hints on how this node is referenced and executed by
   * its parent node.
   *
   * - InitPlan: An initplan is a sub-SELECT that only needs to be executed
   * once because it has no dependency on the immediately surrounding query
   * level [1].
   * - Outer: An Outer (aka left) node is the primary child node executed by a
   * parent node. Usually in order to combine it with results from an Inner
   * node if present.
   * - Inner: The Inner (aka right) is a secondary child node that is executed
   * by a parent node that combines it with an Outer node. E.g. a NestedLoop
   * will execute the Inner node for every row produced by the Outer node.
   * - Member: Is a child node used by parent nodes that can execute more than
   * two nodes. E.g. an Append node that's used for UNION queries can have many
   * Member nodes.
   * - Subquery: This relationship is used whenever the parent node is a
   * "Subquery Scan". I'm not sure what kind of queries produce this.
   * - SubPlan: A SubPlan is a sub-SELECT that is executed for every execution
   * of its parent node because of references to other parts of the query.
   *
   * [1] https://www.postgresql.org/message-id/4572.1280671706%40sss.pgh.pa.us
   */
  "Parent Relationship": "InitPlan" | "Outer" | "Inner" | "Member" | "Subquery" | "SubPlan"
  /** Available starting in PostgreSQL 9.6 and later for parallel query. */
  "Parallel Aware": boolean
  "Subplan Name": string
  "Filter": string
  "Rows Removed by Filter": number
  "Output": string[]
  "Workers": WorkerFragment[]
  "Plans": RawNode[]

  /** Average startup time / per 'Actual Loops' of this node. */
  "Actual Startup Time": number
  /** Average total time / per 'Actual Loops' of this node. */
  "Actual Total Time": number
}

export const nodeTypes = [
  "Aggregate",
  "Append",
  "Bitmap Heap Scan",
  "Bitmap Index Scan",
  "BitmapAnd",
  "BitmapOr",
  "CTE Scan",
  "Custom Scan",
  "Foreign Scan",
  "Function Scan",
  "Gather Merge",
  "Gather",
  "Group",
  "Hash Join",
  "Hash",
  "Index Only Scan",
  "Index Scan",
  "Limit",
  "LockRows",
  "Materialize",
  "Merge Append",
  "Merge Join",
  "ModifyTable",
  "Named Tuplestore Scan",
  "Nested Loop",
  "ProjectSet",
  "Recursive Union",
  "Result",
  "Sample Scan",
  "Seq Scan",
  "SetOp",
  "Sort",
  "Subquery Scan",
  "Table Function Scan",
  "Tid Scan",
  "Unique",
  "Values Scan",
  "WindowAgg",
  "WorkTable Scan",
] as const

/**
 * NodeType is a list of all Node Type values implemented by PostgreSQL.
 */
export type NodeType = typeof nodeTypes[number]

/**
 * TargetRelFragment is present when Node Type is "Seq Scan" | "Sample Scan" |
 * "Index Scan" | "Index Only Scan" | "Bitmap Heap Scan" | "Tid Scan" |
 * "Foreign Scan" | "Custom Scan" | "ModifyTable".
 */
type TargetRelFragment = {
  "Schema": string
  "Relation Name": string
  "Alias": string
}

/**
 * CostFragment is present when the COSTS option is enabled.
 */
type CostFragment = {
  "Startup Cost": number
  "Total Cost": number
  "Plan Rows": number
  "Plan Width": number
}

/**
 * AnalyzedFragment is present when the ANALYZE option is enabled.
 */
type AnalyzedFragment = {
  /** Number of rows returned by this node. */
  "Actual Rows": number
  /** Number of times this node was executed in a loop. Can be 0 if the
   * node was not executed at all. */
  "Actual Loops": number
}

/**
 * TimingFragment is present when the TIMING option is enabled.
 */
type TimingFragment = {
  /** Average startup time / per 'Actual Loops' of this node. */
  "Actual Startup Time": number
  /** Average total time / per 'Actual Loops' of this node. */
  "Actual Total Time": number
}

/**
 * CTENameFragment is present when "Node Type" is "CTE Scan" | "WorkTable Scan".
 */
type CTENameFragment = {
  "CTE Name": string
}

/**
 * JoinFragment is present when "Node Type" is "Nested Loop" | "Hash Join" |
 * "Merge Join". Some fields are only present when the VERBOSE option is
 * enabled.
 */
type JoinFragment = {
  "Join Type": "Inner" | "Left" | "Full" | "Right" | "Semi" | "Anti" | "???"
  "Inner Unique": boolean
  "Join Filter": string
  "Rows Removed by Join Filter": number

  // Only available for "Hash Join".
  "Hash Cond": string
}

type Operation =
  // When "Node Type" is "ModifyTable"
  | "Insert"
  | "Update"
  | "Delete"
  // When "Node Type" is "Foreign Scan"
  | "Select"
  | "Insert"
  | "Update"
  | "Delete"

/**
 * ModifyTableFragment is available when "Node Type" is "ModifyTable".
 */
type ModifyTableFragment = {
  "Operation": Operation
}

/**
 * ForeignScanFragment is available when "Node Type" is "Foreign Scan".
 */
type ForeignScanFragment = {
  "Operation": Operation
}

/**
 * IndexFragment is available when "Node Type" is "Bitmap Index Scan" | "Index
 * Scan" | "Index Only Scan".
 */
type IndexFragment = {
  "Index Name": string
  "Index Cond": string
  // Not available for "Bitmap Index Scan".
  "Rows Removed by Index Recheck": number
  // Not available for "Bitmap Index Scan".
  "Scan Direction": "Backward" | "NoMovement" | "Forward" | "?"
}

type Strategy =
  // When "Node Type" is "Aggregate".
  | "Plain"
  | "Sorted"
  | "Hashed"
  | "Mixed"
  | "???"
  // When "Node Type" is "SetOp".
  | "Sorted"
  | "Hashed"
  | "???"

/**
 * AggregateFragment is available when "Node Type" is "Aggregate".
 */
type AggregateFragment = {
  "Strategy": Strategy
  /** Available since PostgreSQL 9.6 and later for parallel query. */
  "Partial Mode"?: "Simple" | "Partial" | "Finalize"
}

/**
 * SetOpFragment is available when "Node Type" is "SetOp".
 */
type SetOpFragment = {
  "Strategy": Strategy
  "Command": "Intersect" | "Intersect All" | "Except" | "Except All" | "???"
}

/**
 * FunctionScanFragment is available when "Node Type" is "Function Scan".
 */
type FunctionScanFragment = {
  "Function Name": string
  "Schema": string
  "Function Call"?: string
}

/**
 * TableFunctionScanFragment is available when "Node Type" is "Table Function
 * Scan".
 */
type TableFunctionScanFragment = {
  "Table Function Name": string
}

/**
 * NamedTupleStoreScanFragment is available when "Node Type" is "Named
 * Tuplestore Scan".
 */
type NamedTupleStoreScanFragment = {
  "Tuplestore Name": string
}

/**
 * ResultFragment is available when "Node Type" is "Result".
 */
type ResultFragment = {
  "One-Time Filter"?: string
}

/**
 * HashFragment is available when "Node Type" is "Hash".
 */
type HashFragment = {
  "One-Time Filter"?: string
  "Hash Buckets": number
  "Original Hash Buckets": number
  "Hash Batches": number
  "Original Hash Batches": number
  /** kB */
  "Peak Memory Usage": number
}

/**
 * SortFragment is available when "Node Type" is "Sort".
 */
type SortFragment = {
  "Sort Key": string[]
  "Sort Method":
    | string
    | "still in progress"
    | "top-N heapsort"
    | "quicksort"
    | "external sort"
    | "external merge"
    | "unknown"
  /* kB */
  "Sort Space Used": number
  "Sort Space Type": string | "Disk" | "Memory"
}

/**
 * GatherFragment is available when "Node Type" is "Gather" | "Gather Merge".
 */
type GatherFragment = {
  "Workers Planned": number
  "Workers Launched": number
  // Only available for "Gather".
  "Single Copy": boolean
}

type WorkerFragment = {
  "Worker Number": number
} & Partial<TimingFragment & AnalyzedFragment & SortFragment & BuffersFragment & IOTimingFragment>

type BuffersFragment = {
  "Shared Hit Blocks": number
  "Shared Read Blocks": number
  "Shared Dirtied Blocks": number
  "Shared Written Blocks": number
  "Local Hit Blocks": number
  "Local Read Blocks": number
  "Local Dirtied Blocks": number
  "Local Written Blocks": number
  "Temp Read Blocks": number
  "Temp Written Blocks": number
}

type IOTimingFragment = {
  "I/O Read Time": number
  "I/O Write Time": number
}

type JITFragment = {
  "Worker Number": number
  "Functions": number
  "Options": {
    "Inlining": boolean
    "Optimization": boolean
    "Expressions": boolean
    "Deforming": boolean
  }
  "Timing": {
    "Generation": number
    "Inlining": number
    "Optimization": number
    "Emission": number
    "Total": number
  }
}
