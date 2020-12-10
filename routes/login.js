const express = require("express");
const { compare } = require("../bc");
const db = require("../db");
const { requireLoggedOutUser } = require("../middleware");

const router = express.Router();

router.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login");
});

router.post("/login", requireLoggedOutUser, (req, res) => {
    const { email, password } = req.body;
    db.getCredentials(email)
        .then(({ rows }) => {
            const userId = rows[0].id;
            compare(password, rows[0].password).then((result) => {
                if (result) {
                    req.session.userId = userId;
                    db.getSigId(userId)
                        .then(({ rows }) => {
                            req.session.sigId = rows[0].id;
                            res.redirect("/petition");
                        })
                        .catch((err) => {
                            console.log("getSigId error: ", err);
                            res.redirect("/petition");
                        });
                } else {
                    res.render("login", {
                        errorMessage: "true",
                    });
                }
            });
        })
        .catch((err) => {
            console.log("getCredentials error: ", err);
            res.render("login", {
                errorMessage: "true",
            });
        });
});

module.exports = router;
