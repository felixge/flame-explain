import React from 'react';
import {Page, PageLink} from '../Docs';
import Treetable from './Treetable';
import Flamegraph from './Flamegraph';

const page: Page = {
  name: 'Inspector',
  slug: 'inspector',
  page: () => (
    <React.Fragment>
      <img alt="Inspector Example" src="/docs/inspector.png" width={300} className="is-pulled-right" />

      <p>
        The Inspector allows to you view the details of any node shown in the <PageLink page={Flamegraph} /> or{' '}
        <PageLink page={Treetable} />.
      </p>

      <p>
        At the very top, the title of the inspector is a combination of the <code>&lt;ID&gt; &lt;Label&gt;</code> pair
        that's described in the <PageLink page={Flamegraph} /> docs in more detail.
      </p>

      <p>
        Right below it are some small links that allow you to filter the inspector fields based on a few categories.
        These categories are defined by FlameExplain and do not directly come from PostgreSQL.
      </p>

      <p>
        The first section, called <strong>Favs</strong>, lists all fields that were selected by clicking the star icon
        next to them. The same list of fields is also used as columns in the <PageLink page={Treetable} />. If you like,
        you can also adjust the <strong>order</strong> of the favs by hovering over their value, which causes a set of
        up and down arrows to appear.
      </p>

      <p>
        The fields in the sections below can either come from PostgreSQL or FlamExplain. To find out, simply hover over
        the name of the field you are interested in.
      </p>
    </React.Fragment>
  ),
};

export default page;
