import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Header from './Header';
// import './App.css';
import './index.sass';

const App: React.FC = () => {
  return (
    <Router>
        <Header/>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/docs">
            <Docs />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
    </Router>
  );
}

export default App;

function Home() {
  return (
<div className="App">


  <section className="section">
    <div className="container">
      <div className="field">
        <p>
          Prefix your SQL query with <strong className="is-family-monospace has-text-danger">EXPLAIN (ANALYZE, FORMAT JSON)</strong>
          , execute it, paste the resulting JSON below and then hit <strong><span role="img" aria-label="flame">🔥</span>&nbsp;Explain</strong>.
          </p>
      </div>
      <div className="field">
        <p className="control">
          <textarea className="textarea is-family-monospace" placeholder="Paste your JSON Query Plan here." rows={15}></textarea>
        </p>
      </div>
      <div className="field is-pulled-right">
        <p className="control">
          <Link className="button is-success" to="/flamegraph"><span role="img" aria-label="flame">🔥</span>&nbsp;Explain</Link>
        </p>
      </div>
    </div>
  </section>
  <footer className="footer">
    <div className="content has-text-centered">
      <p>
        <strong>FlameExplain</strong> by <a href="https://felixge.de/">Felix Geisendörfer</a>.
        All rights reserved.
      </p>
    </div>
  </footer>
</div>
  );
}

function About() {
  return <section className="section">
    <div className="container">
      <h1 className="title">About</h1>
    </div>
  </section>;
}

function Docs() {
  return <section className="section">
    <div className="container">
      <h1 className="title">Documentation</h1>
    </div>
  </section>;
}
