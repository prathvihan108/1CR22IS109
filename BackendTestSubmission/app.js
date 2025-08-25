import express from "express";
import loggingMiddleware from "../LoggingMiddleware/loggingMiddleware.js";
import urlsRouter from "./urls.js";

const app = express();
app.use(express.json());
app.use(loggingMiddleware);
app.use("/shorturls", urlsRouter);

app.use((err, req, res, next) => {
	res.status(500).json({ error: "Internal server error" });
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`URL Shortener running on port ${PORT}`);
});
