import React from 'react';

export default function Credits() {
    return <section className="section">
        <div className="container content">
            <h1 className="title is-4">Credits</h1>
            <p>
                FlameExplain is built upon the following projects, and wouldn't
                be possible without them.
            </p>
            <table>
                <thead>
                    <th>Project</th>
                    <th>License</th>
                </thead>
                <tbody>
                <tr>
                        <td><a href="https://www.typescriptlang.org/">Typescript</a></td>
                        <td><a href="https://github.com/microsoft/TypeScript/blob/master/LICENSE.txt">Apache 2.0</a></td>
                    </tr>
                    <tr>
                        <td><a href="https://reactjs.org/">React</a></td>
                        <td><a href="https://github.com/facebook/react/blob/master/LICENSE">MIT</a></td>
                    </tr>
                    <tr>
                        <td><a href="https://bulma.io/">Bulma</a></td>
                        <td><a href="https://github.com/jgthms/bulma/blob/master/LICENSE">MIT</a></td>
                    </tr>
                    <tr>
                        <td><a href="https://github.com/spiermar/d3-flame-graph">d3-flame-graph</a></td>
                        <td><a href="https://github.com/spiermar/d3-flame-graph/blob/master/LICENSE">Apache 2.0</a></td>
                    </tr>
                    <tr>
                        <td><a href="https://github.com/twitter/twemoji">Twitter Emoji</a></td>
                        <td><a href="https://github.com/twitter/twemoji/blob/master/LICENSE-GRAPHICS">CC BY 4.0</a></td>
                    </tr>
                </tbody>
            </table>
            <p>
                Additionally there are many transitive
                    dependencies and smaller projects that are not listed here.
                    If you're the author of one of them and want to be listed, just
                    let me know.
            </p>
        </div>
    </section>;
};
