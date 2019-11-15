import { PlanRoot, Node as ExplainNode } from './ExplainJSON';
import { OptionalEmbed } from './Util';

export type Timing = {
    'Exclusive Time': number,
    'Inclusive Time': number,    
};

export type Node = OptionalEmbed<{
    /**
     * True if this node was not present as a node in the original EXPLAIN
     * output, and has been inserted for making the plan more readable.
     **/
    'Virtual': boolean,
    'Label': string,
    'Source': ExplainNode | PlanRoot,
    'Children'?: Node[]
}, Timing>;

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
