import { setupThumb } from "./thumb.js"

// Add a too small hint (as most of the snippets aren't optimized for mobile)
const minWidth = 900
/** @type {HTMLElement} */
const tooSmall = document.querySelector(".too-small")
const resize = () => tooSmall.togglePopover(window.innerWidth < minWidth)
window.addEventListener("resize", resize)
resize()

const dialog = document.querySelector("dialog")
const iframe = dialog.querySelector("iframe")
const thumbs = Array.from(document.querySelectorAll(".thumb"))
const masonry = document.querySelector(".masonry")
const previewTitle = document.querySelector(".preview-title")

// Shuffle thumbs
for (var i = thumbs.length; i >= 0; i--) {
  masonry.appendChild(thumbs[Math.floor(Math.random() * i)])
}
thumbs.forEach(setupThumb)

const handleLocation = () => {
  const { hash, pathname } = window.location
  const isHome = (pathname === "/" || pathname === "/index.html") && !hash

  if (isHome) {
    dialog.close()
    iframe.contentWindow.location.replace("about:blank")
  } else {
    dialog.showModal()

    document.body.dataset.loading = "true"
    iframe.contentWindow.location.replace(hash.substring(1))

    /** @type HTMLElement */
    const thumb = document.querySelector(`.thumb[href="${hash}"]`)
    previewTitle.innerHTML = `// ${thumb.dataset.title}`
  }
}

iframe.addEventListener("load", () => {
  document.body.dataset.loading = "false"
  iframe.contentWindow.focus()
})
window.addEventListener("popstate", handleLocation)
window.addEventListener("load", handleLocation)
