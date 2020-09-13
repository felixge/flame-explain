import React from 'react';
import {NavLink} from 'react-router-dom';
import 'github-fork-ribbon-css/gh-fork-ribbon.css';

export default function Header() {
  let [burgerMenu, setBurgerMenu] = React.useState(false);

  return (
    <div>
      <div className="notification is-warning is-marginless">
        This project is currently soft launched to collect feedback from a small group of people. It's not ready for
        public promotion yet.
      </div>
      <nav className="navbar is-info" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a href="/" className="navbar-item">
            <span role="img" aria-label="flame">
              🔥
            </span>
            &nbsp;FlameExplain
          </a>
          <a
            role="button"
            className={'navbar-burger' + (burgerMenu ? ' is-active' : '')}
            aria-label="menu"
            aria-expanded="false"
            href="# "
            onClick={() => setBurgerMenu(s => !s)}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div className={'navbar-menu' + (burgerMenu ? ' is-active' : '')}>
          <div className="navbar-start">
            <NavLink
              activeClassName="is-active"
              to="/visualize/input"
              className="navbar-item"
              isActive={(_, {pathname}) => pathname.startsWith('/visualize')}
            >
              Visualize
            </NavLink>
            <NavLink
              activeClassName="is-active"
              to="/docs/general/getting-started"
              isActive={(_, {pathname}) => pathname.startsWith('/docs')}
              className="navbar-item"
            >
              Docs
            </NavLink>
            <NavLink activeClassName="is-active" to="/about" className="navbar-item">
              About
            </NavLink>
            <div className="navbar-item is-size-7">
              A PostgreSQL EXPLAIN ANALYZE visualizer with advanced quirk correction algorithms.
            </div>
          </div>
        </div>
        <a
          target="_new"
          className="github-fork-ribbon"
          href="https://github.com/felixge/flame-explain"
          data-ribbon="Fork me on GitHub"
          title="Fork me on GitHub"
        >
          Fork me on GitHub
        </a>
      </nav>
    </div>
  );
}
