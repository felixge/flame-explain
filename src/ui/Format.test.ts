import format from "./Format"

describe("format", () => {
  test("byte", () => {
    expect(format(1, "byte")).toEqual("1 B")
    expect(format(2, "byte")).toEqual("2 B")
    expect(format(1024, "byte")).toEqual("1 KB")
    expect(format(1024 + 1, "byte")).toEqual("1 KB")
    expect(format(1024 + 10, "byte")).toEqual("1.01 KB")
    expect(format(1024 * 1024, "byte")).toEqual("1 MB")
    expect(format(1024 * 1024 + 1024 * 10, "byte")).toEqual("1.01 MB")
    expect(format(1024 * 1024 * 1024, "byte")).toEqual("1 GB")
    expect(format(1024 * 1024 * 1024 * 1024, "byte")).toEqual("1 TB")
  })

  test("page", () => {
    expect(format(1, "page")).toEqual("8 KB")
    expect(format(127, "page")).toEqual("1016 KB")
    expect(format(128, "page")).toEqual("1 MB")
  })
})
