const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const booksRoute = require('./api/routes/books');
const authorsRoute = require('./api/routes/authors');

// port
const PORT = process.env.PORT || 4000;

// app
const app = express();

// cors middleware
app.use(cors());

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// morgan middelware
app.use(morgan('dev'));

// routes
app.use('/api', booksRoute);
app.use('/api', authorsRoute);

app.listen(PORT, err => {
    if (err) throw err;
    console.log(`Server started on port ${PORT}`);
});