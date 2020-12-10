const express = require("express");
const db = require("../db");
const { requireSignedPetition } = require("../middleware");

const router = express.Router();

router.get("/signers", requireSignedPetition, (req, res) => {
    db.getSignerNames()
        .then(({ rows }) => {
            res.render("signers", {
                signers: rows,
            });
        })
        .catch((err) => {
            console.log("getSignerNames error: ", err);
        });
});

router.get("/signers/*", requireSignedPetition, (req, res) => {
    const cityName = req.url.replace("/signers/", "");
    db.getSignersByCity(cityName.replace("%20", " "))
        .then(({ rows }) => {
            res.render("signers", {
                signers: rows,
                city: "true",
            });
        })
        .catch((err) => {
            console.log("getSignersByCity error: ", err);
            res.redirect("/signers");
        });
});

module.exports = router;
