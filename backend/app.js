import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import adminRoutes from './routers/adminRoutes.js';
import loginuserrouters from './routers/loginuserrouters.js';
import packageRoutes from './routers/packegesrouters.js';
import uploadRoutes from './routers/uploadroutes.js';
import serviceRoutes from './routers/servicesrouters.js';
import airlineRoutes from './routers/airlinesrouters.js';
import countryRoutes from './routers/countriesrouters.js';
import bankAccountRoutes from './routers/bankaccountsrouters.js';
import announcementRoutes from './routers/announcementsrouters.js';
import popupImageRoutes from './routers/popupimagesrouters.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
connectDB();

app.use('/api/admin', adminRoutes);
app.use('/api/user', loginuserrouters);
app.use('/api/packages', packageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/airlines', airlineRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/popup-images', popupImageRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

export default app;