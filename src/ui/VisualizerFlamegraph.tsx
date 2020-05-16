import React from 'react';
import {FlameNode} from '../lib/FlameExplain';
import {PreferencesState} from './Preferences';
import {formatDuration, formatPercent} from '../lib/Util';
import {ColorScale, colorPair} from './Color';

type FlameGraphNode = {
  node: FlameNode;
  rootShare: number;
  parentShare: number;
  color: number;

  absRowsX: number;
  rank: number;
  tooltip: string;
  children: FlameGraphNode[];
};

interface Props {
  root: FlameNode;
  settings: PreferencesState;
  clickNode: (fn: FlameNode) => void;
  selected?: FlameNode;
}

export default function VisualizerFlamegraph(p: Props) {
  const flameGraphNodes = toFlameGraphNodes(p.root);
  if (flameGraphNodes === null) {
    return <React.Fragment />;
  }

  const toElements = (f: FlameGraphNode): JSX.Element => {
    const children = f.children?.map(toElements);
    if (f.node.Kind === 'Root') {
      return <React.Fragment>{children}</React.Fragment>;
    }
    const isActive = (f.node === p.selected);
    let width = (f.parentShare * 100) + '%';
    let colors = {};
    if (!isActive) {
      colors = colorPair(f.color);
    }

    return <div
      key={f.node.ID}
      className={"group" + ((isActive) ? ' is-active' : '')}
      style={{width}}
    >
      <div
        className="rect has-tooltip-arrow"
        data-tooltip={f.tooltip}
        onClick={() => p.clickNode(f.node)}
        style={colors}
      >
        <span>{f.node.Label}</span>
      </div>
      {children}
    </div>
  }

  const groups = toElements(flameGraphNodes);

  return <React.Fragment>
    <div className="content">
      <p>Wide bars below show you where most of your query time is spent. A darker color means a worse row count estimate, which can lead to slow query plans.</p>
      <div className="flamegraph">
        {groups}
      </div>
    </div>
    <ColorScale />
  </React.Fragment>;
};

function toFlameGraphNodes(root: FlameNode): FlameGraphNode | null {
  const mapper = (fn: FlameNode): FlameGraphNode | null => {
    if (!(typeof fn["Total Time"] === 'number' &&
      typeof root["Total Time"] === 'number' &&
      typeof fn["Self Time"] === 'number' &&
      typeof fn["Total Time %"] === 'number' &&
      typeof fn["Self Time %"] === 'number'
    )) {
      return null;
    }

    const rootShare = fn["Total Time %"];
    if (rootShare < 0.01 || fn["Total Time"] <= 0) {
      return null;
    }

    let parentShare = 0;
    if (fn.Parent && typeof fn.Parent["Total Time"] === 'number') {
      parentShare = fn["Total Time"] / fn.Parent["Total Time"];
    }

    const node = fn;
    // TODO
    const absRowsX = Math.abs(fn["Rows X"] || 1);

    const totalTime = formatDuration(fn["Total Time"]);
    const selfTime = formatDuration(fn["Self Time"]);
    const totalDuration = formatDuration(root["Total Time"]);
    const totalPercent = formatPercent(rootShare);
    const selfPercent = formatPercent(fn["Self Time %"]);

    let tooltipLines: string[] = [
      `#${fn.ID} ${fn.Label}`,
      `Total Time: ${totalTime} of ${totalDuration} (${totalPercent} of total)`,
      `Self Time: ${selfTime} of ${totalDuration} (${selfPercent} of total)`,
    ];
    if (fn["Rows X"]) {
      tooltipLines.push('Rows X: ' + fn["Rows X"]?.toFixed(2));
    }

    const tooltip = tooltipLines.join('\n');

    let children: FlameGraphNode["children"] = [];
    fn.Children
      ?.map(mapper)
      .forEach(child => {
        if (child !== null) {
          children.push(child);
        }
      });

    const rank = 0;
    const color = 0;
    return {
      node,
      rootShare,
      parentShare,
      color,
      tooltip,
      absRowsX,
      rank,
      children,
    };
  };

  const flames = mapper(root);
  if (flames) {
    setColors(flames);
  }
  return flames;
}

// TODO: Make this part of fromRawQueries().
function setColors(root: FlameGraphNode) {
  const nodes: FlameGraphNode[] = [];
  const visit = (f: FlameGraphNode) => {
    nodes.push(f);
    f.children.forEach(visit);
  }
  root.children.forEach(visit);

  let prev: Number | undefined = undefined;
  let rank = -1;
  nodes
    .sort((a, b) => {
      return (a.absRowsX === b.absRowsX)
        ? 0
        : b.absRowsX - a.absRowsX;
    })
    .forEach(f => {
      if (prev === undefined || f.absRowsX < prev) {
        rank++;
        prev = f.absRowsX;
      }
      f.rank = rank;
    });

  nodes.forEach(f => {
    if (f.absRowsX === 1) {
      f.color = 0;
    } else {
      f.color = 1 - f.rank / rank;
    }
  });
}
