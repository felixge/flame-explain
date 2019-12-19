import {Query as RQuery, Node as RawNode} from './RawExplain';
import {OptionalEmbed} from './Util';

export type Node = OptionalEmbed<{
  /**
   * True if this node was not present as a node in the original EXPLAIN
   * output, and has been inserted for making the plan more readable.
   **/
  'Virtual': boolean,
  'Label': string,
  // TODO make optional
  'Source': RawNode | RQuery | {},
  'Parent'?: Node,
  // TODO rename to nodes, also make it required
  'Children'?: Node[]
  'CTEParent'?: Node,
  'CTEScans'?: Node[],
  'FilterParent'?: Node,
  'FilterChildren'?: Node[],
  'Warnings'?: string[],
  'Root': boolean,
}, Timing>;

export type Timing = {
  'Self Time': number,
  'Total Time': number,
};

export function query(n: Node, path: Array<string>, i: number = 0): Node {
  let matches = (n.Children || []).filter((n) => n.Label === path[i]);
  i += 1;
  if (matches.length === 1) {
    if (i === path.length) {
      return matches[0]
    }
    return query(matches[0], path, i);
  }
  let pathS = path.slice(0, i).join('->');
  let candidates = (n.Children || []).map((c) => JSON.stringify(c.Label)).join(', ');
  throw new Error(`${matches.length} matches for: ${pathS} in: ${candidates}`);
};

/** Recursively evaluates if any numbers in the given node don't "add up". I.e.
 * returns false if a node's children total time exceeds its own time, or a node's
 * self time exceeds its total time.
 * TODO(fg) evaluate this as a per-node warning.
* */
export function addsUp(n: Node): boolean {
  let childTotal = 0;
  (n.Children || []).forEach(child => {
    if ('Total Time' in child) {
      childTotal += child['Total Time'];
    }
  });

  if ('Total Time' in n) {
    if (n['Self Time'] > n['Total Time'] || n['Total Time'] < childTotal || n['Self Time'] != n['Total Time'] - childTotal) {
      return false;
    }
  }

  return !(n.Children || []).some(child => !addsUp(child));
}
