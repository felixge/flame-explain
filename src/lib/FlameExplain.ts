import {
  RawNode,
  RawQuery,
  RawQueries,
} from './RawExplain';
import {Disjoint, ExtractFieldsOfType} from './Util';
export {flameKeyDescs, flameKeyMeta} from './FlameDocs';

type FlameNodeWithoutColors = Disjoint<
  Omit<RawQuery, "Plan"> & Omit<RawNode, "Plans">,
  FlameFragment
>;

type FlameNodeColorFields = ExtractFieldsOfType<FlameNodeWithoutColors, number>;

type ColorFragment = {[K in FlameNodeColorFields]?: number};

export type FlameNode = FlameNodeWithoutColors & {
  Colors?: ColorFragment
};

export type FlameFragment = {
  /** Kind captures what kind of node this is. Root nodes have only Children
  * and no other properties. */
  "Kind": "Root" | "Queries" | "Query" | "Planning" | "Execution" | "Node" | "Subplan";
  /** ID is a unique identifier present on all nodes except the Root node. */
  "ID"?: number;
  /** Label is a short human-readable description of the node, present for all
  * nodes except the Root node. For Kind=Node the label attempts to be identical
  * to what EXPLAIN (ANALYZE, FORMAT TEXT) would print. */
  "Label"?: string;
  /** Parent points to the parent node, which simplifies some of the transform
   * algorithms. Present for all nodes except the Root node. */
  "Parent"?: FlameNode;
  /** Children is an array children. */
  "Children"?: FlameNode[];
  /** If this node has a "Filter" or "One-Time Filter" that references other
   * nodes in the plan, then they are referenced here. */
  "Filter Nodes"?: FlameNode[];
  /** Similar to "Filter Node" above, this array references all nodes that
   * reference this node in one of their filters. */
  "Filter Refs"?: FlameNode[];
  /** If this node is a "CTE Scan", then the CTE InitPlan that is being scanned
   * is referenced here. */
  "CTE Node"?: FlameNode;
  /** If this node is a CTE InitPlan, then all CTE Scan nodes that use it are
  * referenced here. */
  "CTE Scans"?: FlameNode[];
  /** Total Time is derived from "Actual Total Time" and attempts to represent
   * the total amount of wall clock time that can be attributed to this node
  * as well as its children. */
  "Total Time"?: number;
  "Total Time %"?: number;
  /** Self Time is like Total Time, but excludes time spent in child nodes. */
  "Self Time"?: number;
  /** Self Time % */
  "Self Time %"?: number;
  /** Depth is the depth of the node in the tree, starting with 0. */
  "Depth"?: number;
  /** Rows X is the rows estimation error */
  "Rows X"?: number
  /** Warnings contains a list of problems encountered while transforming the
  * data.*/
  "Warnings"?: [];

  /** TODO: remove */
  "Virtual"?: boolean;
};

export type flameOptions = Partial<{
  /** VirtualQueryNodes produces a virtual node Query node for each query that
   * contains virtual nodes 'Execution Time' and 'Planning Time'. */
  VirtualQueryNodes: boolean;
  /** VirtualSubplanNodes produces virtual nodes for every node that has a
   * "Subplan Name". */
  VirtualSubplanNodes: boolean;
}>;

const defaultOptions: flameOptions = {
  VirtualQueryNodes: true,
  VirtualSubplanNodes: true,
};

/**
 * fromRawQueries converts the given RawQueries into a FlameNode data structure
 * without modifying its inputs.
 */
