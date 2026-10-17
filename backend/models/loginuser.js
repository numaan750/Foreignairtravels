import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const loginuserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
        },
    password: {
        type: String,
        required: true
        },
        name: {
        type: String,
        required: true
        },
        email: {
        type: String,
        required: true,
        unique: true
        },
        phone: {
        type: String,
        required: true
        },
        address: {
        type: String,
        required: true
        },
        role: {
        type: String,
        required: true
        },

        createdAt: {
        type: Date,
        default: Date.now
        },
        updatedAt: {
        type: Date,
        default: Date.now
        }
    }, {timestamps: true});