import mongoose from "mongoose";

export const stripeSdk = {
	charges: {
		// create: jest.fn().mockResolvedValue({}),
		create: jest.fn().mockImplementation(() => Promise.resolve({ id: new mongoose.Types.ObjectId().toHexString() })),
	}
}
