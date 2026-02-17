const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));



app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));



app.use((req, res, next) => {
  const _json = res.json.bind(res);

  res.json = (data) => {
    const fixed = JSON.parse(
      JSON.stringify(data, (_k, v) =>
        typeof v === 'bigint' ? Number(v) : v
      )
    );

    return _json(fixed);
  };

  next();
});


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "API Is Running"
  });
});


app.use('/auth', require('./routers/authrouter'));
app.use('/users', require('./routers/userrouter'));
app.use('/categories', require('./routers/categoryrouter'));
app.use('/products', require('./routers/productrouter'));
app.use('/cart', require('./routers/cartrouter'));
app.use('/orders', require('./routers/orderrouter'));



app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});



app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});

app.listen(port, () => {
  console.log(`🚀 Server Started at Port ${port}`);
});
