/** @param {Paper.PathItem[]} paths */
function uniteAll(paths) {
  let result = paths[0]
  for (let i = 1; i < paths.length; i++) {
    result = result.unite(paths[i], { insert: false })
  }
  result.project.activeLayer.addChild(result)
  return result
}

/** @param {Paper.PathItem[]} paths */
function intersectAll(paths) {
  let result = paths[0]
  for (let i = 1; i < paths.length; i++) {
    result = result.intersect(paths[i], { insert: false })
  }
  result.project.activeLayer.addChild(result)
  return result
}

/** @param {Paper.PathItem[]} paths */
function subtractAll(paths) {
  let result = paths[0]
  for (let i = 1; i < paths.length; i++) {
    result = result.subtract(paths[i], { insert: false })
  }
  result.project.activeLayer.addChild(result)
  return result
}

/** @param {Paper.PathItem[]} paths */
function excludeAll(paths) {
  let result = paths[0]
  for (let i = 1; i < paths.length; i++) {
    result = result.exclude(paths[i], { insert: false })
  }
  result.project.activeLayer.addChild(result)
  return result
}

/** @param {Paper.PathItem[]} paths */
function divideAll(paths) {
  let result = paths[0]
  for (let i = 1; i < paths.length; i++) {
    result = result.divide(paths[i], { insert: false })
  }
  result.project.activeLayer.addChild(result)
  return result
}

/**
 * @param {number} min
 * @param {number} max
 */
function randomMinMax(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * Apply a path effect to a single path or recursively to a group or compund
 * path.
 * @template {Paper.Item} T
 * @param {T} input
 * @param {function(Paper.Path, Object?): Paper.Item} effect
 * @param {Object} options
 * @returns {T}
 */
function applyPathEffect(input, effect, options) {
  if (input.children) {
    // Apply the effect to each child of the group (or the compund path, both
    // consist of children).
    for (const child of input.children) {
      applyPathEffect(child, effect, options)
    }
  } else if (input instanceof paper.Path) {
    // Apply the effect to the path.
    effect(input, options)
  } else {
    // For now, we don't support anything other than paths and groups. Shapes
    // should be avoided or expanded when importing SVG.
    console.warn(`Effect on item of type ${input.className} is not supported`)
  }
  return input
}

/**
 * @param {string} name
 * @param {string} content
 */
function downloadSVGFile(name, content) {
  const link = document.createElement("a")
  const url = URL.createObjectURL(
    new Blob([content], { type: "image/svg+xml" })
  )
  link.href = url
  link.download = `${name}.svg`
  link.click()
}
