import express, { Request, Response } from "express";
import {NotAuthorizedError, NotFoundError, requireAuth, validateRequest} from "@sktickets/common";
import {Order} from "../models/order";

const router = express.Router();

const handleRoute = async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    res.send(order);
}

router.get(
    '/api/orders/:orderId',
    validateRequest,
    handleRoute,
);


export { router as showOrderRouter };
