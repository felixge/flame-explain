import React from 'react';
import {Page, PageLink} from '../Docs';
import Heading from '../Heading';
import {hideThreshold} from '../VisualizerFlamegraph';
import Inspector from './Inspector';
import Treetable from './Treetable';

const page: Page = {
  name: 'Flame Graph',
  slug: 'flamegraph',
  page: () => <React.Fragment>
    <p>The Flame Graph tab offers a quick way to identify the slowest parts of your query.</p>

    <img alt="Flame Graph Visualization Example" src="/docs/flamegraph.png" />

    <p>Shown above is an example flame graph. It represents a <strong>tree</strong> with each bar being a node identified by an <code>&lt;ID&gt; &lt;Label&gt;</code> pair. The unique <strong>IDs</strong> are assigned by FlameExplain to simplify talking about specific nodes and have no additional meaning. Node <code>1</code> is the root node, and <code>2</code> and <code>3</code> are its direct children. <code>3</code> is the parent of <code>4</code> and so on.</p>

    <p>The <strong>width</strong> of each bar represents the <code>Total Time</code> spend on this part of the query tree, including its children. The white area below a bar, e.g. below <code>5</code> right next to <code>7</code> indicates the <code>Self Time</code> spent on just the node itself, excluding its children.</p>

    <p><strong>Colors</strong> indicate the <code>Rows X</code> estimation error by the query planner. <strong>Dark blue</strong> are "cold" rows that produced less rows than expected, and <strong>dark red</strong> are "hot" rows that produced more rows than anticipated. <strong>Grey</strong> nodes are good, they indicate no or minimal row estimation error. The colors are interpolated on a log<sub>10</sub> scale from -1000x to +1000x.</p>

    <p>The left to right <strong>order</strong> nodes can have a specific meaning depending on the parent node type, but usually does not indicate order of execution.</p>

    <p>Nodes with a <code>Total Time</code> of less then {hideThreshold * 100}%, e.g. node <code>9</code> that is not shown in the graph above, are hidden by default to prevent the graph from becoming cluttered with unreadable artifacts. You can use the <PageLink page={Treetable} /> to see them.</p>

    <p>Clicking on a node brings up the <PageLink page={Inspector} /> where you can explore it in more detail.</p>

    <Heading level={2}>History</Heading>
    <p><a href="http://www.brendangregg.com/flamegraphs.html" target="_new">Flame graphs</a> are a visualization pioneered by <a href="Brendan Gregg" target="_new">Brendan Gregg</a> in 2011 to understand which call stacks are most frequently occupying a systems CPUs.</p>
    <p>Since PostgreSQL query plans have a hierarchy very similar to that of call stacks, they can also be visualized via Flame Graphs. Tanel Poder described this in <a href="https://tanelpoder.com/posts/visualizing-sql-plan-execution-time-with-flamegraphs/">late 2018</a> and provided an implementation for Oracle. Marcus Gartner followed in <a href="https://github.com/mgartner/pg_flame" target="_new">early 2020</a> with an implementation for PostgreSQL. FlameExplain was released in mid 2020, but the idea and development of it overlap with Gartner's and Poder's releases.</p>
    <p>FlameExplain expands on those previous ideas by implementing a better quirk correction engine that makes it possible to visualize complex queries that contain CTEs and Sub Queries that are part of predicate expressions. It also introduces the idea of using the row estimation error for coloring the nodes in the graph.</p>
    <p>The Flame Graph variant used by FlameExplain may also be called an icicle graph, as it's upside down compared to Gregg's original visualization.</p>
  </React.Fragment>
};

export default page;
