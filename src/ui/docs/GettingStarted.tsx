import React from 'react';
import {Page, PageLink} from '../Docs';
import Heading from '../Heading';
import Flamegraph from './Flamegraph';
import Treetable from './Treetable';
import QuirkCorrection from './QuirkCorrection';
import Input from './Input';

const page: Page = {
  name: 'Getting Started',
  slug: 'getting-started',
  page: () => <React.Fragment>
    <p>FlameExplain is a tool to help you with optimizing PostgreSQL queries.</p>
    <Heading level={2}>Learn the Basics</Heading>

    <p>If you're new to query optimization, you'll greatly benefit from a bit of studying before diving in. The <a href="https://www.postgresql.org/docs/current/using-explain.html" target="_new">Using EXPLAIN</a> page in the PostgreSQL documentation is a good introduction with many examples for default text output format.</p>

    <p>Once you've learned the underlaying theory, it's time to learn how <PageLink page={Input} /> your plan.</p>

    <Heading level={2}>Why FlameExplain?</Heading>

    <p>After learning the basics, you wonder about why you should prefer a tool like FlameExplain over directly working with the text output format, or what makes FlameExplain better than similar tools.</p>

    <p>The main reason is that the numbers reported by PostgreSQL have various quirks that can be misleading to beginners. FlameExplain comes with some of the best <PageLink page={QuirkCorrection} /> algorithms found in any tool. </p>

    <p>The second reason to use FlameExplain is the <PageLink page={Flamegraph} /> visualization. It offers a uniquely powerful way to quickly understand the bottlenecks of your query and what might cause them. It works especially well for huge queries with many nodes.</p>

    <p>And last but not least, the <PageLink page={Treetable} /> offers a classic view pioneered by <a href="https://explain.depesz.com/" target="_new">explain.depesz.com</a>. However, customizable columns, color highlighting, and various other UX enhancements make it more useful than ever.</p>
    <p></p>
  </React.Fragment>
  ,
};

export default page;
