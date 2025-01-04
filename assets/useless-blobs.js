// MIT License

// Copyright (c) 2023 Jake Bukuts

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// src/defaults.ts
var defaultValues = {
  verts: 6,
  width: 200,
  height: 200,
  irregularity: 0.25,
  spikiness: 0.5,
  boundingShape: "ellipsis",
}
var defaults_default = defaultValues

// src/helpers.ts
var randomNum = (min, max) => Math.random() * (max - min) + min
var giveOrTake = (value, deviation) =>
  randomNum(value - deviation, value + deviation)
var clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(value, max))

// src/math.ts
var UNIT_CIRCLE = 2 * Math.PI
var randomAngleSteps = (steps, irr) => {
  const standardAngle = UNIT_CIRCLE / steps
  let cumulativeSum = 0
  const angles = [...new Array(steps)].map(() => {
    const angle = giveOrTake(standardAngle, irr)
    cumulativeSum += angle
    return angle
  })
  cumulativeSum /= UNIT_CIRCLE
  return angles.map((angle) => angle / cumulativeSum)
}
var calculateIntersectionPoint = (angle, heightRadius, widthRadius, type) => {
  let x
  let y
  const tan = Math.abs(Math.tan(angle))
  if (type === "rectangle") {
    x = widthRadius
    y = tan * x
    if (y > heightRadius) {
      y = heightRadius
      x = y / tan
    }
  } else {
    const ab = widthRadius * heightRadius
    const bottom = Math.sqrt(heightRadius ** 2 + widthRadius ** 2 * tan ** 2)
    x = ab / bottom
    y = (ab * tan) / bottom
  }
  return [x, y]
}
var createPolygon = (options = {}) => {
  const { verts, width, height, irregularity, spikiness, boundingShape } = {
    ...defaults_default,
    ...options,
  }
  if (verts < 3 || height <= 0 || width <= 0) return []
  const [wRadius, hRadius] = [width / 2, height / 2]
  const calcIrr = clamp(irregularity) * (UNIT_CIRCLE / verts)
  const angleSteps = randomAngleSteps(verts, calcIrr)
  let angle = randomNum(0, UNIT_CIRCLE)
  return angleSteps.map((currAngle) => {
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    const [x, y] = calculateIntersectionPoint(
      angle,
      hRadius,
      wRadius,
      boundingShape
    )
    const maxRadius = Math.sqrt(x ** 2 + y ** 2)
    const spikeDelta = clamp(spikiness) * maxRadius
    const radius = Math.min(maxRadius, giveOrTake(maxRadius, spikeDelta))
    const point = [
      (wRadius + radius * cos).toDecimal(2),
      (hRadius + radius * sin).toDecimal(2),
    ]
    angle += currAngle
    return point
  })
}
var calculateControl = (p0, p1, p2, p3, smoothVal) => {
  smoothVal = clamp(smoothVal, 0, 1)
  const [x0, y0] = p0
  const [x1, y1] = p1
  const [x2, y2] = p2
  const [x3, y3] = p3
  const xc1 = (x0 + x1) / 2
  const yc1 = (y0 + y1) / 2
  const xc2 = (x1 + x2) / 2
  const yc2 = (y1 + y2) / 2
  const xc3 = (x2 + x3) / 2
  const yc3 = (y2 + y3) / 2
  const len1 = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
  const len2 = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
  const len3 = Math.sqrt((x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2))
  const k1 = len1 / (len1 + len2)
  const k2 = len2 / (len2 + len3)
  const xm1 = xc1 + (xc2 - xc1) * k1
  const ym1 = yc1 + (yc2 - yc1) * k1
  const xm2 = xc2 + (xc3 - xc2) * k2
  const ym2 = yc2 + (yc3 - yc2) * k2
  const ctrl1X = (xm1 + (xc2 - xm1) * smoothVal + x1 - xm1).toDecimal(2)
  const ctrl1Y = (ym1 + (yc2 - ym1) * smoothVal + y1 - ym1).toDecimal(2)
  const ctrl2X = (xm2 + (xc2 - xm2) * smoothVal + x2 - xm2).toDecimal(2)
  const ctrl2Y = (ym2 + (yc2 - ym2) * smoothVal + y2 - ym2).toDecimal(2)
  return [
    [ctrl1X, ctrl1Y],
    [ctrl2X, ctrl2Y],
  ]
}
var allControlPoints = (polygonPoints, smoothing) => {
  const loopedPoints = [
    polygonPoints[polygonPoints.length - 1],
    ...polygonPoints,
    polygonPoints[0],
    polygonPoints[1],
  ]
  return loopedPoints.slice(1, -2).map((point, index) => {
    const before = loopedPoints[index]
    const a = point
    const b = loopedPoints[index + 2]
    const after = loopedPoints[index + 3]
    const controlPoints = calculateControl(before, a, b, after, smoothing)
    return controlPoints
  })
}

// index.ts
Number.prototype.toDecimal = function toDecimal(digits) {
  return +this.toFixed(digits)
}
var generatePathString = (points, smoothing = 1) => {
  if (points.length < 3) return ""
  const starting = `M ${points[0][0]} ${points[0][1]}`
  const controls = allControlPoints(points, smoothing)
  return [...points, points[0]].slice(1).reduce((acc, curr, index) => {
    const [x, y] = curr
    const [[a1, a2], [b1, b2]] = controls[index]
    return `${acc} C ${a1} ${a2}, ${b1} ${b2}, ${x} ${y}`
  }, starting)
}
var generateBlobPath = (options = {}) => {
  const { smoothing, ...rest } = { ...defaults_default, ...options }
  const points = createPolygon(rest)
  return generatePathString(points, smoothing)
}
var useless_blobs_default = generateBlobPath
export { createPolygon, useless_blobs_default as default, generatePathString }
