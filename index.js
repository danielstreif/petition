const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");
const db = require("./db");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(cookieParser());

app.use((req, res, next) => {
    if (req.cookies.signed && req.url === "/petition") {
        res.redirect("/thanks");
    } else if (req.cookies.signed || req.url === "/petition") {
        next();
    } else {
        res.redirect("/petition");
    }
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        title: "Petition",
    });
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;

    if (signature) {
        res.cookie("signed", true);
        db.addSigner(req.body.first, req.body.last)
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
