const express = require('express');
const app = express();
const cors = require('cors');
const dotEnv = require('dotenv');
const mongoose = require('mongoose');

// configure cors
app.use(cors());

// configure express to receive form data from client
app.use(express.json());

// dotEnv Configuration
dotEnv.config({path : './.env'});

const port = process.env.PORT || 5000;

// mongoDB Configuration
mongoose.connect(process.env.MONGO_DB_CLOUD_URL, {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useFindAndModify : false,
    useCreateIndex : true
}).then((response) => {
    console.log('Connected to MongoDB Cloud Successfully......');
}).catch((error) => {
    console.error(error);
    process.exit(1); // stop the process if unable to connect to mongodb
});

// simple URL
app.get('/', (request , response) => {
    response.send(`<h2>Welcome to React Social Backend App </h2>`);
});

// router configuration
app.use('/api/users' , require('./router/userRouter'));
app.use('/api/posts' , require('./router/postRouter'));
app.use('/api/profiles' , require('./router/profileRouter'));

app.listen(port, () => {
    console.log(`Express Server is Started at PORT : ${port}`);
});