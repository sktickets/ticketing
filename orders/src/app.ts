import express from 'express';
import 'express-async-errors';
import {json} from "body-parser";
import {errorHandler, NotFoundError, currentUser} from "@sktickets/common";
import cookieSession from 'cookie-session';
import {newOrderRouter} from "./routes/new";
import {deleteOrderRouter} from "./routes/delete";
import {indexOrderRouter} from "./routes";
import {showOrderRouter} from "./routes/show";

const app = express();
app.set ('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);

app.use(currentUser);
app.use(deleteOrderRouter);
app.use(newOrderRouter);
app.use(indexOrderRouter);
app.use(showOrderRouter);

app.all ('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler);

export { app };
