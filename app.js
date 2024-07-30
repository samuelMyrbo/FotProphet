require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');

const connectDB = require('./server/config/db')
const { isActiveRoute } = require('./server/helpers/routeHelpers');

const app = express();
//might use web provder port
const PORT = process.env.PORT;

//CONNECT TO DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
    //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
  }));
 

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


//Templating engine
app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));


app.locals.isActiveRoute = isActiveRoute; 



app.listen(PORT, ()=> {
    console.log(`App listening on port ${PORT}`)
});