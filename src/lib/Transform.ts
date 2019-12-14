import {Queries, Node as RNode} from './RawExplain';
import {Node as FNode} from './FlameExplain';
import {formatDuration} from './Util';

type virtualNodeOptions = {
  label: string;
  children: FNode[];
  totalTime?: number;
  selfTime?: number;
  source?: FNode;
}

function virtualNode(o: virtualNodeOptions): FNode {
  const totalTime = (o.totalTime !== undefined)
    ? o.totalTime
    : o.children.reduce((acc, child) => {
      return ('Total Time' in child)
        ? acc + child['Total Time']
        : 0;
    }, 0);

  return {
    "Label": o.label,
    "Virtual": true,
    "Source": o.source || {},
    "Self Time": 0,
    "Total Time": totalTime,
    "Children": o.children,
  };
}

export function transformQueries(queries: Queries): FNode {
  let root = virtualNode({
    label: 'Queries',
    children: queries.map((query, i) => {
      let children: FNode[] = [];
      if ('Execution Time' in query) {
        //let ctes = extractCTEs(query.Plan);

        children = [
          virtualNode({
            label: 'Planning',
            totalTime: query['Planning Time'],
            children: [],
          }),
          virtualNode({
            label: 'Execution',
            totalTime: query['Execution Time'],
            children: [rawToFlame(query.Plan)],
          }),
        ]
      }

      let queryNode = virtualNode({
        label: 'Query ' + (i + 1),
        children: children,
      });

      return queryNode;
    }),
  });

  // Most of the time we'll only have a single query, so we can get rid of the
  // top level "Queries" node and avoid numbering the queries.
  if (root.Children && root.Children.length === 1) {
    root = root.Children[0];
    root.Label = 'Query';
  }

  root = setParents(root);
  root = setFilterParents(root);
  root = setCTEParents(root);
  root = calcFilterTime(root);
  root = calcCTETime(root);
  root = virtualNodes(root);
  root = calcSelfTime(root);
  root = addWarnings(root);

  return root
}

function rawToFlame(p: RNode): FNode {
  let totalTime = 0;
  if ('Actual Total Time' in p) {
    totalTime = p['Actual Total Time'];
  }
  if ('Actual Loops' in p) {
    totalTime *= p["Actual Loops"];
  }

  let fnode: FNode = {
    "Label": textNodeName(p),
    "Source": p,
    "Virtual": false,
    "Self Time": totalTime,
    "Total Time": totalTime,
  }

  if (p.Plans) {
    fnode.Children = (p.Plans).map(rawToFlame);
  }


  return fnode;
}

function addWarnings(n: FNode): FNode {
  if (!('Total Time' in n)) {
    return n;
  }

  let childTotal = 0;
  (n.Children || []).forEach(child => {
    if ('Total Time' in child) {
      childTotal += child['Total Time'];
    }
    addWarnings(child);
  });

  let selfDelta = Math.abs(n['Total Time'] - (childTotal + n['Self Time']));
  if (childTotal > n['Total Time']) {
    n.Warnings = (n.Warnings || []).concat('The children of this node have a cumulative total time exceeding this node\'s total time.');
  } else if (selfDelta > 0.001) {
    n.Warnings = (n.Warnings || []).concat('The self time of this node is off by ' + formatDuration(selfDelta));
  }

  return n;
}

function calcSelfTime(n: FNode): FNode {
  if (!('Total Time' in n)) {
    return n;
  }

  let childTotal = 0;
  (n.Children || []).forEach(child => {
    if ('Total Time' in child) {
      childTotal += child['Total Time'];
    }
    calcSelfTime(child);
  });
  n['Self Time'] = n['Total Time'] - childTotal

  return n;
}

function virtualNodes(n: FNode): FNode {
  n.Children = (n.Children || []).map(virtualNodes);

  let {Source: s} = n;
  if ('Subplan Name' in s && s['Subplan Name']) {
    n = virtualNode({
      label: s["Subplan Name"],
      children: [n],
    });
  }

  return n;
}

function setParents(n: FNode, parent: FNode | undefined = undefined): FNode {
  n.Parent = parent;
  (n.Children || []).forEach(child => setParents(child, n));
  return n;
}


function setFilterParents(n: FNode): FNode {
  (n.Children || []).forEach(setFilterParents);

  const filters: string[] = [];
  const ns = n.Source;
  if ('Filter' in ns && ns.Filter) {
    filters.push(ns.Filter);
  }
  if ('One-Time Filter' in ns && ns["One-Time Filter"]) {
    filters.push(ns["One-Time Filter"]);
  }
  if (!filters.length) {
    return n;
  }

  const ids: {[key: string]: boolean} = {};
  filters.forEach(filter => {
    (filter.match(/\$\d+/g) || []).forEach(id => {
      ids[id] = true;
    });
  });

  for (const id in ids) {
    // Note: The InitPlan for our node's filter might be a direct child of
    // this node.
    let p: FNode | undefined = n;
    while (p) {
      let parent = (p.Children || []).find(pc => {
        const pcs = pc.Source;
        return 'Parent Relationship' in pcs
          && pcs["Parent Relationship"] === 'InitPlan'
          && (pcs["Subplan Name"] || '').includes('(returns ' + id + ')');
      });

      if (parent) {
        n.FilterParent = parent;
        parent.FilterChildren = (parent.FilterChildren || []).concat(n);
        break;
      }

      p = p.Parent;
    }

    if (!n.FilterParent) {
      n.Warnings = (n.Warnings || []).concat(
        'Could not find parent filter node returning ' + id + '.'
      );
    }
  }

  return n;
}

