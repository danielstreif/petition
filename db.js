const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignerCount = () => {
    return db.query(`SELECT COUNT(*) FROM petition`);
};

module.exports.getSignerNames = () => {
    return db.query(`SELECT first, last FROM petition`);
};

module.exports.addSigner = (firstName, lastName) => {
    const q = `INSERT INTO petition (first, last, signature)
    VALUES ($1, $2, true)`;
    const params = [firstName, lastName];

    return db.query(q, params);
};
