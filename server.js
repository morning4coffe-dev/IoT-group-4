const express = require("express");
const app = express();

app.use(express.json());

const measurementRouter = require("./routes/measurement");
app.use("/humigrow", measurementRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HumiGrow backend listening on port ${PORT}`);
});

module.exports = app;
