import React from 'react'
import Prism from 'prismjs'
import 'prismjs/plugins/custom-class/prism-custom-class'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-json'
// Can't import the theme from prismjs module directly because we need to hack
// it with prefixes, see below.
import './prism.css'

// https://github.com/jgthms/bulma/issues/1708#issuecomment-499677204
Prism.plugins.customClass.prefix('prism-')
// @ts-ignore https://github.com/PrismJS/prism/pull/1087
Prism.manual = true

type Props = {
  language: 'sql' | 'json'
  source: string
}

export default function Highlight(p: Props) {
  const ref = React.useRef<HTMLElement>(null)
  React.useEffect(() => {
    if (ref.current) {
      Prism.highlightElement(ref.current)
    }
  })

  return (
    <pre>
      <code ref={ref} className={'language-' + p.language}>
        {p.source}
      </code>
    </pre>
  )
}
