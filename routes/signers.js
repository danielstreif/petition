const express = require("express");
const db = require("../db");
const { requireSignedPetition } = require("../middleware");

const router = express.Router();

router.get("/signers", requireSignedPetition, (req, res) => {
    db.getSignerNames()
        .then(({ rows }) => {
            res.render("signers", {
                signers: rows,
                err: req.query.error,
            });
        })
        .catch((err) => {
            console.log("getSignerNames error: ", err);
        });
});

router.get("/signers/:city", requireSignedPetition, (req, res) => {
    const {city} = req.params;
    db.getSignersByCity(city.replace("%20", " "))
        .then(({ rows }) => {
            res.render("signers", {
                signers: rows,
                city: "true",
            });
        })
        .catch((err) => {
            res.redirect("/signers/?error=true");
        });
});

module.exports = router;
