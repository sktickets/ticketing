import mongoose from "mongoose";
import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {Order} from "../../models/order";
import {OrderStatus} from "@sktickets/common";
import { natsWrapper } from "../../NatsWrapper";

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/orders')
        .send({});

    expect(response.status).not.toEqual(404);
})

it('can only be accessed if the user is signed in', async () => {
    await request(app)
        .post('/api/orders')
        .send({})
        .expect(401);
})

it('returns a status other than 401 if the user signed in ', async () => {
    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({});

    expect(response.status).not.toEqual(401 );
})

it('returns an error if an invalid ticketId is provided', async () => {
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ })
        .expect(400 );

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: 'r23r23'})
        .expect(400 );
})

it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId })
        .expect(404);
})

it('returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    const order = Order.build({
        ticket,
        userId: '123',
        status: OrderStatus.Created,
        expiresAt: new Date(),
    })
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(400);
})

it('reserves the ticket', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(201 );
})

it('emits an order created event', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(201 );

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
