const express = require('express');
const cors = require('cors');
require('dotenv').config();

// const dateFormat = require("./utils/dateFormat")
// dateFormat('NNMMYY|TT:TT');

const app = express();

// Increase payload limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure CORS to allow specific origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://mobile-spare-ecommece-client.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.error("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


// Import connections
const connection = require('./connection/connection');

// Start Connection
connection();

const commonRoute = require("./Routes/commonRoute");
const AuthRoute = require('./Routes/authRoute');
const CollectionRoute = require('./Routes/collectionRoute');
const productRoute = require("./Routes/productRoute");
const cartRoute = require("./Routes/cartRoute");
const addressRoute = require('./Routes/addressRoute');
const orderRoute = require("./Routes/orderRoute");
const brandRoute = require("./Routes/brandRoute");
const healthRoute = require('./Routes/healthRoute');
const wishlistRoute = require("./Routes/wishListRoute");
const bannerRoute = require("./Routes/bannerRoute");

app.use('/', commonRoute);
app.use('/auth', AuthRoute);
app.use('/collection', CollectionRoute);
app.use('/product', productRoute);
app.use('/cart', cartRoute);
app.use('/address', addressRoute);
app.use('/order', orderRoute);
app.use('/health', healthRoute);
app.use('/brand', brandRoute);
app.use('/wishlist', wishlistRoute)
app.use('/banner', bannerRoute)

// 404 Route (Catch-All)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Page Not Found' });
});

// Port address details
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`📂 Server is running on port ${port}`);
});


// /product