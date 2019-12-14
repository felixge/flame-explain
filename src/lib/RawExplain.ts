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

import {OptionalEmbed} from './Util';

/** Queries defines the JSON array that is produced by EXPLAIN (FORMAT JSON).
 * Each element contains the explanation of one query. In most cases, there is
 * only a single query element, however query rewrite rules can produce multiple
 * queries.
 */
export type Queries = Array<Query>;

export type Query = OptionalEmbed<{
  // TODO rename Node to Plan
  "Plan": Node;
}, QueryAnalyzedFragment>;

export type QueryAnalyzedFragment = {
  "Planning Time": number;
  "Execution Time": number;
  "Triggers": Array<any>;
}


/**
 * NodeType should cover all node types. Last updated for REL_12_0 [1]
 * [1] 
 *  */
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

interface NodeCommonFragment {
  "Parent Relationship"?: 'InitPlan' | 'Outer' | 'Inner' | 'Member' | 'Subquery';
  /** Available starting in PostgreSQL 9.6 and later. */
  "Parallel Aware"?: boolean;
  "Subplan Name"?: string,

  // TODO: what node types can these two be on? any?
  "Filter"?: string;
  "Rows Removed by Filter"?: number;

  "Plans"?: Node[];
};

interface NodeCostFragment {
  "Startup Cost": number,
  "Total Cost": number,
  "Plan Rows": number,
  "Plan Width": number,
}

export interface NodeAnalyzedFragment {
  /** Number of rows returned by this node. */
  "Actual Rows": number;
  /** Number of times this node was executed in a loop. Can be 0 if the
   * node was not executed at all. */
  "Actual Loops": number;
}

export interface NodeTimingFragment {
  /** Average startup time / per 'Actual Loops' of this node. */
  "Actual Startup Time": number;
  /** Average total time / per 'Actual Loops' of this node. */
  "Actual Total Time": number;
}

interface NodeTargetRelFragment {
  "Node Type": (
    "Seq Scan" |
    "Sample Scan" |
    "Index Scan" |
    "Index Only Scan" |
    "Bitmap Heap Scan" |
    "Tid Scan" |
    "Foreign Scan" |
    "Custom Scan" |
    "ModifyTable"
  );
  "Schema"?: string;
  "Relation Name": string;
  "Alias": string;
}

type NodeTypeFragment = {"Node Type": NodeType};

// ConditionalNodeTypeFragment returns T & Fragment if T["Node Type"] is
// assignable to Fragment["Node Type"].
type ConditionalNodeTypeFragment<
  T extends NodeTypeFragment,
  Fragment extends NodeTypeFragment,
  > = T["Node Type"] extends Fragment["Node Type"]
  ? T & Fragment
  : T;

/**
 * Dear type god, what have I done? I hope the answer is that this type
 * intersects with NodeTargetRelFragment if T has a compatible "Node Type",
 * and also optionally intersects all combinations of a bunch of other
 * fragements that can show up for any type of node depending on the EXPLAIN
 * options selected by the user.
 */
type NodeWithFragments<T extends NodeTypeFragment> =
  OptionalEmbed<OptionalEmbed<OptionalEmbed<
    ConditionalNodeTypeFragment<T, NodeTargetRelFragment> &
    NodeCommonFragment
    , NodeCostFragment>, NodeAnalyzedFragment>, NodeTimingFragment>;

type NodeModifyTable = NodeWithFragments<{
  "Node Type": "ModifyTable";
  "Operation"?: "Insert" | "Update" | "Delete";
}>;

type NodeForeignScan = NodeWithFragments<{
  "Node Type": "Foreign Scan";
  "Operation"?: "Select" | "Insert" | "Update" | "Delete";
}>;

type NodeBitmapIndexScan = NodeWithFragments<{
  "Node Type": "Bitmap Index Scan";
  "Index Name": string;
  "Index Cond": string;
}>;

type NodeIndexScan = NodeWithFragments<{
  "Node Type": "Index Scan" | "Index Only Scan";
  "Index Name": string;
  "Index Cond": string;
  "Rows Removed by Index Recheck": number;
  "Scan Direction": "Backward" | "NoMovement" | "Forward" | "?";
}>;

type NodeJoinFragment = {
  "Join Type": "Inner" | "Left" | "Full" | "Right" | "Semi" | "Anti" | "???";
  "Inner Unique"?: boolean;
  "Join Filter"?: string;
  "Rows Removed by Join Filter"?: number;
}

type NodeNestedLoop = NodeWithFragments<{
  "Node Type": "Nested Loop";
} & NodeJoinFragment>;

type NodeHashJoin = NodeWithFragments<{
  "Node Type": "Hash Join";
  "Hash Cond": string;
} & NodeJoinFragment>;

type NodeMergeJoin = NodeWithFragments<{
  "Node Type": "Merge Join";
} & NodeJoinFragment>;

type NodeAggregate = NodeWithFragments<{
  "Node Type": "Aggregate";
  "Strategy": "Plain" | "Sorted" | "Hashed" | "Mixed" | "???";
  /** Available since PostgreSQL 9.6 and later. */
  "Partial Mode"?: "Simple" | "Partial" | "Finalize";
}>;

type NodeSetOp = NodeWithFragments<{
  "Node Type": "SetOp";
  "Strategy": "Sorted" | "Hashed" | "???";
  "Command": "Intersect" | "Intersect All" | "Except" | "Except All" | "???";
}>;

type NodeFunctionScan = NodeWithFragments<{
  "Node Type": "Function Scan";
  "Function Name": string;
  "Schema"?: string;
}>

type NodeTableFunctionScan = NodeWithFragments<{
  "Node Type": "Table Function Scan";
  "Table Function Name": string;
}>;

type NodeCTEorWorkTableScan = NodeWithFragments<{
  "Node Type": "CTE Scan" | "WorkTable Scan";
  "CTE Name": string;
}>;

type NodeNamedTuplestoreScan = NodeWithFragments<{
  "Node Type": "Named Tuplestore Scan";
  "Tuplestore Name": string;
}>;

type NodeResult = NodeWithFragments<{
  "Node Type": "Result";
  "One-Time Filter"?: string;
}>;

type NodeHash = NodeWithFragments<{
  "Node Type": "Hash";
  "Hash Buckets": number;
  "Original Hash Buckets": number;
  "Hash Batches": number;
  "Original Hash Batches": number,
  /** kB */
  "Peak Memory Usage": number,
}>;

type SpecializedNode =
  NodeModifyTable |
  NodeForeignScan |
  NodeBitmapIndexScan |
  NodeIndexScan |
  NodeNestedLoop |
  NodeHashJoin |
  NodeMergeJoin |
  NodeAggregate |
  NodeSetOp |
  NodeFunctionScan |
  NodeTableFunctionScan |
  NodeCTEorWorkTableScan |
  NodeNamedTuplestoreScan |
  NodeResult |
  NodeHash;

type MakeUnspecializedNodes<T> = T extends NodeType ? NodeWithFragments<{"Node Type": T}> : never;

type UnspecializedNode = MakeUnspecializedNodes<Exclude<NodeType, SpecializedNode["Node Type"]>>;

export type Node = SpecializedNode | UnspecializedNode;
