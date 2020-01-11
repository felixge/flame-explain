import {RawNode, RawQuery, RawQueries} from './RawExplain';
import {Disjoint} from './Util';

export type FlameNode = Disjoint<
  Omit<RawQuery, "Plan"> & Omit<RawNode, "Plans">,
  FlameFragment
>;

type FlameFragment = {
  /** Kind captures what kind of node this is. Root nodes have only Children
  * and no other properties. */
  "Kind": "Root" | "Query" | "Execution" | "Planning" | "Node";

  /** ID is a unique identifier present on all nodes except the Root node. */
  "ID"?: number;

  /** Label is a short human-readable description of the node, present for all
  * nodes except the Root node. */
  "Label"?: string;

  /** Parent points to the parent node, which simplifies some of the transform
   * algorithms. Present for all nodes except the Root node. */
  "Parent"?: FlameNode;
  /** Children is an array children. */
  "Children"?: FlameNode[];

  "Filter Parent"?: FlameNode;
  "Filter Children"?: FlameNode[];

  //"Virtual"?: boolean;
  //"Warnings"?: string[];
  //"Self Time"?: number;
  //"Total Time"?: number;



  //"CTEParent"?: FlameNode;
  //"CTEScans"?: FlameNode[];
  //"FilterParent"?: FlameNode;
  //"FilterChildren"?: FlameNode[];
};

export type flameOptions = Partial<{
  VirtualQueryNodes: boolean,
}>;

const defaultOptions: flameOptions = {
  /** VirtualQueryNodes produces a virtual node Query node for each query that
   * contains virtual nodes 'Execution Time' and 'Planning Time'. */
  VirtualQueryNodes: true,
};

/**
 * fromRawQueries converts the given RawQueries into a FlameNode data structure
 * without modifying its inputs.
 */
export function fromRawQueries(
  rqs: RawQueries,
  opt: flameOptions = defaultOptions,
): FlameNode {
  let id = 0;
  const nextNode = (fn: FlameNode): FlameNode => Object.assign(fn, {ID: ++id});

  const root: FlameNode = {Kind: "Root"};
  rqs.forEach((rq, i) => {
    let parent = root;
    if (opt.VirtualQueryNodes) {
      const query = nextNode({
        Kind: 'Query',
        Label: 'Query' + ((rqs.length > 1)
          ? ' ' + (i + 1)
          : ''),
      });

      parent.Children = (parent.Children || []).concat(query);
      parent = query;

      const planning = nextNode({Kind: "Planning", Label: "Planning"});
      const execution = nextNode({Kind: "Execution", Label: "Execution"});
      parent.Children = [planning, execution];

      parent = execution;
    }

    if (rq.Plan) {
      const firstNode = fromRawNode(rq.Plan || {}, nextNode);
      parent.Children = (parent.Children || []).concat(firstNode);
    }

    setFilterRefs(parent);
  });

  setParents(root);

  return root;
};

function fromRawNode(
  rn: RawNode,
  nextNode: (fn: FlameNode) => FlameNode
): FlameNode {
  let fn = nextNode({
    Kind: "Node",
    Label: label(rn),
  });

  fn = Object.assign({}, rn, fn);
  fn.Children = rn.Plans?.map(child => fromRawNode(child, nextNode));
  delete (fn as RawNode).Plans;

  return fn;
}

/** setParents sets the Parent field of all nodes. */
function setParents(fn: FlameNode, parent?: FlameNode): FlameNode {
  if (parent) {
    fn.Parent = parent;
  }
  fn.Children?.forEach(c => setParents(c, fn));
  return fn;
}

/** setFilterRefs sets the "Filter Parent" and "Filter Children" references
* for this plan.*/
function setFilterRefs(fn: FlameNode, root?: FlameNode): FlameNode {
  root = root || fn;
  fn.Children?.forEach(c => setFilterRefs(c, root));

  if (!fn["Subplan Name"]) {
    return fn;
  }

  const sp = parseSubplanName(fn["Subplan Name"]);
  if (!sp) {
    return fn;
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
      fn2["Filter Parent"] = fn;
      fn["Filter Children"] = (fn["Filter Children"] || []).concat(fn2);
    }
  }
  visit(root);

  return fn;
}


/**
 * parseSubplanName parse the given "Subplan Name" string, see [1][2].
 *
 * [1] https://github.com/postgres/postgres/blob/REL_12_1/src/backend/optimizer/plan/subselect.c#L2909
 * [2] https://github.com/postgres/postgres/blob/REL_12_1/src/backend/optimizer/plan/subselect.c#L556-L572
 */
export function parseSubplanName(name: string): subplanName | undefined {
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
