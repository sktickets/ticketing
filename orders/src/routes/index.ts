import express, { Request, Response } from "express";
import {requireAuth} from "@sktickets/common";
import {Order} from "../models/order";

const router = express.Router();

const handleRoute = async (req: Request, res: Response) => {
    const orders = await Order
        .find({ userId: req.currentUser!.id })
        .populate('ticket')

    res.send(orders);
}

router.get(
    '/api/orders',
    requireAuth,
    handleRoute,
);

export { router as indexOrderRouter };
