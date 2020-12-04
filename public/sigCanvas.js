const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
context.lineCap = "roiund";
let stroke = false;
let startX;
let startY;

canvas.addEventListener("mousedown", (event) => {
    event.preventDefault();
    mouseX = event.pageX;
    mouseY = event.pageY;

    stroke = true;
});

canvas.addEventListener("mousemove", (event) => {
    context.stroke();
    context.beginPath();
    context.moveTo(startX, startY);
});

canvas.addEventListener("mouseleave", (stroke = false));
canvas.addEventListener("mouseup", (stoke = false));
