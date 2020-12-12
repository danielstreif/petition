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

    canvas.on("touchstart", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        canvas[0].dispatchEvent(mouseEvent);

        canvas.on("touchmove", (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent("mousemove", {
                clientX: touch.clientX,
                clientY: touch.clientY,
            });
            canvas[0].dispatchEvent(mouseEvent);
        });

        $(document).on("touchend", () => {
            e.preventDefault();
            const mouseEvent = new MouseEvent("mouseup", {});
            $(document)[0].dispatchEvent(mouseEvent);
        });
    });

    function exit() {
        canvas.off("mousemove");
        canvas.off("touchmove");
        const sigData = canvas[0].toDataURL();
        sig.val(sigData);
    }
})();
