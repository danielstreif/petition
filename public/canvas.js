(function () {
    const canvas = $("#canvas");
    const sig = $("#sig");
    const context = canvas[0].getContext("2d");
    const offsetX = canvas.offset().left;
    const offsetY = canvas.offset().top;

    canvas.on("mousedown", (e) => {
        context.beginPath();
        context.moveTo(e.pageX - offsetX, e.pageY - offsetY);

        canvas.on("mousemove", (e) => {
            context.lineTo(e.pageX - offsetX, e.pageY - offsetY);
            context.stroke();
        });

        $(document).on("mouseup", () => {
            exit();
        });
    });

    function exit() {
        canvas.off("mousemove");
        const sigData = canvas[0].toDataURL();
        sig.val(sigData);
    }
})();
