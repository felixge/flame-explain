import React from "react"
import { FlameNode, FlameKey } from "../lib/FlameExplain"
import { columnText } from "../lib/TextTable"
import { ColorScale, colorPair } from "./Color"
import { faMinusSquare, faPlusSquare, faLeaf } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Arrows, Direction, move } from "./Arrows"

interface Props {
    root: FlameNode
    favorites: FlameKey[]
    onChangeFavorites: (favs: FlameKey[]) => void
    collapsed: { [K: number]: true }
    clickNode: (fn: FlameNode) => void
    toggleNode: (fn: FlameNode, recursive: boolean) => void
    selectedNode?: number
}

export default function VisualizerTable(p: Props) {
    const rows: JSX.Element[] = []
    const columns = p.favorites

    const visit = (fn: FlameNode, depth = 0) => {
        const collapsed = typeof fn.ID === "number" && p.collapsed[fn.ID]
        if (fn.Kind !== "Root") {
            const colVals = columns.map(col => {
                let colVal = columnText(fn, col)
                let colEl: JSX.Element = <React.Fragment>{colVal}</React.Fragment>
                let style: React.CSSProperties = { whiteSpace: "nowrap" }

                if (col === "Label") {
                    const leafNode = (fn.Children?.length || 0) <= 0
                    const icon = leafNode ? faLeaf : collapsed ? faPlusSquare : faMinusSquare
                    colEl = (
                        <React.Fragment>
                            {"\u00a0".repeat((depth - 1) * 4)}
                            <span
                                className="has-tooltip-right has-tooltip-arrow"
                                data-tooltip="Shift click to expand/collapse nodes recursively."
                                // prevent text-selection
                                onMouseDown={e => e.preventDefault()}
                                onClick={e => {
                                    e.stopPropagation()
                                    p.toggleNode(fn, e.shiftKey || e.altKey)
                                }}
                            >
                                <FontAwesomeIcon icon={icon} />
                            </span>
                            &nbsp;{colVal}
                        </React.Fragment>
                    )
                    style.whiteSpace = "initial"
                }

                const percent = fn.Colors?.[col as keyof FlameNode["Colors"]]
                if (typeof percent === "number") {
                    style = { ...style, ...colorPair(percent) }
                }
                style.textAlign = typeof fn[col] === "number" ? "right" : "left"

                return (
                    <td key={col} style={style}>
                        {colEl}
                    </td>
                )
            })
            rows.push(
                <tr
                    onClick={() => p.clickNode(fn)}
                    style={{ cursor: "pointer" }}
                    key={fn.ID}
                    className={fn.ID === p.selectedNode ? "is-active" : ""}
                >
                    {colVals}
                </tr>
            )
        }
        if (!collapsed) {
            fn.Children?.forEach(child => visit(child, depth + 1))
        }
    }
    visit(p.root)

    const headers = columns.map(col => {
        let style: React.CSSProperties = {}
        if (col === "Label") {
            style.width = "99%"
        } else {
            style.whiteSpace = "nowrap"
        }

        const onArrowClick = (d: Direction) => {
            p.onChangeFavorites(move(p.favorites, p.favorites.indexOf(col), d))
        }

        return (
            <th className="has-arrows" key={col} style={style}>
                {col}
                <Arrows arrows={["left", "right"]} onClick={onArrowClick} />
            </th>
        )
    })

    return (
        <div className="content">
            <table className="table tree-table is-narrow">
                <thead>
                    <tr>{headers}</tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
            <ColorScale />
        </div>
    )
}