function calcFilterTime(n: FNode): FNode {
  (n.Children || []).forEach(calcFilterTime);

  if (!('Total Time' in n && n.FilterChildren)) {
    return n;
  }

  let initTime = n["Total Time"];
  let childCount = n.FilterChildren.length;
  n.FilterChildren.forEach(child => {
    if (!('Total Time' in child)) {
      return
    }
    const delta = initTime / childCount;

    let p: FNode | undefined = child;
    while (p) {
      if ((p.Children || []).find(pc => pc === n)) {
        return n;
      }

      if ('Total Time' in p) {
        p["Total Time"] -= delta;
      }
      p = p.Parent;
    }
  });

  return n;
}

function setCTEParents(n: FNode): FNode {
  (n.Children || []).forEach(setCTEParents);

  const ns = n.Source;
  if (!('Node Type' in ns && ns["Node Type"] === 'CTE Scan')) {
    return n;
  }

  let p: FNode | undefined = n;
  while (p) {
    let parent = (p.Children || []).find(pc => {
      const pcs = pc.Source;
      return 'Parent Relationship' in pcs
        && pcs["Parent Relationship"] === 'InitPlan'
        && pcs["Subplan Name"] === 'CTE ' + ns["CTE Name"];
    });

    if (parent) {
      n.CTEParent = parent;
      parent.CTEScans = (parent.CTEScans || []).concat(n);
      return n;
    }

    p = p.Parent;
  }

  n.Warnings = (n.Warnings || []).concat('Could not find parent CTE node.');

  return n;
}

function calcCTETime(n: FNode): FNode {
  (n.Children || []).forEach(calcCTETime);

  // Return early unless n is a CTE parent node.
  if (!('Total Time' in n && n.CTEScans)) {
    return n;
  }

  let initTime = n["Total Time"];
  let scanTime = 0;
  (n.CTEScans || []).forEach(scan => {
    if ('Total Time' in scan) {
      scanTime += scan["Total Time"]
    }
  });

  (n.CTEScans || []).forEach(scan => {
    if (!('Total Time' in scan)) {
      return
    }

    // Sometimes the CTE Scan is a child of the CTEParent, in this case we must
    // not apply our fancy calculation below. See CTESimple for an example.
    if (scan.CTEParent && scan.CTEParent.Parent === scan) {
      return;
    }

    let before = scan["Total Time"];
    scan["Total Time"] *= (1 - 1 / scanTime * initTime);
    let delta = before - scan["Total Time"];

    let p = scan.Parent;
    while (p) {
      if ((p.Children || []).find(pc => pc === n)) {
        return n;
      }

      if ('Total Time' in p) {
        p["Total Time"] -= delta;
      }
      p = p.Parent;
    }
  });

  return n;
}

/**
 * Attempts to derrive the text node name from a JSON PlanNode. In some cases
 * the text output of EXPLAIN contains information that is not contained in
 * the JSON output (e.g. for Custom Scan), so this function isn't perfect.
 * See https://github.com/postgres/postgres/blob/REL_12_0/src/backend/commands/explain.c#L1044
 * @param n 
 */
export function textNodeName(n: RNode): string {
  let pname: string;
  switch (n["Node Type"]) {
    case 'Aggregate':
      pname = 'Aggregate ???';
      if ('Strategy' in n) {
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
      }
      if ('Partial Mode' in n && n["Partial Mode"] && n["Partial Mode"] !== 'Simple') {
        pname = n["Partial Mode"] + ' ' + pname;
      }
      break;
    case 'Foreign Scan':
      if ('Operation' in n && n.Operation) {
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
      if ('Operation' in n && n.Operation) {
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
      if ('Strategy' in n) {
        switch (n.Strategy) {
          case 'Sorted':
            pname = 'SetOp';
            break;
          case 'Hashed':
            pname = 'HashedSetOp';
            break;
        }
        pname += ' ' + n.Command
      }
      break;
    default:
      pname = n["Node Type"];
      break;
  }

  if ('Join Type' in n) {
    if (n["Join Type"] !== 'Inner') {
      pname += ' ' + n['Join Type'] + ' Join';
    } else if (n["Node Type"] !== 'Nested Loop') {
      pname += ' Join';
    }
  }

  if (n["Parallel Aware"]) {
    pname = 'Parallel ' + pname;
  }

  if ('Scan Direction' in n) {
    if (n["Scan Direction"] === 'Backward') {
      pname += ' ' + n["Scan Direction"];
    }
    pname += ' using ' + n["Index Name"];
  } else if ('Index Name' in n) {
    pname += ' on ' + n["Index Name"];
  }

  let objectname = '';
  if ('Relation Name' in n) {
    objectname = n["Relation Name"];
  } else if ('Function Name' in n) {
    objectname = n["Function Name"];
  } else if ('Table Function Name' in n) {
    objectname = n["Table Function Name"];
  } else if ('CTE Name' in n) {
    objectname = n["CTE Name"];
  } else if ('Tuplestore Name' in n) {
    objectname = n["Tuplestore Name"];
  }

  if (objectname) {
    pname += ' on '
    if ('Schema' in n && n.Schema) {
      pname += quoteIdentifier(n.Schema) + '.' + quoteIdentifier(objectname);
    } else {
      pname += quoteIdentifier(objectname);
    }
    if ('Alias' in n && n.Alias && n.Alias !== objectname) {
      pname += ' ' + n.Alias;
    }
  }

  return pname;
}

/** TODO: Implement this! */
function quoteIdentifier(s: string): string {
  return s;
}
