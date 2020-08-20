import React from "react"
import { Page, PageLink } from "../Docs"
import Inspector from "./Inspector"
import Flamegraph from "./Flamegraph"
import Heading from "../Heading"
import QuirkCorrection from "./QuirkCorrection"

const page: Page = {
  name: "Tree Table",
  slug: "treetable",
  page: () => (
    <React.Fragment>
      <p>
        The Tree Table is a configurable view that allows you to compare all nodes of your plan using any fields you are
        interested in.
      </p>

      <img alt="Tree Table Visualization Example" src="/docs/treetable.png" />

      <p>
        To <strong>add or remove a column</strong> in the table, simply click on a row to open the{" "}
        <PageLink page={Inspector} /> where you can click on the star next to a field to toggle it. You can also{" "}
        <strong>reorder</strong> the columns in the Inspector itself, or by using the little arrows that appear when you
        hover over the table headers.
      </p>

      <p>
        <strong>Expanding or collapsing</strong> of the children of a node can be done by clicking the plus or minus
        icon left of its <code>Label</code>. You can also hold down shift to do this recursively. For example you could
        shift click on the minus icon next to node <code>5</code> and then click it against without shift which would
        cause only node <code>6</code> and <code>7</code> to reappear. This can be useful for nodes that have many init
        plan children.
      </p>

      <p>
        The <strong>Color</strong> of a column value is assigned on a linear scale from <strong>grey</strong> for the
        lowest value to <strong>dark red</strong> for the highest value in the column. The only exception is the{" "}
        <code>Rows X</code> column which uses the same colors as described in the <PageLink page={Flamegraph} /> docs.
      </p>

      <Heading level={2}>History</Heading>
      <p>
        The Tree Table is heavily inspired by <a href="https://explain.depesz.com/">explain.depesz.com</a> which was
        created by Hubert Lubaczewski in 2008.
      </p>
      <p>
        FlameExplain enhances this classic idea by adding configurable columns, color highlighting, and advanced{" "}
        <PageLink page={QuirkCorrection} />.
      </p>
    </React.Fragment>
  ),
}

export default page
