import React from 'react';
import {NavLink} from "react-router-dom";

export default function Header() {
  return (
    <nav className="navbar is-info" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a href="/" className="navbar-item"><span role="img" aria-label="flame">🔥</span>&nbsp;FlameExplain</a>
      </div>

      <div className="navbar-menu">
        <div className="navbar-start">
          <NavLink
            activeClassName="is-active"
            to="/visualize/input"
            className="navbar-item"
            isActive={(_, {pathname}) => pathname.startsWith('/visualize')}
          >Visualize</NavLink>
          <NavLink activeClassName="is-active" to="/docs" className="navbar-item">Documentation</NavLink>
          <NavLink activeClassName="is-active" to="/about" className="navbar-item">About</NavLink>
          <NavLink activeClassName="is-active" to="/credits" className="navbar-item">Credits</NavLink>
        </div>
      </div>
    </nav>
  );
};
