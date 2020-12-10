const express = require("express");
const db = require("../db");
const { requireUnsignedPetition } = require("../middleware");

const router = express.Router();

router.get("/petition", requireUnsignedPetition, (req, res) => {
    res.render("petition");
});

router.post("/petition", requireUnsignedPetition, (req, res) => {
    db.addSigner(req.body.sig, req.session.userId)
        .then(({ rows }) => {
            req.session.sigId = rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("addSigner error: ", err);
            res.render("petition", {
                errorMessage: "true",
            });
        });
});

module.exports = router;