export function fromRawQueries(
  rqs: RawQueries,
  opt: flameOptions = defaultOptions,
): FlameNode {
  const root: FlameNode = {Kind: "Root"};
  rqs = rqs.filter(rq => rq.Plan);

  let queryRoot = root;
  if (opt.VirtualQueryNodes && rqs.length > 1) {
    queryRoot = {
      Kind: 'Queries',
      Label: 'Queries',
      Parent: root,
    }
    root.Children = [queryRoot];
  }

  rqs.forEach((rq, i) => {
    let query: FlameNode | undefined;
    let parent = queryRoot;
    if (opt.VirtualQueryNodes) {
      query = {
        Kind: 'Query',
        Label: 'Query' + ((rqs.length > 1)
          ? ' ' + (i + 1)
          : ''),
      };
      parent.Children = (parent.Children || []).concat(query);

      const planning: FlameNode = {Kind: "Planning", Label: "Planning"};
      if (rq["Planning Time"]) {
        planning["Planning Time"] = rq["Planning Time"];
      }
      const execution: FlameNode = {Kind: "Execution", Label: "Execution"};
      if (rq["Execution Time"]) {
        execution["Execution Time"] = rq["Execution Time"];
      }
      query.Children = [planning, execution];
      parent = execution;
    }

    const fn = fromRawNode(rq.Plan || {});
    parent.Children = (parent.Children || []).concat(fn);

    /* These must be applied on a per-query basis, the other transforms
    * can be done on the root node below. */
    setParents(query || fn, queryRoot);
    setFilterRefs(fn);
    setCTERefs(fn);
  });

  setTotalTime(root);
  calcActualLoops(root);
  calcFilterTime(root);
  calcCTETime(root);
  calcParallelAppendTime(root)
  calcChildBoost(root);
  setSelfTime(root);
  if (opt.VirtualSubplanNodes) {
    createVirtualSubplanNodes(root);
  }
  setTimePercent(root);
  setIDs(root);
  setDepths(root);
  setRowsX(root);
  setColors(root);

  return root;
};

function fromRawNode(rn: RawNode): FlameNode {
  let fn: FlameNode = {
    Kind: "Node",
    Label: label(rn),
  };

  fn = Object.assign({}, rn, fn);
  fn.Children = rn.Plans?.map(child => fromRawNode(child));
  delete (fn as RawNode).Plans;

  return fn;
}

/** setParents sets the Parent field of all nodes. */
function setParents(fn: FlameNode, parent: FlameNode) {
  fn.Parent = parent;
  fn.Children?.forEach(c => setParents(c, fn));
}

/** setFilterRefs sets the "Filter Node" and "Filter Refs" references
* for this plan.*/
function setFilterRefs(fn: FlameNode, root?: FlameNode) {
  root = root || fn;
  fn.Children?.forEach(c => setFilterRefs(c, root));

  if (!fn["Subplan Name"]) {
    return;
  }

  const sp = parseNumberedSubplanName(fn["Subplan Name"]);
  if (!sp) {
    return;
  }

  // Subplan IDs (contained in Subplan Name) are unique across the whole query
  // [1] so we visit all nodes from the root node to look for nodes that
  // reference this node in a filter condition.
  // [1] https://github.com/postgres/postgres/blob/REL_12_1/src/backend/optimizer/plan/subselect.c#L540
  const visit = (fn2: FlameNode) => {
    fn2.Children?.forEach(visit);

    const filters = [fn2["One-Time Filter"], fn2.Filter];
    // isRef is true if fn2 has filter that references fn's "Subplan Name".
    const isRef = filters.some(f => {
      let refs = f
        ? parseFilter(f)
        : [];
      return refs.some(ref => sp.Returns.includes(ref));
    });

    if (isRef) {
      fn2["Filter Nodes"] = (fn2["Filter Nodes"] || []).concat(fn);
      fn["Filter Refs"] = (fn["Filter Refs"] || []).concat(fn2);
    }
  }
  visit(root);

  return;
}

function setCTERefs(fn: FlameNode) {
  fn.Children?.forEach(setCTERefs);

  if (fn["Node Type"] !== "CTE Scan") {
    return;
  }

  let parent: FlameNode | undefined = fn;
  while (parent) {
    const cteNode = parent.Children?.find(child =>
      child["Parent Relationship"] === "InitPlan" &&
      child["Subplan Name"] === 'CTE ' + fn["CTE Name"])

    if (cteNode) {
      fn["CTE Node"] = cteNode;
      cteNode["CTE Scans"] = (cteNode["CTE Scans"] || []).concat(fn);
      return;
    }

    parent = parent.Parent;
  };
}

