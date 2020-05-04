import React from 'react';

export default function Footer() {
  const version = process.env.REACT_APP_VERSION || 'N/A';
  return (
    <footer className="footer">
      <div className="content has-text-centered">
        <p>
          <strong>FlameExplain<span role="img" aria-label="trademark">™️</span></strong>
          &nbsp;version <a href="https://github.com/felixge/flame-explain/releases">{version}</a>
          &nbsp;by <a href="https://felixge.de/">Felix Geisendörfer</a> at fsync GmbH.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
};
