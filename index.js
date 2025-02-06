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
  point: [view.bounds.topLeft.x + 8, view.bounds.topLeft.y + 20],
  content: "",
  fillColor: "black",
  fontFamily: "Arial",
  fontWeight: "bold",
  fontSize: 13,
  justification: "left",
})
project.activeLayer.addChild(centerText)

let welcomeText = "click and drag to read"

// split text in lines
let lines = []
let words = welcomeText.split(" ")
let line = ""

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

// update rect position
function updateTextAndRectPosition() {
  rect.position = view.center
  centerText.point = [
    view.center.x - rectSize.width / 2 + 10,
    view.center.y - rectSize.height / 2 + 30,
  ]
}

let clearText, saveComp, signature;

function createTextElements() {
    clearText = new PointText({
        point: view.bounds.topLeft + [8, 20],
        content: "clear page",
        fillColor: "black",
        fontFamily: "Arial",
        fontWeight: "bold",
        fontSize: 13,
        justification: "left",
    });

    project.activeLayer.addChild(clearText);
    clearText.visible = false; 

    clearText.onMouseDown = function () {
        location.reload();
    };

    clearText.onMouseEnter = () => canvas.style.cursor = "pointer";
    clearText.onMouseLeave = () => canvas.style.cursor = "default";

    saveComp = new PointText({
        point: view.bounds.topRight + [-8, 20],
        content: "save",
        fillColor: "black",
        fontFamily: "Arial",
        fontWeight: "bold",
        fontSize: 13,
        justification: "right",
    });

    project.activeLayer.addChild(saveComp);
    saveComp.visible = false;

    saveComp.onMouseDown = function exportSVGFile() {
        const svg = project.exportSVG({ asString: true });

        if (!svg) {
            console.error("Errore: SVG non generato.");
            return;
        }

        const now = new Date();
        const timestamp = now.getFullYear() + "-" +
            (now.getMonth() + 1).toString().padStart(2, '0') + "-" +
            now.getDate().toString().padStart(2, '0') + "_" +
            now.getHours().toString().padStart(2, '0') + "-" +
            now.getMinutes().toString().padStart(2, '0') + "-" +
            now.getSeconds().toString().padStart(2, '0');

        const filename = "frankenstein_" + timestamp + ".svg";

        triggerDownload(filename, svg);
    };

    function triggerDownload(filename, svgContent) {
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.style.display = 'none';
        a.click();
        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    saveComp.onMouseEnter = () => canvas.style.cursor = "pointer";
    saveComp.onMouseLeave = () => canvas.style.cursor = "default";

    signature = new PointText({
        point: view.bounds.bottomLeft + [8, -10],
        content: "words from Mary Shelley, Frankenstein or the Modern Prometheus, 1818.",
        fillColor: "black",
        fontFamily: "Arial",
        fontWeight: "bold",
        fontSize: 13,
        justification: "left",
    });

    project.activeLayer.addChild(signature);
    signature.visible = false;
}

function updateTextPositions() {
    if (clearText) clearText.point = view.bounds.topLeft + [8, 20];
    if (saveComp) saveComp.point = view.bounds.topRight + [-8, 20];
    if (signature) signature.point = view.bounds.bottomLeft + [8, -10];
}

createTextElements();

view.onResize = function () {
    updateTextPositions();
};

function onMouseDown(event) {
  if (centerText) {
    centerText.remove();
    if (clearText) clearText.visible = true;
    if (saveComp) saveComp.visible = true;
    if (signature) signature.visible = true;
  }
  if (rect) {
    rect.remove();
    rect = null;
  }
  myPath = new Path();
  myPath.strokeColor = "black";
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
}
