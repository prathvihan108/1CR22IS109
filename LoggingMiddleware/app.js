// app.js
import express from "express";
import loggingMiddleware from "./logging/loggingMiddleware.js";

const app = express();
app.use(express.json());
app.use(loggingMiddleware);

// ... routes/controllers

app.listen(3000, () => {
	console.log("Server started on port 3000");
});
