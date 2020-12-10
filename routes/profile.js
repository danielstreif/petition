const express = require("express");
const { hash } = require("../bc");
const db = require("../db");

const router = express.Router();

router.get("/profile", (req, res) => {
    res.render("profile");
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
            console.log("addUserProfile error: ", err);
            res.render("profile", {
                errorMessage: "true",
            });
        });
});

router.get("/profile/edit", (req, res) => {
    db.getProfile(req.session.userId)
        .then(({ rows }) => {
            res.render("edit", {
                userInfo: rows,
            });
        })
        .catch((err) => {
            console.log("getProfile error: ", err);
        });
});

router.post("/profile/edit", (req, res) => {
    const userId = req.session.userId;
    const {
        first,
        last,
        email,
        password,
        age,
        city,
        homepage,
        deleteAcc,
    } = req.body;
    if (deleteAcc) {
        db.deleteUser(userId)
            .then(() => {
                req.session = null;
                res.redirect("/register");
            })
            .catch((err) => {
                console.log("deleteUser error: ", err);
            });
    } else if (password) {
        hash(password).then((hash) => {
            db.updateCredentialsPW(userId, first, last, email, hash).then(
                () => {
                    const params = [
                        userId,
                        age || null,
                        city || null,
                        homepage || null,
                    ];
                    db.upsertProfile(params)
                        .then(() => {
                            res.redirect("/profile/edit");
                        })
                        .catch((err) => {
                            console.log("updateProfile error: ", err);
                            res.redirect("/profile/edit");
                        });
                }
            );
        });
    } else {
        db.updateCredentials(userId, first, last, email).then(() => {
            const params = [
                userId,
                age || null,
                city || null,
                homepage || null,
            ];
            db.upsertProfile(params)
                .then(() => {
                    res.redirect("/profile/edit");
                })
                .catch((err) => {
                    console.log("updateProfile error: ", err);
                    res.redirect("/profile/edit");
                });
        });
    }
});

module.exports = router;
