import React from 'react';
import {Page} from '../Docs';
import {shareElements} from '../VisualizerShare';

const page: Page = {
  name: 'Share',
  slug: 'share',
  page: () => (
    <React.Fragment>
      <img alt="Share Example" src="/docs/share.png" width={500} className="is-pulled-right" />
      <p>The Share Modal allows you to quickly exchange the plan you're currently looking at with your colleagues.</p>
      <p>You can bring up the modal by clicking the Share button on the very right hand side of any visualizer tab.</p>
      <p>
        From there you can either directly copy and paste the <strong>Share JSON</strong> to a colleague, or paste it on
        GitHub and get direct URL for it.
      </p>
      <p>
        The <strong>Share JSON</strong> includes your current {shareElements}.
      </p>
    </React.Fragment>
  ),
};

export default page;
