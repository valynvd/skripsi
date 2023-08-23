import mongoose from 'mongoose';
import express from 'express';
import cors from "cors";

const app = express();
const DATABASE_URL = "mongodb+srv://gaizkavalencia1:NMubejO98EiraLQu@cluster0.p0ajoom.mongodb.net/databasewa?retryWrites=true&w=majority"

mongoose.connect(DATABASE_URL);