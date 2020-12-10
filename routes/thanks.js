const express = require("express");
const db = require("../db");
const { requireSignedPetition } = require("../middleware");

const router = express.Router();

router.get("/thanks", requireSignedPetition, (req, res) => {
    db.getSignerCount()
        .then(({ rows }) => {
            const sigCount = rows[0].count;
            db.getSig(req.session.sigId).then(({ rows }) => {
                res.render("thanks", {
                    sig: rows[0].sig,
                    name: rows[0].first,
                    sigCount,
                });
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
            console.log("deleteSig error: ", err);
        });
});

module.exports = router;