function setTotalTime(fn: FlameNode) {
  fn.Children?.forEach(setTotalTime);

  switch (fn.Kind) {
    case "Node":
      if (typeof fn["Actual Total Time"] === 'number') {
        fn["Total Time"] = fn["Actual Total Time"];
      }
      break;
    case "Execution":
      if (typeof fn["Execution Time"] === 'number') {
        fn["Total Time"] = fn["Execution Time"];
      }
      break;
    case "Planning":
      if (typeof fn["Planning Time"] === 'number') {
        fn["Total Time"] = fn["Planning Time"];
      }
      break;
    default:
      let total: number | undefined = undefined;
      fn.Children?.forEach(child => {
        if (typeof child["Total Time"] === 'number') {
          total = (total || 0) + child["Total Time"];
        }
      });

      if (total !== undefined) {
        fn["Total Time"] = total;
      }
      break;
  }

  if (fn["Total Time"] !== undefined) {
    fn["Self Time"] = 0;
  }
}

// TODO(fg) can the gather related logic be separated?
function calcActualLoops(fn: FlameNode, gather: FlameNode | undefined = undefined) {
  if (fn["Node Type"] === 'Gather' && fn["Actual Loops"]) {
    gather = fn;
  }

  fn.Children?.forEach(child => calcActualLoops(child, gather));

  let loops = fn["Actual Loops"];
  if (typeof loops !== 'number' || typeof fn["Total Time"] !== 'number') {
    return;
  } else if (typeof gather?.["Actual Loops"] === 'number') {
    loops = gather["Actual Loops"];
  }

  fn["Total Time"] *= loops;
};

function calcChildBoost(fn: FlameNode) {
  fn.Children?.forEach(calcChildBoost);

  // Due to looped node rounding errors, and in some other cases, our total
  // time above may be smaller than the sum of child node total time. It seems
  // reasonable to adjust for that by making this node's total time to be as
  // big as the sum of its child nodes in this case. However, we don't adjust
  // nodes above and including the 'Execution' node as we trust it more than
  // this heuristic.
  if (typeof fn["Total Time"] !== 'number' ||
    !(fn.Kind === 'Node' || fn.Kind === 'Subplan')) {
    return;
  }

  const childTotal = sumTotalTime(fn.Children);
  if (childTotal > fn["Total Time"]) {
    fn["Total Time"] = childTotal;
  }
}

function calcFilterTime(fn: FlameNode): FlameNode {
  fn.Children?.forEach(calcFilterTime);

  if (!(typeof fn["Total Time"] === 'number' && fn["Filter Refs"])) {
    return fn;
  }

  let initTime = fn["Total Time"];
  let childCount = fn['Filter Refs'].length;
  fn['Filter Refs'].forEach(child => {
    if (typeof child["Total Time"] !== 'number') {
      return
    }
    const delta = initTime / childCount;

    let p: FlameNode | undefined = child;
    while (p) {
      if (p.Children?.find(pc => pc === fn)) {
        return;
      }

      if (typeof p["Total Time"] === 'number') {
        p["Total Time"] -= delta;
      }
      p = p.Parent;
    }
  });

  return fn;
}

