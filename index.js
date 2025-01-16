// touch-reading, visual poetry!

// I would like to make the text appear while I drag the mouse, before it appeared just when I would release the mouse
var myPath
var textGroup = new Group()
let textPosition = 0

let reset = (textPosition = 0)
const params = {
  spacing: 12,
  repeat: false,
  yourTextHere:
    "It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet. It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out, when, by the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open; it breathed hard, and a convulsive motion agitated its limbs.",
}

// rectangle 130x130 al centro della finestra del browser
let rectSize = new Size(250, 250)
let rect = new Path.Rectangle({
  point: view.bounds.topLeft - [50, 50],
  size: rectSize,
  strokeColor: "white",
})
project.activeLayer.addChild(rect)

// welcome text inside rect
let centerText = new PointText({
  point: [view.bounds.topLeft.x + 10, view.bounds.topLeft.y + 25],
  content: "",
  fillColor: "black",
  fontFamily: "Arial",
  fontWeight: "bold",
  fontSize: 20,
  justification: "left",
})
project.activeLayer.addChild(centerText)

let welcomeText = "click and drag to read"

// split text in lines
let lines = []
let words = welcomeText.split(" ")
let line = ""

// clear text
let clearText = new PointText({
  point: view.bounds.topRight - [10, - 25],
  content: "clear page",
  fillColor: "black",
  fontFamily: "Arial",
  fontWeight: "bold",
  fontSize: 20,
  justification: "right",
})
project.activeLayer.addChild(clearText).on("click", function () {
    location.reload(); // Reloads the current page
  });

clearText.onMouseEnter = function (event) {
    canvas.style.cursor = "pointer";
}
clearText.onMouseLeave = function (event) {
    canvas.style.cursor = "default";
}

for (let i = 0; i < words.length; i++) {
  let testLine = line + words[i] + " "
  centerText.content = testLine
  if (centerText.bounds.width > rectSize.width - 90) {
    lines.push(line)
    line = words[i] + " "
  } else {
    line = testLine
  }
}
lines.push(line)

// merge lines
centerText.content = lines.join("\n")

// updated date ant time
let dateTimeText = new PointText({
  point: view.bounds.bottomLeft + [10, -10], // Posizionamento iniziale corretto
  content: "today",
  fillColor: "black",
  fontFamily: "Arial",
  fontWeight: "bold",
  fontSize: 10,
  justification: "left",
})
project.activeLayer.addChild(dateTimeText)

//signature
let signature = new PointText({
  point: view.bounds.bottomRight - [10, 10],
  content: "@caterinarigobianco",
  fillColor: "black",
  fontFamily: "Arial",
  fontWeight: "bold",
  fontSize: 10,
  justification: "right",
})
project.activeLayer.addChild(signature)

// Update positions on resize
view.onResize = function (event) {
  // updateTextAndRectPosition();
  updateDatePosition()
  updateSignaturePosition()
}

//UPDATES

// update rect position
function updateTextAndRectPosition() {
  rect.position = view.center
  centerText.point = [
    view.center.x - rectSize.width / 2 + 10,
    view.center.y - rectSize.height / 2 + 30,
  ]
}

// Funzione per aggiornare la posizione della data quando la finestra del browser viene ridimensionata
function updateDatePosition() {
  dateTimeText.point = view.bounds.bottomLeft + [10, -10]
}
function updateSignaturePosition() {
  signature.point = view.bounds.bottomRight - [10, 10]
}

// function to update date and time
function updateDateTime() {
  let now = new Date()
  let dateString = now.toLocaleDateString()
  let timeString = now.toLocaleTimeString()
  dateTimeText.content = `date: ${dateString}, time: ${timeString}`
}

// update every second
setInterval(updateDateTime, 1000)

function onMouseDown(event) {
  // Deleting text after first click
  if (centerText) {
    centerText.remove()
    centerText = null
  }
  if (rect) {
    rect.remove((rect = null))
  }
  myPath = new Path()
  myPath.strokeColor = "black"
  // remove previous text
}

let numCharacters

function onMouseDrag(event) {
  myPath.add(event.point)
  textGroup.removeChildren() // remove previous text
  numCharacters = Math.ceil(myPath.length / params.spacing)

  for (let i = 0; i < numCharacters; i++) {
    const offset = params.spacing * i
    const point = myPath.getPointAt(offset)
    const tangent = myPath.getTangentAt(offset)

    if (tangent && textPosition + i < params.yourTextHere.length) {
      const text = new PointText({
        point: point,
        content: params.yourTextHere[textPosition + i],
        fillColor: "black",
        fontFamily: "Arial",
        fontWeight: "bold",
        fontSize: 20,
      })
      text.rotate(tangent.angle)
      textGroup.addChild(text)
    }
  }
}

function onMouseUp(event) {
  myPath = null

  if (params.repeat === false) {
    textPosition = textPosition + numCharacters
  }

  project.activeLayer.addChildren(textGroup.children)
  // move the children toa  different layer so the first removing of the text group will be empty. and the last line will be saved.
}
