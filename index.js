import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose/index.js';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';

import degreeRoutes from './routes/degrees.js';
import collegeRoutes from './routes/colleges.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/contact.js';

dotenv.config();
const app = express();
app.use(express.static('public'));

app.use(express.json({}));
app.use(compression());
{ }
app.use(bodyParser.json({ limit: '100mb', extended: true}));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true}));
app.use(cors());

app.use('/degrees', degreeRoutes);
app.use('/colleges', collegeRoutes);
app.use('/user', userRoutes);
app.use('/contact', messageRoutes);

const HOST = process.env.HOST;
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send(`Server running on ${HOST}${PORT}`);
  })

mongoose.set('strictQuery', true);
mongoose.connect(process.env.CONNECTION_URL,{
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(()=>{
        app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
}).catch((error)=>console.log(error.message));