function calcCTETime(fn: FlameNode) {
  // We apply our tweaks depth first to all children in reverse order. This
  // makes sure queries like CTELoopedAggregateScan don't end up fixing the
  // time of CTEs if their scans haven't been fixed yet.
  if (fn.Children) {
    for (let i = fn.Children.length - 1; i >= 0; i--) {
      calcCTETime(fn.Children[i]);
    }
  }

  // Return early unless n is a CTE parent node.
  if (!(typeof fn["Total Time"] === 'number' && fn["CTE Scans"])) {
    return;
  }

  let initTime = fn["Total Time"];
  let scanTime = sumTotalTime(fn["CTE Scans"]);

  fn["CTE Scans"].forEach(scan => {
    if (typeof scan["Total Time"] !== 'number') {
      return;
    }

    // Sometimes the CTE Scan is a child of the CTE Node, in this case we
    // must not apply our fancy calculation below. See CTESimple for an
    // example.
    if (scan["CTE Node"]?.Parent === scan) {
      return;
    }

    // s  = CTE Scan Total Time
    // t  = Sum of all scan times for this CTE
    // i  = CTE InitPlan Total Time
    // s' = Real CTE Scan Total Time
    //
    // A single CTE Scan `s` contains all of the time spent on executing its
    // InitPlan `i`. This time duplication is bad because it obscures where a
    // query is spending most of its time. So we try to determine the real scan
    // time `s'`. In the trivial case of one CTE Scan, this could be done as
    // follows:
    //
    // s = i + s'
    // s' = s - i
    //
    // However, this doesn't work when there are multiple CTE Scans, because
    // usually only the first CTE Scan includes the duplicate time. However, if
    // the first CTE Scan is below a Limit node, the duplicate time may be
    // split between multiple CTE Scans. It's not possible to exactly determine
    // each scan's share of the InitPlan execution, but it seems reasonable to
    // assume it's close to `s / t` where `t` is the total time spend on all
    // CTE scans for this CTE. With this assumption we get:
    //
    // s  = s / t * i + s'
    // s' = s * (1 - i / t)
    //
    // This equation is applied below and seems to work very well with a wide
    // range of queries I've tested it against.
    const newTime = scan["Total Time"] * (1 - initTime / scanTime);
    let delta = scan["Total Time"] - newTime;
    scan["Total Time"] = newTime;

    let p = scan.Parent;
    while (p) {
      if (p.Children?.find(pc => pc === fn)) {
        return;
      }

      if (typeof p["Total Time"] === 'number') {
        p["Total Time"] -= delta;
      }
      p = p.Parent;
    }
  });
}

// TODO(fg) can this be combined with gather logic from calcActualLoops
function calcParallelAppendTime(
  fn: FlameNode,
  gather: FlameNode | undefined = undefined,
  scale: number = 1,
) {
  if (fn["Node Type"] === 'Gather' && typeof fn["Total Time"] === 'number') {
    gather = fn;
  }

  if (typeof fn["Total Time"] === 'number' && scale !== 1) {
    fn["Total Time"] *= scale;
  }

  if (
    fn["Node Type"] === 'Append'
    && fn["Parallel Aware"]
    && typeof gather?.["Total Time"] === 'number'
  ) {
    scale = gather["Total Time"] / sumTotalTime(fn.Children);
  }

  fn.Children?.forEach(child => calcParallelAppendTime(child, gather, scale));
};

function sumTotalTime(nodes?: FlameNode[]): number {
  let total = 0;
  nodes?.forEach(fn => {
    if (typeof fn["Total Time"] === 'number') {
      total += fn['Total Time'];
    }
  });
  return total;
}

function setSelfTime(fn: FlameNode) {
  fn.Children?.forEach(setSelfTime);

  if (typeof fn["Total Time"] !== 'number') {
    return;
  }

  fn["Self Time"] = fn["Total Time"] - sumTotalTime(fn.Children);
}

function setTimePercent(root: FlameNode) {
  const rootTotal = root["Total Time"];
  if (typeof rootTotal !== 'number') {
    return
  }

  const visit = (fn: FlameNode) => {
    if (typeof fn["Total Time"] === 'number') {
      fn["Total Time %"] = fn["Total Time"] / rootTotal;
    }
    if (typeof fn["Self Time"] === 'number') {
      fn["Self Time %"] = fn["Self Time"] / rootTotal;
    }
    fn.Children?.forEach(visit);
  }
  root.Children?.forEach(visit);
}

function setIDs(root: FlameNode) {
  let id = 0;
  const visit = (fn: FlameNode) => {
    fn.ID = ++id;
    fn.Children?.forEach(visit);
  }
  root.Children?.forEach(visit);
}

function setDepths(root: FlameNode) {
  let maxDepth = 0;
  const visit = (fn: FlameNode, depth: number = 0) => {
    fn.Depth = depth;
    maxDepth = Math.max(maxDepth, depth);
    fn.Children?.forEach(child => visit(child, depth + 1));
  }
  root.Children?.forEach(visit);
}

