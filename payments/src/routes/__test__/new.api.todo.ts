import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Order} from "../../models/order";
import {OrderStatus} from "@sktickets/common";
import {stripeSdk} from '../../stripeSdk';

it('returns 201 with valid input', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();

	const price = Math.floor(Math.random() * 10000);

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price,
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

	const spriteCharges = await stripeSdk.charges.list({ limit: 50 });
	const spriteCharge = spriteCharges.data.find(charge => charge.amount === price * 100);

	expect(spriteCharge).toBeDefined();
	expect(spriteCharge!.currency).toEqual('usd');
})
