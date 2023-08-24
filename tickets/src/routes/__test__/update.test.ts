import request from "supertest";
import { app } from '../../app';
import mongoose from "mongoose";
import { natsWrapper } from "../../NatsWrapper";
import {Ticket} from "../../models/ticket";

it('returns 404 if the provided id does not exists', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'fdf',
            price: 10,
        })
        .expect(404);
})

it('returns 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'fdf',
            price: 10,
        })
        .expect(401);

})

it('returns 401 if the user does not own ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'fasdf',
            price: 10
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'fdwewf',
            price: 100,
        })
        .expect(401);
})

it('returns 400 if the user provide invalid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'fasdf',
            price: 10
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'wewet',
            price: -100,
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 100,
        })
        .expect(400);
})

it('updates the ticket provided valid inputs ', async () => {
    const cookie = global.signin();
    const title = 'fdfasdf';
    const price = 230;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'fasdf',
            price: 10
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title, price })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
})

it('publishes an event', async () => {
    const cookie = global.signin();
    const title = 'fdfasdf';
    const price = 230;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'fasdf',
            price: 10
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title, price })
        .expect(200);

    expect(natsWrapper.client.publish).toBeCalledTimes(2);
})

it('rejects update of the ticket is reserved', async () => {
    const cookie = global.signin();
    const title = 'fdfasdf';
    const price = 230;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'fasdf',
            price: 10
        })
        .expect(201);

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title, price })
        .expect(400);
})
