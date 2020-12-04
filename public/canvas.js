const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let paint = false;
let startX;
let startY;

canvas.addEventListener("mousedown", (event) => {
    mouseX = event.pageX;
    mouseY = event.pageY;

    paint = true;
});

canvas.addEventListener("mousemove", (event) => {
    context.beginPath();
    context.moveTo(startX, startY);
});

canvas.addEventListener("mouseleave", (paint = false));
canvas.addEventListener("mouseup", (paint = false));
