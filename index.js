const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const helmet = require("helmet");
const csurf = require("csurf");

const { sessionSecret } = require("./secrets");
const db = require("./db");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    helmet({
        frameguard: { action: "SAMEORIGIN" },
    })
);

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
    if (req.session.signed && req.url === "/petition") {
        res.redirect("/thanks");
    } else if (req.session.signed || req.url === "/petition") {
        next();
    } else {
        res.redirect("/petition");
    }
});

app.get("/", (req, red) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        title: "Petition",
    });
});

app.post("/petition", (req, res) => {
    const { sig } = req.body;

    if (sig) {
        req.session.signed = true;
        db.addSigner(req.body.first, req.body.last, req.body.sig)
            .then(() => {
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("addSigner error: ", err);
                res.render("petition", {
                    title: "Petition",
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
            res.render("thanks", {
                title: "You signed!",
                count: rows[0].count,
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
                title: "Signers",
                signers: rows,
            });
        })
        .catch((err) => {
            console.log("getSignerNames error: ", err);
        });
});

app.listen(8080, () => console.log("Server running on 8080"));
