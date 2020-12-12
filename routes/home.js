const express = require("express");

const router = express.Router();

router.get("/home", (req, res) => {
    if (!req.session.userId) {
        res.render("home", {
            loggedOut: true,
        });
    } else {
        res.render("home");
    }
});

module.exports = router;
