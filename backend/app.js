import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import adminRoutes from './routers/adminRoutes.js';
import loginuserrouters from './routers/loginuserrouters.js';



const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
connectDB();


app.use('/api/admin', adminRoutes);
app.use('/api/user', loginuserrouters);


ap.get("/api", (req, res) => {
    res.send("API is running...");
});


// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

export default app;

