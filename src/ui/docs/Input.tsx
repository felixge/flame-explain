import React from 'react';
import { Page, PageLink } from '../Docs';
import Heading from '../Heading';
import { explainPrefix } from '../VisualizerInput';
import Flamegraph from './Flamegraph';
import Treetable from './Treetable';
import Inspector from './Inspector';
import Share from './Share';

const page: Page = {
  name: 'Input',
  slug: 'input',
  page: () => (
    <React.Fragment>
      <p>The input tab is the starting point for any query optimization.</p>

      <Heading level={2}>Pick An Example Query</Heading>
      <p>
        If you don't have a query to optimize right now, you can use the drop down to pick a sample query. Most of the
        examples are currently quite artificial, and intended to show specific PostgreSQL quirks that FlameExplain can
        handle.
      </p>
      <p>
        However, it would be nice to add more real-world queries, so please{' '}
        <a target="_new" href="https://github.com/felixge/flame-explain/issues/new">
          reach out
        </a>{' '}
        if you have any interesting queries you're willing to share.
      </p>

      <Heading level={2}>Analyze Your Own Query</Heading>
      <p>
        In order to analyze your own query, you have to prefix it with <code>{explainPrefix}</code> and run it via your
        PostgreSQL client. For example:
      </p>
      <pre>{explainPrefix + '\nSELECT * FROM pg_indexes;'}</pre>
      <p>
        <strong>Protip:</strong> The prefix is also shown on the input tab itself, and you can simply click it to copy
        it to your clipboard.
      </p>
      <p>
        If your query takes forever to run, you can also remove the <code>ANALYZE</code> option from the prefix. When
        you do this, the <PageLink page={Flamegraph} /> visualization won't work, but you can still use{' '}
        <PageLink page={Treetable} /> to explore your plan.
      </p>
      <p>
        FlameExplain currently doesn't support the default <code>EXPLAIN (FORMAT TEXT)</code> output format, but this
        might be added in the future.
      </p>

      <Heading level={2}>JSON Input</Heading>
      <p>
        Once you've executed your query with the <code>EXPLAIN</code> prefix, you should copy the resulting JSON to you
        clipboard and then paste it into the JSON textarea on the left side of the input tab.
      </p>
      <p>
        This will take you directly to the <PageLink page={Flamegraph} /> tab where you can start analyzing your query.
      </p>
      <p>
        Alternatively you can also paste the JSON somebody has shared with you via the <PageLink page={Share} /> modal
        into the input tab.
      </p>
      <p>
        <strong>Protip:</strong> You can press Cmd+V on any of the visualizer tabs to update the input JSON without
        having to go back to the input tab.
      </p>

      <Heading level={2}>SQL Input</Heading>
      <p>
        On the right hand side, next to the JSON Input, you can also paste the SQL that was used to produce your query
        plan. This SQL query will show up on the bottom of the <PageLink page={Flamegraph} /> and{' '}
        <PageLink page={Treetable} /> for your convenience, but doesn't serve any functional role.
      </p>
      <p>
        The SQL is also included when you use the <PageLink page={Share} /> feature, so it's highly recommended to
        populate it when exchanging plans with collaborators.
      </p>

      <Heading level={2}>Clear Data vs Reset Settings & Data</Heading>
      <p>
        The Clear Data button on the input tab allows you to quickly clear out the current query plan JSON and SQL, but
        doesn't change your currently configured <PageLink page={Inspector} /> favorites.
      </p>
      <p>
        The Reset Settings & Data button completely wipes all local state that FlameExplain has stored in your browser.
        It can be used to go back to the default <PageLink page={Inspector} /> favorites, or to get rid of all data for
        privacy reasons.
      </p>
    </React.Fragment>
  ),
};

export default page;
