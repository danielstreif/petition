(function () {
    const link = $("#link");
    const popup = $("#popup-overlay");

    link.on("click", () => {
        popup.css({
            visibility: "visible",
        });

        popup.on("click", () => {
            popup.css({
                visibility: "hidden",
            });
        });
    });
})();
