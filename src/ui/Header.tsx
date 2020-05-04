import React from 'react';
import {NavLink} from "react-router-dom";
import "github-fork-ribbon-css/gh-fork-ribbon.css";

export default function Header() {
  let [burgerMenu, setBurgerMenu] = React.useState(false);

  return (
    <nav className="navbar is-info" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a href="/" className="navbar-item"><span role="img" aria-label="flame">🔥</span>&nbsp;FlameExplain</a>
        <a
          role="button"
          className={"navbar-burger" + (burgerMenu ? ' is-active' : '')}
          aria-label="menu"
          aria-expanded="false"
          onClick={() => setBurgerMenu(s => !s)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div className={"navbar-menu" + (burgerMenu ? ' is-active' : '')}>
        <div className="navbar-start">
          <NavLink
            activeClassName="is-active"
            to="/visualize/input"
            className="navbar-item"
            isActive={(_, {pathname}) => pathname.startsWith('/visualize')}
          >Visualize</NavLink>
          <NavLink activeClassName="is-active" to="/docs" className="navbar-item">Documentation</NavLink>
          <NavLink activeClassName="is-active" to="/about" className="navbar-item">About</NavLink>
        </div>
      </div>
      <a target="_new" className="github-fork-ribbon" href="https://github.com/felixge/flame-explain" data-ribbon="Fork me on GitHub" title="Fork me on GitHub">Fork me on GitHub</a>
    </nav>
  );
};
