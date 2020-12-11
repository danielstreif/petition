const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.getSignerCount = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getSig = (sigId) => {
    return db.query(
        `SELECT signatures.sig, users.first FROM signatures
    JOIN users ON users.id = signatures.user_id
    WHERE signatures.id = ($1)`,
        [sigId]
    );
};

module.exports.deleteSig = (sigId) => {
    return db.query(`DELETE FROM signatures WHERE id = ($1)`, [sigId]);
};

module.exports.getSignerNames = () => {
    return db.query(`SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM users
    LEFT JOIN user_profiles ON users.id = user_profiles.user_id
    JOIN signatures ON users.id = signatures.user_id`);
};

module.exports.getSignersByCity = (city) => {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age, user_profiles.url FROM users
    LEFT JOIN user_profiles ON users.id = user_profiles.user_id
    JOIN signatures ON users.id = signatures.user_id
    WHERE LOWER(city) = LOWER($1)`,
        [city]
    );
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

module.exports.addUserProfile = (paramArr) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, TRIM($2), $3, $4)`,
        paramArr
    );
};

module.exports.getProfile = (userId) => {
    return db.query(
        `SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url FROM users
    LEFT JOIN user_profiles ON users.id = user_profiles.user_id
    WHERE users.id = $1`,
        [userId]
    );
};

module.exports.upsertProfile = (paramArr) => {
    return db.query(
        `INSERT INTO user_profiles (user_id, age, city, url)
VALUES ($1, $2, TRIM($3), $4)
ON CONFLICT (user_id)
DO UPDATE SET age = $2, city = TRIM($3), url = $4`,
        paramArr
    );
};

module.exports.updateCredentials = (userId, first, last, email) => {
    return db.query(
        `UPDATE users
        SET first = $2,
            last = $3,
            email = $4
        WHERE id = $1`,
        [userId, first, last, email]
    );
};

module.exports.updateCredentialsPW = (userId, first, last, email, password) => {
    return db.query(
        `UPDATE users
        SET first = $2,
            last = $3,
            email = $4,
            password = $5
        WHERE id = $1`,
        [userId, first, last, email, password]
    );
};

module.exports.deleteUser = (userId) => {
    return db.query(
        `DELETE FROM users 
    WHERE id = $1`,
        [userId]
    );
};
