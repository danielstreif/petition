const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

const { sessionSecret } = require("./secrets");
const db = require("./db");
const { hash, compare } = require("./bc");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: sessionSecret,
        maxAge: 1000 * 60 * 60 * 24 * 14,
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
    if (
        req.session.userId === undefined &&
        req.url !== "/register" &&
        req.url !== "/login"
    ) {
        res.redirect("/register");
    } else if (
        req.session.userId !== undefined &&
        !req.session.sigId &&
        req.url !== "/petition" &&
        req.url !== "/logout"
    ) {
        res.redirect("/petition");
    } else if (
        req.session.userId !== undefined &&
        req.session.sigId &&
        req.url === "/petition"
    ) {
        res.redirect("/thanks");
    } else {
        next();
    }
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition");
});

app.post("/petition", (req, res) => {
    const { sig } = req.body;

    if (sig) {
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
    } else {
        res.redirect("/petition");
    }
});

app.get("/thanks", (req, res) => {
    db.getSignerCount()
        .then(({ rows }) => {
            const sigCount = rows[0].count;
            db.getSignature(req.session.sigId).then(({ rows }) => {
                res.render("thanks", {
                    sig: rows[0].sig,
                    sigCount,
                });
            });
        })
        .catch((err) => {
            console.log("getSignerCount error: ", err);
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

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    hash(req.body.password)
        .then((hash) => {
            db.addUser(req.body.first, req.body.last, req.body.email, hash)
                .then(({ rows }) => {
                    req.session.userId = rows[0].id;
                    res.redirect("/login");
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
    db.getCredentials(req.body.email)
        .then(({ rows }) => {
            const userId = rows[0].id;
            compare(req.body.password, rows[0].password).then((result) => {
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

app.get("*", (req, res) => {
    res.redirect("/");
});

app.listen(8080, () => console.log("Server running on 8080"));
