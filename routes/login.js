const express = require("express");
const { compare } = require("../bc");
const db = require("../db");
const { requireLoggedOutUser } = require("../middleware");

const router = express.Router();

router.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", { err: req.query.error });
});

router.post("/login", requireLoggedOutUser, (req, res) => {
    const { email, password } = req.body;
    let userId;
    db.getCredentials(email)
        .then(({ rows }) => {
            userId = rows[0].id;
            return compare(password, rows[0].password);
        })
        .then((result) => {
            if (result) {
                req.session.userId = userId;
                db.getSigId(userId)
                    .then(({ rows }) => {
                        req.session.sigId = rows[0].id;
                        res.redirect("/thanks");
                    })
                    .catch((err) => {
                        res.redirect("/petition");
                    });
            } else {
                res.redirect("/login/?error=true");
            }
        })
        .catch((err) => {
            res.redirect("/login/?error=true");
        });
});

module.exports = router;
