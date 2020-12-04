(function () {
    const canvas = $("#canvas");
    const sig = $("#sig");
    const context = canvas[0].getContext("2d");
    const offsetX = canvas.offset().left;
    const offsetY = canvas.offset().top;

    canvas.on("mousedown", (event) => {
        context.beginPath();
        context.moveTo(event.pageX - offsetX, event.pageY - offsetY);

        canvas.on("mousemove", (event) => {
            context.lineTo(event.pageX - offsetX, event.pageY - offsetY);
            context.stroke();
        });

        canvas.on("mouseleave", () => {
            exit();
        });
        canvas.on("mouseup", () => {
            exit();
        });
    });

    function exit() {
        canvas.off("mousemove");
        const sigData = canvas[0].toDataURL();
        sig.val(sigData);
    }
})();
