require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const fileupload = require("express-fileupload");

mongoose.connect(process.env.DB_CONNECT);
mongoose.connection.on("error", () => console.log("DB is not connected"));
mongoose.connection.on("connected", () => console.log(`DB is connected `));

const app = express();
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(
  fileupload({
    useTempFiles: true,
  })
);

app.use("/user", require("./server/Routes/UserRoutes"));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`App listening at port:${port}`));
