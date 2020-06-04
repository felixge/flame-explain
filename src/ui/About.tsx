import React from 'react';
import Heading from './Heading';
import {PageLink} from './Docs';
import QuirkCorrection from './docs/QuirkCorrection';

export default function About() {
  return <section className="section content">
    <div className="container">
      <Heading level={1}>About</Heading>
      <p>
        In 2018 I found myself optimizing a lot of SQL queries using <a target="_new" href="https://www.postgresql.org/docs/current/sql-explain.html">EXPLAIN ANALYZE</a> and wondered if <a target="_new" href="http://www.brendangregg.com/flamegraphs.html">flame graph</a> visualizations might help to speed up this kind of work. I quickly build a proof of concept that converted the JSON output from PostgreSQL into the folded stack format expected by <a target="_new" href="https://github.com/brendangregg/FlameGraph">brendangregg/FlameGraph</a>. But unfortunately it didn't work for anything but trivial queries. As soon as CTEs or other Init Plans were present, the graphs would break due to child node times exceeding the total duration of their parents because PostgreSQL double counts node execution times under many circumstances.
      </p>
      <p>
        After that the project lingered in the back of my mind, and it wasn't until late 2019 that I had the time and inspiration that lead to a <PageLink page={QuirkCorrection} text="breakthrough" anchor="CTEs" /> in correcting the node times. However, once I looked at some more complicated queries again, it quickly became clear that flame graphs alone were not sufficient. They are great at highlighting the expensive parts of a query, but they fail to reveal the overall plan structure due to fast nodes getting effectively hidden by the visualization.
      </p>
      <p>
        However, the time correction algorithms I came up with turned out to be useful beyond flame graphs, and no existing tool seemed to implement them. So I decided to build a unique tool that provides multiple visualizations based on these new algorithms and heuristics. The result is FlameExplain and I hope you find it useful : ).
      </p>
      <Heading level={2}>Security & Privacy</Heading>
      <p>
        FlameExplain is a JavaScript application that runs in your browser and never sends your data to another computer. This should make it sufficiently secure for most use cases, including optimizing query plans that may contain confidential information.
      </p>
      <p>
        Additionally FlameExplain is <a href="https://github.com/felixge/flame-explain">open source</a>, so you can study the code, create your own build, and run it on a machine without network access.
      </p>
      <Heading level={2}>Community & Support</Heading>
      <p>
        Please use <a href="https://github.com/felixge/flame-explain/issues">GitHub Issues</a> to report bugs, request features, or send pull requests.
      </p>
      <p>
        Or if you prefer to have a chat, please join the <a href="https://t.me/FlameExplainChat">Telegram Group</a>.
      </p>
      <Heading level={2}>License</Heading>
      <p>
        FlameExplain is free software, published under the <a href="https://www.gnu.org/licenses/agpl-3.0.html">AGPL Version 3</a> license. You can use it free of charge, and such usage will not "infect" the SQL/JSON code you paste into the UI. The license will only restrict you if you intend to host or distribute a forked version of FlameExplain.
      </p>
      <p>
        However, the statements above are not legal advice, and your internal company policies might prevent you from using any (A)GPL licensed software in general. So if you're worried about the license, please <a href="mailto:flame-explain@felixge.de">contact me</a>. I'm happy to provide free alternative licenses to anybody who asks nicely.
      </p>
      <Heading level={2}>Credits</Heading>
      <p>
        A special thanks goes to the projects and people below that have been important for building FlameExplain:
      </p>
      <ul>
        <li><a href="https://www.typescriptlang.org/" target="_new">Typescript</a> for making JavaScript fun again after years of leaving Node.js for Go.</li>
        <li><a href="https://reactjs.org/" target="_new">React</a> for allowing me to pretend to be frontend developer.</li>
        <li><a href="https://bulma.io/" target="_new">Bulma</a> for hiding my lack of CSS and design skills.</li>
        <li><a href="https://d3js.org/" target="_new">D3.js</a> for being the ultimate frontend visualization powerhouse.</li>
        <li><a href="https://prismjs.com/" target="_new">Prism</a> for great JSON and SQL syntax highlighting.</li>
        <li><a href="https://fontawesome.com/" target="_new">Font Awesome</a> for all the pretty icons.</li>
        <li><a href="Brendan Gregg" target="_new">Brendan Gregg</a> for inventing <a href="http://www.brendangregg.com/flamegraphs.html" target="_new">Flame graphs</a>.</li>
        <li><a href="https://www.linkedin.com/in/depesz" target="_new">Hubert Lubaczewski</a> for building the original <a href="https://explain.depesz.com/" target="_new">explain.depesz.com</a> tool which was a big inspiration.</li>
        <li><a href="https://twitter.com/LKhaknazarova" target="_new">Lina Khaknazarova</a> for providing lots of suggestions and feedback.</li>
        <li><a href="https://www.pgmustard.com/about" target="_new">Michael Christofides & David Conlin</a> of <a href="https://www.pgmustard.com/" target="_new">pgMustard</a> for in-depth conversations about EXPLAIN ANALYZE internals.</li>
      </ul>
      <p>
        Additionally there are many smaller projects and transitive dependencies that are not listed here. If you're the author of one of them and want to be listed, just let me know.
      </p>
      <Heading level={2}>Legal Notices - Impressum</Heading>
      <p>
        In compliance with German law, the entitiy responsible for operating this website is:
      </p>
      <p>
        fsync GmbH<br />
        Brunnenstr. 43<br />
        10115 Berlin<br /><br />
        Director: Felix Geisendörfer<br />
        Email: fsync@felixge.de<br />
        VAT ID: DE323208876<br />
        Entry in the commercial register: HRB 205398 B (Amtsgericht Charlottenburg)
      </p>
    </div>
  </section>;
};
