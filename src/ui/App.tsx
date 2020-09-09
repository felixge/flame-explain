import React from 'react';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Visualizer from './Visualizer';
import About from './About';
import Docs from './Docs';
import ErrorBoundary from './ErrorBoundary';
import './index.sass';

export default function App() {
  return (
    <BrowserRouter>
      <div className="page-wrapper">
        <div className="content-wrapper">
          <Header />
          <Switch>
            <Route path="/" exact={true}>
              <Redirect to="/visualize/input" />;
            </Route>
            <Route path="/visualize">
              <ErrorBoundary>
                <Visualizer />
              </ErrorBoundary>
            </Route>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/docs">
              <Docs />
            </Route>
          </Switch>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
