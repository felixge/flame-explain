import { format as formatBytes } from "bytes"

type Unit = "byte" | "page"

type Options = {
  pageSize: number
}

let defaultOptions = {
  pageSize: 8 * 1024,
}

export default function format(value: number, unit: Unit, o: Options = defaultOptions): string {
  switch (unit) {
    case "byte":
      if (Number.isNaN(value)) {
        return "NaN"
      }
      return formatBytes(value, { unitSeparator: " " })
    case "page":
      return format(value * o.pageSize, "byte")
    default:
      return "n/a"
  }
}
