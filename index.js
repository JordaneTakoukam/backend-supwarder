const express = require("express");
const passport = require("passport");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const db = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const vaultRoutes = require("./routes/vaultRoutes");
const itemRoutes = require("./routes/itemRoutes");
const passwordRoutes = require("./routes/passwords");

require("dotenv").config();
db();
require("./config/passport");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/vaults", vaultRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/passward", passwordRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
