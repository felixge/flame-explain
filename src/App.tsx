import React from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
} from "react-router-dom";
import Header from './Header';
import Footer from './Footer';
import Visualizer from './Visualizer';
import About from './About';
import Docs from './Docs';
import Credits from './Credits';
import './index.sass';

export default function App() {
  return (
    <BrowserRouter>
        <Header/>
        <Switch>
          <Route path="/" exact>
            <Visualizer/>
          </Route>
          {/* Because Visualizer doesn't have a key prop, this should use the
              same Visualizer instance as above. */}
          <Route path="/visualize">
            <Visualizer/>
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/docs">
            <Docs />
          </Route>
          <Route path="/credits">
            <Credits />
          </Route>
        </Switch>
        <Footer/>
    </BrowserRouter>
  );
}