function setRowsX(root: FlameNode) {
  const visit = (fn: FlameNode, depth: number = 0) => {
    if (typeof fn["Plan Rows"] === 'number' && typeof fn["Actual Rows"] === 'number') {
      if (fn["Actual Rows"] >= fn["Plan Rows"]) {
        fn["Rows X"] = fn["Actual Rows"] / fn["Plan Rows"];
      } else {
        fn["Rows X"] = -fn["Plan Rows"] / fn["Actual Rows"];
      }
    }
    fn.Children?.forEach(child => visit(child, depth + 1));
  }
  root.Children?.forEach(visit);
}

function setColors(root: FlameNode) {
  const maxVals = maxValsForColor(root) || {};
  const visit = (fn: FlameNode) => {
    fn.Colors = {};
    const keys = Object.keys(maxVals).map(key => key as keyof typeof maxVals);
    keys.forEach(key => {
      if (key === 'ID') {
        return;
      }

      const val = fn[key];
      if (fn.Colors) {
        fn.Colors[key] = 0;
      }
      if (typeof val === 'number' && fn.Colors && maxVals) {
        const maxVal = maxVals[key] || 0;
        if (maxVal > 0) {
          fn.Colors[key] = val / maxVal;
        }
      }
    });
    fn.Children?.forEach(visit);
  }
  root.Children?.forEach(visit);
}

function maxValsForColor(root: FlameNode): ColorFragment {
  let maxVals: ColorFragment = {};
  const visit = (fn: FlameNode) => {
    const keys = Object.keys(fn).map(key => key as keyof typeof maxVals);
    keys.forEach(key => {
      const val = fn[key];
      if (typeof val === 'number') {
        const maxVal = maxVals[key] || 0;
        maxVals[key] = Math.max(maxVal, val);
      }
    });

    fn.Children?.forEach(visit);
  }
  root.Children?.forEach(visit);
  return maxVals;
}



function createVirtualSubplanNodes(fn: FlameNode): FlameNode {
  if (fn.Children) {
    fn.Children = fn.Children.map(createVirtualSubplanNodes);
  }

  if (!fn["Subplan Name"]) {
    return fn;
  }

  const sn: FlameNode = {
    Kind: "Subplan",
    Label: fn["Subplan Name"],
    Children: [fn],
  };
  if (fn.Parent) {
    sn.Parent = fn.Parent;
  }
  if (typeof fn["Total Time"] === 'number') {
    sn["Total Time"] = fn["Total Time"];
    sn["Self Time"] = 0;
  }
  fn.Parent = sn;

  return sn;
}


/**
 * parseNumberedSubplanName parse the given "Subplan Name" string, see [1][2]
 *
 * Example Input: "InitPlan 1 (returns $0)"
 *
 * [1] https://github.com/postgres/postgres/blob/REL_12_1/src/backend/optimizer/plan/subselect.c#L2909
 * [2] https://github.com/postgres/postgres/blob/REL_12_1/src/backend/optimizer/plan/subselect.c#L556-L572
 */
export function parseNumberedSubplanName(name: string): subplanName | undefined {
  const m = name.match(/^([^ ]+) (\d+) \(returns ([^)]+)\)$/);
  if (!m) {
    return;
  }

  const returns = m[3].split(',').map(dollarID => {
    return parseInt(dollarID.substr(1), 10);
  });

  return {
    Type: m[1],
    ID: parseInt(m[2], 10),
    Returns: returns,
  };
}

type subplanName = {
  Type: string;
  ID: number;
  Returns: number[];
};

/**
 * parseFilter parses a filter expression as found in "Filter" or "One-Time
 * Filter" and returns a list of all plan id references.
 *
 * TODO: The function won't work correctly if the filter contains identifiers
 * that look like plan id references, but fixing this would require complicated
 * parsing.
 */
export function parseFilter(filter: string): number[] {
  return (filter.match(/\$\d+/g) || []).map(ref => parseInt(ref.substr(1), 10));
}

