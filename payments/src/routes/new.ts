import express, {Request, Response} from "express";
import {
	BadRequestError,
	NotAuthorizedError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest
} from '@sktickets/common';
import {body} from "express-validator";
import mongoose from "mongoose";
import {Order} from "../models/order";
import {stripeSdk} from "../stripeSdk";
import {Payment} from "../models/payment";
import {PaymentCreatedPublisher} from "../events/publishers/PaymentCreatedPublisher";
import {natsWrapper} from "../NatsWrapper";

const router = express.Router();

const handleRoute = async (req: Request, res: Response) => {
	const { token, orderId } = req.body;

	const order = await Order.findById(orderId);

	if (!order) {
		throw new NotFoundError();
	}

	if (order.userId !== req.currentUser?.id) {
		throw new NotAuthorizedError();
	}

	if (order.status === OrderStatus.Cancelled) {
		throw new BadRequestError('Cannot pay for a cancelled order');
	}

	const charge = await stripeSdk.charges.create({
		currency: 'usd',
		amount: order.price * 100,
		source: token,
	});

	const payment = Payment.build({
		stripeId: charge.id,
		orderId,
	});

	await payment.save();

	await new PaymentCreatedPublisher(natsWrapper.client).publish({
		id: payment.id,
		orderId: payment.orderId,
		stripeId: payment.stripeId,
	});

	res
		.status(201)
		.send({ id: payment.id });
}

router.post(
	'/api/payments',
	requireAuth,
	[
		body('token')
			.not()
			.isEmpty()
			.withMessage('token must be provided'),
		body('orderId')
			.not()
			.isEmpty()
			.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('orderId must be provided'),
	],
	validateRequest,
	handleRoute,
);

export { router as createChargeRouter };
