const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const db = require("./db");
const { hash, compare } = require("./bc");

process.env.NODE_ENV === "production"
    ? (secrets = process.env)
    : (secrets = require("./secrets"));
const { sessionSecret, maxAge } = secrets;

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: sessionSecret,
        maxAge: maxAge,
    })
);

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(csurf());

app.use((req, res, next) => {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    const url = req.url;
    if (
        req.session.userId === undefined &&
        url !== "/register" &&
        url !== "/login"
    ) {
        res.redirect("/register");
    } else if (
        req.session.userId !== undefined &&
        !req.session.sigId &&
        url !== "/petition" &&
        url !== "/profile" &&
        url !== "/logout" &&
        url !== "/edit"
    ) {
        res.redirect("/petition");
    } else if (
        req.session.userId !== undefined &&
        req.session.sigId &&
        url === "/petition"
    ) {
        res.redirect("/thanks");
    } else {
        next();
    }
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
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

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
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

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

app.get("/petition", (req, res) => {
    res.render("petition");
});

app.post("/petition", (req, res) => {
    const { sig } = req.body;
    if (sig) {
        db.addSigner(sig, req.session.userId)
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
    } else {
        res.render("petition", {
            errorMessage: "true",
        });
    }
});

app.get("/thanks", (req, res) => {
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

app.post("/thanks", (req, res) => {
    db.deleteSig(req.session.sigId)
        .then(() => {
            req.session.sigId = null;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("deleteSig error: ", err);
        });
});

app.get("/signers", (req, res) => {
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

app.get("/petition/signers/*", (req, res) => {
    const cityName = req.url.replace("/petition/signers/", "");
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

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
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

app.get("/edit", (req, res) => {
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

app.post("/edit", (req, res) => {
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
                            res.redirect("/edit");
                        })
                        .catch((err) => {
                            console.log("updateProfile error: ", err);
                            res.redirect("/edit");
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
                    res.redirect("/edit");
                })
                .catch((err) => {
                    console.log("updateProfile error: ", err);
                    res.redirect("/edit");
                });
        });
    }
});

app.get("*", (req, res) => {
    res.redirect("/");
});

app.listen(process.env.PORT || 8080, () => console.log("Server listening"));
