import React from 'react'
import { FlameNode } from '../lib/FlameExplain'
import { formatDuration, formatPercent } from '../lib/Util'
import { ColorScale, colorPair } from './Color'

type FlameGraphNode = {
  node: FlameNode
  parentShare: number
  color: number
  tooltip: string
  children: FlameGraphNode[]
}

interface Props {
  root: FlameNode
  clickNode: (fn: FlameNode) => void
  selected?: FlameNode
}

export const hideThreshold = 0.01

export default function VisualizerFlamegraph(p: Props) {
  const flameGraphNodes = toFlameGraphNodes(p.root)
  if (flameGraphNodes === null) {
    return <React.Fragment />
  }

  const toElements = (f: FlameGraphNode): JSX.Element => {
    const children = f.children?.map(toElements)
    if (f.node.Kind === 'Root') {
      return <React.Fragment>{children}</React.Fragment>
    }
    const isActive = f.node === p.selected
    let width = f.parentShare * 100 + '%'
    let colors = {}
    if (!isActive) {
      colors = colorPair(f.color)
    }

    return (
      <div key={f.node.ID} className={'group' + (isActive ? ' is-active' : '')} style={{ width }}>
        <div
          className="rect has-tooltip-arrow"
          data-tooltip={f.tooltip}
          onClick={() => p.clickNode(f.node)}
          style={colors}
        >
          <span>
            {f.node.ID} {f.node.Label}
          </span>
        </div>
        {children}
      </div>
    )
  }

  const groups = toElements(flameGraphNodes)

  return (
    <React.Fragment>
      <div className="content">
        <p>
          Wide bars below show you where most of your query time is spent. A darker color means a worse row count
          estimate, which can lead to slow query plans.
        </p>
        <div className="flamegraph">{groups}</div>
      </div>
      <ColorScale />
    </React.Fragment>
  )
}

function toFlameGraphNodes(root: FlameNode): FlameGraphNode | null {
  const mapper = (fn: FlameNode): FlameGraphNode | null => {
    if (
      !(
        typeof fn['Total Time'] === 'number' &&
        typeof root['Total Time'] === 'number' &&
        typeof fn['Self Time'] === 'number' &&
        typeof fn['Total Time %'] === 'number' &&
        typeof fn['Self Time %'] === 'number'
      )
    ) {
      return null
    }

    const rootShare = fn['Total Time %']
    if (rootShare < hideThreshold || fn['Total Time'] <= 0) {
      return null
    }

    let parentShare = 0
    if (fn.Parent && typeof fn.Parent['Total Time'] === 'number') {
      parentShare = fn['Total Time'] / fn.Parent['Total Time']
    }

    const node = fn
    const totalTime = formatDuration(fn['Total Time'])
    const selfTime = formatDuration(fn['Self Time'])
    const totalDuration = formatDuration(root['Total Time'])
    const totalPercent = formatPercent(rootShare)
    const selfPercent = formatPercent(fn['Self Time %'])

    let tooltipLines: string[] = [
      `Total Time: ${totalTime} of ${totalDuration} (${totalPercent} of total)`,
      `Self Time: ${selfTime} of ${totalDuration} (${selfPercent} of total)`,
    ]
    if (fn['Rows X']) {
      tooltipLines.push('Rows X: ' + fn['Rows X']?.toFixed(2))
    }

    const tooltip = tooltipLines.join('\n')

    let children: FlameGraphNode['children'] = []
    fn.Children?.map(mapper).forEach(child => {
      if (child !== null) {
        children.push(child)
      }
    })

    let color = 0.5
    if (typeof fn.Colors?.['Rows X'] === 'number') {
      color = fn.Colors['Rows X']
    } else {
      color = 0.5
    }

    return {
      node,
      parentShare,
      color,
      tooltip,
      children,
    }
  }

  const flames = mapper(root)
  return flames
}
