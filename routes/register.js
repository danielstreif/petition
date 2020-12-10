const express = require("express");
const { hash } = require("../bc");
const db = require("../db");
const { requireLoggedOutUser } = require("../middleware");

const router = express.Router();

router.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register");
});

router.post("/register", requireLoggedOutUser, (req, res) => {
    const { first, last, email, password } = req.body;
    hash(password)
        .then((hash) => {
            db.addUser(first, last, email, hash)
                .then(({ rows }) => {
                    req.session.userId = rows[0].id;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("addUser error: ", err);
                    res.render("register", {
                        errorMessage: "true",
                    });
                });
        })
        .catch((err) => {
            console.log("hash error: ", err);
            res.render("register", {
                errorMessage: "true",
            });
        });
});

module.exports = router;
