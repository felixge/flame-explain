import React from 'react'
import { HashLink as Link } from 'react-router-hash-link'

export default function Footer() {
  const version = process.env.REACT_APP_VERSION || 'N/A'
  return (
    <footer className="footer">
      <div className="content has-text-centered">
        <p>
          <strong>
            FlameExplain
            <span role="img" aria-label="trademark">
              ™️
            </span>
          </strong>
          &nbsp;version{' '}
          <a target="_new" href="https://github.com/felixge/flame-explain/releases">
            {version}
          </a>
          &nbsp;by{' '}
          <a target="_new" href="https://twitter.com/felixge">
            Felix Geisendörfer
          </a>{' '}
          at fsync GmbH. Licensed under the <Link to={'/about#License'}>AGPLv3</Link>.
        </p>
      </div>
    </footer>
  )
}
