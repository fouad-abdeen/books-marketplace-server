import { AuthRouter } from "./auth.router.js";
import { BookRouter } from "./book.router.js";
import { BookstoreRouter } from "./bookstore.router.js";
import { CartRouter } from "./cart.router.js";
import { GenreRouter } from "./genre.router.js";
import { OrderRouter } from "./order.router.js";
import { UserRouter } from "./user.router.js";

const routers = [
  AuthRouter,
  BookRouter,
  BookstoreRouter,
  CartRouter,
  GenreRouter,
  OrderRouter,
  UserRouter,
];

export default routers;
