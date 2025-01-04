import generateBlobPath from "./assets/useless-blobs.js"
import { randomMinMax } from "/assets/utils.js"

let id = 0

/** @param {HTMLElement} thumb */
export const setupThumb = (thumb) => {
  const frame = thumb.querySelector(".frame")
  /** @type HTMLElement */
  const frameContent = thumb.querySelector(".frame-content")
  const { width, height } = frame.getBoundingClientRect()

  const d = generateBlobPath({
    width,
    height,
    verts: Math.floor(randomMinMax(8, 12)),
    irregularity: randomMinMax(0.2, 0.4),
    spikiness: randomMinMax(0, 0.1),
    boundingShape: thumb.dataset.boundingShape ?? "rectangle",
    smoothing: 1,
  })

  const blob = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  blob.setAttribute("width", `${width}`)
  blob.setAttribute("height", `${height}`)
  blob.setAttribute("class", "frame-border")

  const clipPathId = `preview-${id++}-clip-path`

  blob.innerHTML = `
    <defs>
      <clipPath id="${clipPathId}">
        <path d="${d}" />
      </clipPath>
    </defs>
    <path class="stroke" d="${d}" />
    <path class="dash" d="${d}" />
  `

  frame.append(blob)
  frameContent.style.clipPath = `url(#${clipPathId})`
}
