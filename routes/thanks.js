const express = require("express");
const db = require("../db");
const { requireSignedPetition } = require("../middleware");

const router = express.Router();

router.get("/thanks", requireSignedPetition, (req, res) => {
    let sigCount
    db.getSignerCount()
        .then(({ rows }) => {
            sigCount = rows[0].count;
            return db.getSig(req.session.sigId);
        })
        .then(({ rows }) => {
            res.render("thanks", {
                errorMessage: req.query.error,
                sig: rows[0].sig,
                name: rows[0].first,
                sigCount,
            });
        })
        .catch((err) => {
            console.log("getSignerCount error: ", err);
        });
});

router.post("/thanks", requireSignedPetition, (req, res) => {
    db.deleteSig(req.session.sigId)
        .then(() => {
            req.session.sigId = null;
            res.redirect("/petition");
        })
        .catch((err) => {
            res.redirect("/thanks/?error=true");
        });
});

module.exports = router;
