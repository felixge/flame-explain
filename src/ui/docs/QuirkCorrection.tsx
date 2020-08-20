import React from "react"
import { Page, PageLink } from "../Docs"
import Heading from "../Heading"
import Treetable from "./Treetable"
import Flamegraph from "./Flamegraph"
import "katex/dist/katex.min.css"
import { BlockMath, InlineMath } from "react-katex"

const page: Page = {
    name: "Quirk Correction",
    slug: "quirk-correction",
    page: () => (
        <React.Fragment>
            <p>
                After learning the basics about <code>EXPLAIN ANALYZE</code>, you might wonder about why you should
                prefer FlameExplain over directly working with the default text output format, or what makes
                FlameExplain better than similar tools. One answer to this question is that FlameExplain has some of the
                best quirk correction algorithms.
            </p>

            <p>
                This page gives an overview over some of the quirks that exist in PostgreSQL's{" "}
                <code>EXPLAIN ANALYZE</code> output, and how FlameExplain corrects them for you, so that you can focus
                on optimizing your queries rather than studying PostgreSQL internals.
            </p>

            <Heading level={2}>Loops</Heading>
            <p>
                One of the most well-known quirks is how PostgreSQL reports execution time for nodes that are executed
                multiple times as part of a loop. For example, consider the <code>Nested Loop</code> example below.
            </p>
            <pre>
                {`
Nested Loop  (cost=0.00..6890900.50 rows=288060750 width=8) (actual time=0.038..4496.741 rows=10300000 loops=1)
  ->  Seq Scan on users  (cost=0.00..35.50 rows=2550 width=4) (actual time=0.015..0.066 rows=103 loops=1)
  ->  Seq Scan on comments  (cost=0.00..1572.65 rows=112965 width=4) (actual time=0.008..17.542 rows=100000 loops=103)
Planning Time: 0.154 ms
Execution Time: 5315.480 ms
          `.trim()}
            </pre>
            <p>
                An new user might look at the <code>Seq Scan on comments</code> and assume only <code>17.542 ms</code>,
                i.e. <code>0.3%</code> of time is spent on scanning the comments table, so it's not worth optimizing.
                However, this is incorrect. In reality the value represents the average execution time of{" "}
                <code>103</code> loops, so it's really <code>1806.826 ms</code> which is <code>34%</code> of the total
                query time.
            </p>
            <p>
                Since looped node are very common, you should probably rarely prefer plain <code>ANALYZE</code> output
                unless you're very good at mental arithmetic. Luckily you have a wide variety of tools you can use,
                since this quirk seems to be handled by all of them.
            </p>

            <Heading level={2}>CTEs</Heading>
            <p>
                Common table expressions, aka{" "}
                <a href="https://www.postgresql.org/docs/current/queries-with.html" target="_new">
                    WITH Queries
                </a>{" "}
                are a popular SQL feature that can help with breaking up a large query into smaller pieces. However, the
                way that they are implemented and optimized in PostgreSQL can lead to some very unintuitive quirks in
                the <code>EXPLAIN ANALAYZE</code> output. For example consider this query from the PostgreSQL
                documentation:
            </p>
            <pre>
                {`
WITH regional_sales AS (
    SELECT region, SUM(amount) AS total_sales
    FROM orders
    GROUP BY region
), top_regions AS (
    SELECT region
    FROM regional_sales
    WHERE total_sales > (SELECT SUM(total_sales)/10 FROM regional_sales)
)
SELECT region,
       product,
       SUM(quantity) AS product_units,
       SUM(amount) AS product_sales
FROM orders
WHERE region IN (SELECT region FROM top_regions)
GROUP BY region, product;
    `.trim()}
            </pre>
            <p>
                One thing that is interesting about it, is that the <code>regional_sales</code> CTE is being referenced
                two times in other parts of the query. PostgreSQL optimizes this by storing the results of the{" "}
                <code>regional_sales</code> query in memory while executing it for the first time.
            </p>
            <p>
                This can be seen in the <PageLink page={Treetable} /> below where the first scan in node <code>14</code>{" "}
                takes a <code>Actual Total Time</code> of <code>75.6 ms</code>, but the second scan in node{" "}
                <code>10</code> is very fast, taking only <code>5 μs</code>.
            </p>
            <img alt="Tree Table Example for CTE Quirk" src="/docs/quirks-cte.png" />
            <p>
                This is a great optimization, but it creates a quirk in the EXPLAIN output because you end up tracking
                the initial CTE execution time twice. Once in the first CTE Scan in node <code>14</code> and another
                time in the CTE Init Plan node <code>5</code>. Because of this you also end up in a weird situation
                where the sum of the <code>Actual Total Time</code> of the nodes <code>5</code> and <code>11</code> adds
                up to <code>212.1 ms</code>, which exceeds the <code>Actual Total Time</code> of their parent node{" "}
                <code>4</code> which is only <code>180.1 ms</code>.
            </p>
            <p>
                In addition to being confusing to beginners, this quirk also prevents visualizations such as{" "}
                <PageLink page={Flamegraph} />s from working correctly. To solve this problem, FlameExplain derives a
                new <code>Total Time</code> <InlineMath math="S_i'" /> for every CTE Scan based on its{" "}
                <code>Actual Total Time</code> <InlineMath math="S_i" /> using the formula below.{" "}
                <InlineMath math="I" /> is the <code>Actual Total Time</code> of the CTE Init node and{" "}
                <InlineMath math="n" /> is the total number of CTE Scans.
            </p>
            <BlockMath math="S_i' = S_i (1 - \frac{I}{\sum\limits_{j=1}^{n} S_j})" />
            <p>
                The formula assumes that the sum of all CTE Scan times exceeds the CTE Init Plan node by the overhead of
                the CTE Scan operations themselves, and assigns this overhead proportionally as the new{" "}
                <code>Total Time</code> of the CTE Scan nodes.
            </p>
            <p>
                After applying the formula, node <code>14</code> gets adjusted from <code>75.6 ms</code> to{" "}
                <code>14 μs</code> which removes all the duplicate time accounting that was present before. Because the
                correction is propagated up the tree, the sum of node <code>11</code> and <code>5</code> no longer
                exceeds the <code>Total Time</code> of their parent node <code>4</code>. This allows the{" "}
                <PageLink page={Flamegraph} /> visualization to work, but also saves you time when trying to identify
                the bottlenecks of your query.
            </p>
            <p>
                That being said, the approach is not perfect. E.g. node <code>10</code> gets adjusted from{" "}
                <code>5 μs</code> to <code>1 ns</code> here, when it should have probably not changed. But these kind of
                errors end up incredibly small in relation to the query's total time in practice and avoid the need for
                more complicated heuristics. The formula also nicely handles the situation where the first CTE Scan sits
                below a <code>Limit</code> node and the execution of the Init Plan is split between two or more CTE
                Scans.
            </p>
            <p>
                CTE quirk correction is one of the unique features of FlameExplain that is not commonly found in most
                other tools. Anybody worried about quirks in the quirk correction can always pull up the original{" "}
                <code>Actual Total Time</code> next to the new <code>Total Time</code> like shown above.
            </p>

            <Heading level={2}>Even More</Heading>
            <p>
                FlameExplain contains many more quirk correction algorithms to deal with Parallel Queries, Sub Queries
                within WHERE clauses, etc. and makes sure they all play together nicely. They will all eventually be
                documented on this page.
            </p>
        </React.Fragment>
    ),
}

export default page