/**
 * label attempts to derrive the text node name from a RawNode in the same way
 * EXPLAIN ANALYZE (FORMAT TEXT) would print it. In some cases the text output
 * of EXPLAIN contains information that is not contained in the JSON output
 * (e.g. for Custom Scan), so this function isn't perfect.
 *
 * See https://github.com/postgres/postgres/blob/REL_12_0/src/backend/commands/explain.c#L1044
 */
export function label(n: RawNode): string {
  let pname: string;
  switch (n["Node Type"]) {
    case 'Aggregate':
      pname = 'Aggregate ???';
      switch (n.Strategy) {
        case 'Plain':
          pname = 'Aggregate';
          break;
        case 'Sorted':
          pname = 'GroupAggregate';
          break;
        case 'Hashed':
          pname = 'HashAggregate';
          break;
        case 'Mixed':
          pname = 'MixedAggregate';
          break
      }
      if (n["Partial Mode"] && n["Partial Mode"] !== 'Simple') {
        pname = n["Partial Mode"] + ' ' + pname;
      }
      break;
    case 'Foreign Scan':
      if (n.Operation) {
        if (n.Operation === 'Select') {
          pname = 'Foreign Scan'
        } else {
          pname = 'Foreign ' + n.Operation
        }
      } else {
        pname = '???'
      }
      break;
    case 'ModifyTable':
      if (n.Operation !== undefined) {
        pname = n.Operation
      } else {
        pname = '???'
      }
      break;
    case 'Merge Join':
      pname = 'Merge';
      break;
    case 'Hash Join':
      pname = 'Hash';
      break;
    case 'SetOp':
      pname = 'SetOp ???';
      switch (n.Strategy) {
        case 'Sorted':
          pname = 'SetOp';
          break;
        case 'Hashed':
          pname = 'HashedSetOp';
          break;
      }
      pname += ' ' + n.Command
      break;
    default:
      pname = n["Node Type"] || '???';
      break;
  }

  if (n["Join Type"]) {
    if (n["Join Type"] !== 'Inner') {
      pname += ' ' + n['Join Type'] + ' Join';
    } else if (n["Node Type"] !== 'Nested Loop') {
      pname += ' Join';
    }
  }

  if (n["Parallel Aware"]) {
    pname = 'Parallel ' + pname;
  }

  if (n["Scan Direction"] !== undefined) {
    if (n["Scan Direction"] === 'Backward') {
      pname += ' ' + n["Scan Direction"];
    }
    pname += ' using ' + n["Index Name"];
  } else if (n["Index Name"]) {
    pname += ' on ' + n["Index Name"];
  }

  let objectname = '';
  if (n["Relation Name"] !== undefined) {
    objectname = n["Relation Name"];
  } else if (n["Function Name"] !== undefined) {
    objectname = n["Function Name"];
  } else if (n["Table Function Name"] !== undefined) {
    objectname = n["Table Function Name"];
  } else if (n["CTE Name"] !== undefined) {
    objectname = n["CTE Name"];
  } else if (n["Tuplestore Name"] !== undefined) {
    objectname = n["Tuplestore Name"];
  }

  if (objectname) {
    pname += ' on '
    if (n.Schema !== undefined) {
      pname += quoteIdentifier(n.Schema) + '.' + quoteIdentifier(objectname);
    } else {
      pname += quoteIdentifier(objectname);
    }
    if (n.Alias && n.Alias !== objectname) {
      pname += ' ' + n.Alias;
    }
  }

  return pname;
}

/** TODO: Implement this! */
function quoteIdentifier(s: string): string {
  return s;
}

export type FlameKey = keyof FlameNode;

export function nodeByID(root: FlameNode | undefined, id: number | undefined): FlameNode | undefined {
  if (root === undefined || id === undefined) {
    return;
  }

  let found: FlameNode | undefined = undefined;
  const visit = (fn: FlameNode) => {
    if (fn.ID === id) {
      found = fn;
      return;
    }
    fn.Children?.forEach(visit);
  }
  root.Children?.forEach(visit);
  return found;
}
