import React from 'react';
import {FlameNode} from '../lib/FlameExplain';
import {PreferencesState} from './Preferences';
import {formatDuration, formatPercent} from '../lib/Util';

interface Props {
  root: FlameNode;
  settings: PreferencesState;
  clickNode: (fn: FlameNode) => void;
  selected?: FlameNode;
}

export default function VisualizerFlamegraph(p: Props) {
  const toGroups = (fn: FlameNode): JSX.Element => {
    const children = fn.Children?.map(toGroups);
    if (fn.Kind === 'Root') {
      return <React.Fragment>{children}</React.Fragment>;
    }

    let width = '100%';
    let tooltip = '';
    if (fn.Parent &&
      typeof fn.Parent["Total Time"] === 'number' &&
      typeof fn["Total Time"] === 'number' &&
      typeof p.root["Total Time"] === 'number') {

      const rootFraction = fn["Total Time"] / p.root["Total Time"];
      if (rootFraction < 0.01 || fn["Total Time"] <= 0) {
        return <React.Fragment key={fn.ID} />;
      }

      const parentFraction = fn["Total Time"] / fn.Parent["Total Time"];
      width = (parentFraction * 100) + '%';

      if (typeof p.root["Total Time"] === 'number') {
        const duration = formatDuration(fn["Total Time"]);
        const percent = formatPercent(rootFraction);
        tooltip = `${fn.Label} ${duration} (${percent} of total)`;
      }
    }

    return <div
      key={fn.ID}
      className={"group" + ((fn === p.selected) ? ' is-active' : '')}
      style={{width}}
    >
      <div
        className="rect has-tooltip-arrow"
        data-tooltip={tooltip}
        onClick={() => p.clickNode(fn)}
      >
        <span>{fn.Label}</span>
      </div>
      {children}
    </div >
  };
  const groups = toGroups(p.root);

  return <div className="flamegraph">
    {groups}
  </div>;
};
