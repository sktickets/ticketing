import express, {Request, Response} from "express";

const route = express.Router();

route.post(
    '/api/users/signout',
    (req: Request, res: Response ) => {
        req.session = null;

        res.send({}); 
    });

export { route as signoutRouter };
