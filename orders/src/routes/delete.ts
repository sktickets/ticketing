import express, { Request, Response } from "express";
import {NotAuthorizedError, NotFoundError, requireAuth} from "@sktickets/common";
import {Order, OrderStatus} from "../models/order";
import {OrderCancelledPublisher} from "../events/publishers/OrderCancelledPublisher";
import {natsWrapper} from "../NatsWrapper";

const router = express.Router();

const handleRoute = async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // publishing an event saying this was cancelled!
    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id
        }
    })

    res.status(204).send({});
};

router.delete(
    '/api/orders/:orderId',
    requireAuth,
    handleRoute,
);

export { router as deleteOrderRouter };
