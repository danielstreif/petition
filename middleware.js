exports.requireLoggedInUser = (req, res, next) => {
    if (
        !req.session.userId &&
        req.url !== "/register" &&
        req.url !== "/login"
    ) {
        return res.redirect("/register");
    }
    next();
};

exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect("/petition");
    }
    next();
};

exports.requireSignedPetition = (req, res, next) => {
    if (!req.session.sigId) {
        return res.redirect("/petition");
    }
    next();
};

exports.requireUnsignedPetition = (req, res, next) => {
    if (req.session.sigId) {
        return res.redirect("/thanks");
    }
    next();
};

exports.csrfSetup = (req, res, next) => {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
};