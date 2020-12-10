const supertest = require("supertest");
const { app } = require("./index");
const cookieSession = require("./__mocks__/cookie-session");
const db = require("./db");

jest.mock("./db");

// test("GET /petition sends 302 and redirects to /register when logged out", () => {
//     return supertest(app)
//         .get("/petition")
//         .then((res) => {
//             expect(res.statusCode).toBe(302);
//             expect(res.headers.location).toBe("/register");
//         });
// });
// test("GET /register sends 302 and redirects to /petition when logged in", () => {
//     cookieSession.mockSessionOnce({
//         userId: 123,
//     });
//     return supertest(app)
//         .get("/register")
//         .then((res) => {
//             expect(res.statusCode).toBe(302);
//             expect(res.headers.location).toBe("/petition");
//         });
// });

// test("GET /login sends 302 and redirects to /petition when logged in", () => {
//     cookieSession.mockSessionOnce({
//         userId: 123,
//     });
//     return supertest(app)
//         .get("/login")
//         .then((res) => {
//             expect(res.statusCode).toBe(302);
//             expect(res.headers.location).toBe("/petition");
//         });
// });

// test("GET /petition sends 302 and redirects to /thanks when logged in and signed", () => {
//     cookieSession.mockSessionOnce({
//         userId: 123,
//         sigId: 123,
//     });
//     return supertest(app)
//         .get("/petition")
//         .then((res) => {
//             expect(res.statusCode).toBe(302);
//             expect(res.headers.location).toBe("/thanks");
//         });
// });

// test("POST /petition sends 302 and redirects to /thanks when logged in and signed", () => {
//     cookieSession.mockSessionOnce({
//         userId: 123,
//         sigId: 123,
//     });
//     return supertest(app)
//         .post("/petition")
//         .then((res) => {
//             expect(res.statusCode).toBe(302);
//             expect(res.headers.location).toBe("/thanks");
//         });
// });

// test("GET /thanks sends 302 and redirects to /petition when logged in and not signed", () => {
//     cookieSession.mockSessionOnce({
//         userId: 123,
//     });
//     return supertest(app)
//         .get("/thanks")
//         .then((res) => {
//             expect(res.statusCode).toBe(302);
//             expect(res.headers.location).toBe("/petition");
//         });
// });

// test("GET /signers sends 302 and redirects to /petition when logged in and not signed", () => {
//     cookieSession.mockSessionOnce({
//         userId: 123,
//     });
//     return supertest(app)
//         .get("/signers")
//         .then((res) => {
//             expect(res.statusCode).toBe(302);
//             expect(res.headers.location).toBe("/petition");
//         });
// });

test("POST /petition sends 200 and redirects to /thanks when logged in and signature accepted", () => {
    cookieSession.mockSessionOnce({
        userId: 123,
    });
    db.addSigner.mockImplementationOnce(() => {Promise.resolve()});
    db.addSigner.mockResolvedValue({
        rows: { id: 123 },
    });
    return supertest(app)
        .post("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.headers.location).toBe("/thanks");
        });
});

test("POST /petition sends error when logged in and signature not accepted", () => {
    cookieSession.mockSessionOnce({
        userId: 123,
    });
    db.addSigner.mockImplementationOnce(() => {Promise.resolve(Error);});
    db.addSigner.mockResolvedValue(Error);
    return supertest(app)
        .post("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(404);
            expect(res.body).toContain(Error);
        });
});
