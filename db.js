const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignerCount = () => {
    return db.query(`SELECT COUNT(*) FROM petition`);
};

module.exports.getSignature = (id) => {
    return db.query(`SELECT sig FROM petition WHERE id = ($1)`, [id]);
};

module.exports.getSignerNames = () => {
    return db.query(`SELECT first, last FROM petition`);
};

module.exports.addSigner = (firstName, lastName, signature) => {
    return db.query(
        `INSERT INTO petition (first, last, sig)
    VALUES ($1, $2, $3)
    RETURNING id`,
        [firstName, lastName, signature]
    );
};
