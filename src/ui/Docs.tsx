import React from "react"
import { NavLink, Switch, Route } from "react-router-dom"
import { HashLink as Link } from "react-router-hash-link"
import Heading from "./Heading"
import KeyboardShortcuts from "./docs/KeyboardShortcuts"
import GettingStarted from "./docs/GettingStarted"
import Input from "./docs/Input"
import Flamegraph from "./docs/Flamegraph"
import Treetable from "./docs/Treetable"
import Share from "./docs/Share"
import Inspector from "./docs/Inspector"
import QuirkCorrection from "./docs/QuirkCorrection"

const sections: Section[] = [
    {
        name: "General",
        slug: "general",
        pages: [GettingStarted, QuirkCorrection],
    },
    {
        name: "Visualize",
        slug: "visualize",
        pages: [Input, Flamegraph, Treetable, Inspector, Share, KeyboardShortcuts],
    },
]

type Section = {
    name: string
    slug: string
    pages: Page[]
}

export type Page = {
    name?: string
    slug?: string
    page: () => JSX.Element
    children?: Page[]
}

const pageURL = (p: Page) => {
    const [section, page] = findPage(p)
    if (!section || !page) {
        throw new Error(`could not find page: ${p?.name}`)
    }
    return `/docs/${section.slug}/${page.slug}`
}

type PageLinkProps = {
    page: Page
    text?: string
    anchor?: string
}

export function PageLink(p: PageLinkProps) {
    const text = p.text || p.page.name
    const anchor = p.anchor ? "#" + p.anchor : ""
    return <Link to={pageURL(p.page) + anchor}>{text}</Link>
}

const findPage = (page: Page): [Section, Page] | [null, null] => {
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        for (let j = 0; j < section.pages.length; j++) {
            const found = section.pages[j]
            if (found === page) {
                return [section, found]
            }
        }
    }
    return [null, null]
}

export default function Docs() {
    return (
        <section className="section">
            <div className="container">
                <div className="columns">
                    <div className="column is-one-fifth">
                        <aside className="menu">
                            {sections.map(section => (
                                <React.Fragment key={section.slug}>
                                    <p className="menu-label">{section.name}</p>
                                    <ul className="menu-list">
                                        {section.pages.map(page => (
                                            <li key={page.slug}>
                                                <NavLink activeClassName="is-active" to={pageURL(page)}>
                                                    {page.name}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </React.Fragment>
                            ))}
                        </aside>
                    </div>
                    <div className="column">
                        <Switch>
                            {sections.map(section =>
                                section.pages.map(page => {
                                    const url = pageURL(page)
                                    return (
                                        <Route key={url} path={url} exact={true}>
                                            <nav className="breadcrumb" aria-label="breadcrumbs">
                                                <ul>
                                                    <li>
                                                        <a href={pageURL(GettingStarted)}>Docs</a>
                                                    </li>
                                                    <li className="is-active">
                                                        <a href="# ">{section.name}</a>
                                                    </li>
                                                    <li className="is-active">
                                                        <a href={url} aria-current="page">
                                                            {page.name}
                                                        </a>
                                                    </li>
                                                </ul>
                                            </nav>
                                            <div className="content">
                                                <Heading level={1}>{page.name}</Heading>
                                                {page.page()}
                                            </div>
                                        </Route>
                                    )
                                })
                            )}
                        </Switch>
                    </div>
                </div>
            </div>
        </section>
    )
}
