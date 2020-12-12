const express = require("express");
const { hash } = require("../bc");
const db = require("../db");
const { requireLoggedOutUser } = require("../middleware");

const router = express.Router();

router.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register", {
        err: req.query.error,
        success: req.query.success,
        loggedOut: true,
    });
});

router.post("/register", requireLoggedOutUser, (req, res) => {
    const { first, last, email, password, terms } = req.body;
    if (!terms) {
        return res.redirect("/register/?error=true");
    }
    hash(password)
        .then((hash) => {
            return db.addUser(first, last, email, hash);
        })
        .then(({ rows }) => {
            req.session.userId = rows[0].id;
            res.redirect("/profile");
        })
        .catch((err) => {
            res.redirect("/register/?error=true");
        });
});

module.exports = router;
