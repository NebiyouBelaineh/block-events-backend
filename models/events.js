import { ObjectID } from 'bson';
import mongoose from 'mongoose';
import { title } from 'process';
const { Schema, model } = mongoose;

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zip_code: {
            type: String,
            required: false
        }
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', //ref is reference to the users in user model
        required: true
    },
    attendees: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }], //ref is reference to the users in user model
    tags: {
        type: Array,
        required: true
    },
});

const Event = model('Event', eventSchema);
export default Event;
