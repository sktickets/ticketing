import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Order} from "../../models/order";
import {OrderStatus} from "@sktickets/common";
import {stripeSdk} from '../../stripeSdk';
import {Payment} from "../../models/payment";

jest.mock('../../stripeSdk');

it('returns 404 when purchasing an order that does not exist ', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'asdawg2',
			orderId: new mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404);
});

it('returns 401 when purchasing an order that does not belongs to the user', async () => {
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price: 20,
		status: OrderStatus.Created,
	});

	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'asdawg2',
			orderId: order.id,
		})
		.expect(401);
});

it('returns 400 when purchasing a cancelled order', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 20,
		status: OrderStatus.Cancelled,
	});

	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'asdawg2',
			orderId: order.id,
		})
		.expect(400);
});

it('returns 201 with valid input', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 20,
		status: OrderStatus.Created,
	});

	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'tok_visa',
			orderId: order.id,
		})
		.expect(201);

	const chargeOptions = (stripeSdk.charges.create as jest.Mock).mock.calls[0][0];
	const charge = await (stripeSdk.charges.create as jest.Mock).mock.results[0].value;

	expect(chargeOptions.source).toEqual('tok_visa');
	expect(chargeOptions.amount).toEqual(20 * 100);
	expect(chargeOptions.currency).toEqual('usd');

	const payment = await Payment.findOne({
		orderId: order.id,
		stripeId: charge.id
	});

	expect(payment).toBeDefined();
})
