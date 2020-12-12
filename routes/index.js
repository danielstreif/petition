const express = require("express");

const router = express.Router();

const homeRouter = require("./home");
const loginRouter = require("./login");
const logoutRouter = require("./logout");
const petitionRouter = require("./petition");
const profileRouter = require("./profile");
const registerRouter = require("./register");
const signersRouter = require("./signers");
const thanksRouter = require("./thanks");

router.use(homeRouter);
router.use(loginRouter);
router.use(logoutRouter);
router.use(petitionRouter);
router.use(profileRouter);
router.use(registerRouter);
router.use(signersRouter);
router.use(thanksRouter);

module.exports = router;
