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
     * */
    'Virtual': boolean,
    'Label': string,
    'Source': ExplainNode | PlanRoot,
    'Children'?: Node[]
}, Timing>;
