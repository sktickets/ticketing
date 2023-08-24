import express, { Request, Response } from "express";
import {body} from "express-validator";
import {validateRequest} from "@sktickets/common";
import {User} from "../models/user";
import {BadRequestError} from "@sktickets/common";
import {Password} from "../services/password";
import jwt from "jsonwebtoken";

const route = express.Router();

route.post (
    '/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('you must supply a password ')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({email});

        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const passwordMatch = await Password.compare(existingUser.password, password);

        if (!passwordMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email,
        }, process.env.JWT_KEY! );

        req.session = {
            jwt: userJwt,
        };

        res.status(200).send(existingUser);
    });

export { route as signinRouter };
