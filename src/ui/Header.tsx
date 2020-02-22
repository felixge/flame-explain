import React from 'react';
import {Link, NavLink} from "react-router-dom";

export default function Header() {
  return (
    <div>
      <div className="container">
        <nav className="navbar" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <a href="/" className="navbar-item"><span role="img" aria-label="flame">🔥</span>&nbsp;FlameExplain</a>
          </div>

          <div id="navbarBasicExample" className="navbar-menu">
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

            <div className="navbar-end">
              <div className="navbar-item">
              </div>
            </div>
          </div>
        </nav>
      </div>
      <section className="hero is-info is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">FlameExplain</h1>
            <h2 className="subtitle">
              The next generation PostgreSQL EXPLAIN visualizer that <Link to="/about" className="has-text-warning">gets the numbers right</Link>.
        </h2>
          </div>

        </div>
      </section>
    </div>
  );
};
