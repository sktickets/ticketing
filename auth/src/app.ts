import express from 'express';
import 'express-async-errors';
import {json} from "body-parser";
import {currentUserRouter} from "./routers/current-user";
import {signinRouter} from "./routers/signin";
import {signoutRouter} from "./routers/signout";
import {signupRouter} from "./routers/signup";
import {errorHandler, NotFoundError} from "@sktickets/common";
import cookieSession from 'cookie-session';

const app = express();
app.set ('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all ('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler);

export { app };
