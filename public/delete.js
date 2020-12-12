(function () {
    const button = $("#delete");
    const popup = $("#popup-overlay");

    button.on("click", () => {
        popup.css({
            visibility: "visible",
        });

        $(".button").on("click", () => {
            popup.css({
                visibility: "hidden",
            });
        });
    });
})();
