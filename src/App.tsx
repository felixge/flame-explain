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

interface Props {
  planText?: string,
}

export default function App(p: Props) {
  return (
    <BrowserRouter>
      <Header />
      <Switch>
        <Route path="/visualize">
          <Visualizer planText={p.planText} />
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
      <Footer />
    </BrowserRouter>
  );
}
