const express = require("express");
const { hash } = require("../bc");
const db = require("../db");

const router = express.Router();

router.get("/profile", (req, res) => {
    res.render("profile", { err: req.query.error });
});

router.post("/profile", (req, res) => {
    let { age, city, homepage } = req.body;
    if (!homepage.startsWith("http") || !homepage.startsWith("https")) {
        homepage = null;
    }
    const params = [
        age || null,
        city || null,
        homepage || null,
        req.session.userId,
    ];
    db.addUserProfile(params)
        .then(() => {
            res.redirect("/petition");
        })
        .catch((err) => {
            res.redirect("/profile/?error=true");
        });
});

router.get("/profile/edit", (req, res) => {
    db.getProfile(req.session.userId)
        .then(({ rows }) => {
            res.render("edit", {
                userInfo: rows,
                err: req.query.error,
                success: req.query.success,
            });
        })
        .catch((err) => {
            res.redirect("/profile/?error=true");
        });
});

router.post("/profile/edit", (req, res) => {
    const userId = req.session.userId;
    const { first, last, email, password, age, city, deleteAcc } = req.body;
    let { homepage } = req.body;
    if (deleteAcc) {
        db.deleteUser(userId)
            .then(() => {
                req.session = null;
                res.redirect("/register");
            })
            .catch((err) => {
                res.redirect("/profile/edit/?error=true");
            });
    } else if (password) {
        hash(password)
            .then((hash) => {
                db.updateCredentialsPW(userId, first, last, email, hash);
            })
            .then(() => {
                if (
                    !homepage.startsWith("http") ||
                    !homepage.startsWith("https")
                ) {
                    homepage = null;
                }
                const params = [
                    userId,
                    age || null,
                    city || null,
                    homepage || null,
                ];
                db.upsertProfile(params);
            })
            .then(() => {
                res.redirect("/profile/edit/?success=true");
            })
            .catch((err) => {
                res.redirect("/profile/edit/?error=true");
            });
    } else {
        db.updateCredentials(userId, first, last, email)
            .then(() => {
                if (
                    !homepage.startsWith("http") ||
                    !homepage.startsWith("https")
                ) {
                    homepage = null;
                }
                const params = [
                    userId,
                    age || null,
                    city || null,
                    homepage || null,
                ];
                return db.upsertProfile(params);
            })
            .then(() => {
                res.redirect("/profile/edit/?success=true");
            })
            .catch((err) => {
                console.log(err);
                res.redirect("/profile/edit/?error=true");
            });
    }
});

module.exports = router;
