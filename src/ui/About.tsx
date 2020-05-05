import React from 'react';
import Heading from './Heading';

export default function About() {
  return <section className="section content">
    <div className="container">
      <Heading level={1}>About</Heading>
      <p>TODO ...</p>
      <Heading level={2}>License</Heading>
      <p>
        FlameExplain is free software, published under the <a
          href="https://en.wikipedia.org/wiki/GNU_Affero_General_Public_License">AGPL
        Version 3</a> license. You can use it free of charge, and such usage
          will not "infect" the SQL/JSON code you paste into the UI. The
          license will only restrict you if you intend to host or distribute a
          forked version of FlameExplain.
        </p>
      <p>
        However, the statements above are not legal advise, and your internal
        company policies might prevent you from using any (A)GPL licensed
        software in general. So if you're worried about the license, please <a
          href="mailto:flame-explain@felixge.de">contact me</a>. I'm happy to
            provide free alternative licenses to anybody who asks nicely.  </p>
      <Heading level={2}>Credits</Heading>
      <p>
        A special thanks goes to the projects and people below that have helped
        me with building FlameExplain:
      </p>
      <ul>
        <li><a href="https://www.typescriptlang.org/">Typescript</a> for making JavaScript fun again after years of leaving Node.js for developing in Go.</li>
        <li><a href="https://reactjs.org/">React</a> for allowing me to pretend to be frontend developer.</li>
        <li><a href="https://bulma.io/">Bulma</a> for hiding my lack of CSS and design skills.</li>
        <li><a href="https://d3js.org/">D3.js</a> for being the ultimate frontend visualization powerhouse.</li>
        <li><a href="https://github.com/spiermar/d3-flame-graph">d3-flame-graph</a> for powering the FlameGraph visualizations.</li>
        <li><a href="https://prismjs.com/">Prism</a> for great JSON and SQL syntax highlighting.</li>
        <li><a href="https://fontawesome.com/">Font Awesome</a> for all the pretty icons.</li>
        <li><a href="https://twitter.com/LKhaknazarova">Lina Khaknazarova</a> for providing lots of suggestions and feedback.</li>
        <li><a href="https://www.pgmustard.com/about">Michael Christofides & David Conlin</a> of <a href="https://www.pgmustard.com/">pgMustard</a> for in-depth conversations about EXPLAIN ANALYZE internals.</li>
      </ul>
      <p>
        Additionally there are many smaller projects and transitive
        dependencies that are not listed here.  If you're the author of one of
        them and want to be listed, just let me know.
        </p>
    </div>
  </section>;
};
