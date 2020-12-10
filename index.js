const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { csrfSetup, requireLoggedInUser } = require("./middleware");
const routes = require("./routes");

exports.app = app;

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

app.use(csrfSetup);

app.use(requireLoggedInUser);

app.use(routes);

app.get("*", (req, res) => {
    res.redirect("/petition");
});

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () => console.log("Server listening"));
}
