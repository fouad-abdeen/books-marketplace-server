import { AuthRouter } from "./auth.router.js";
import { BookRouter } from "./book.router.js";
import { BookstoreRouter } from "./bookstore.router.js";
import { GenreRouter } from "./genre.router.js";

const routers = [AuthRouter, BookRouter, BookstoreRouter, GenreRouter];

export default routers;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The user's id
 *         email:
 *           type: string
 *           description: The user's email
 *         name:
 *           type: string
 *           description: The user's name
 *         role:
 *           type: string
 *           enum: ["bookstore_owner", "admin", "user"]
 *           description: The user's role
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether the user's email is verified
 */
