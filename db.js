const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

module.exports.getSignerCount = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getSignature = (sigId) => {
    return db.query(`SELECT sig FROM signatures WHERE id = ($1)`, [sigId]);
};

module.exports.getSignerNames = () => {
    return db.query(`SELECT users.first, users.last FROM users
    INNER JOIN signatures ON users.id=signatures.user_id`);
};

module.exports.addSigner = (signature, userId) => {
    return db.query(
        `INSERT INTO signatures (sig, user_id)
    VALUES ($1, $2)
    RETURNING id`,
        [signature, userId]
    );
};

module.exports.addUser = (firstName, lastName, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id`,
        [firstName, lastName, email, password]
    );
};

module.exports.getCredentials = (email) => {
    return db.query(`SELECT password, id FROM users WHERE email = ($1)`, [
        email,
    ]);
};

module.exports.getSigId = (userId) => {
    return db.query(`SELECT id FROM signatures WHERE user_id = ($1)`, [userId]);
};
