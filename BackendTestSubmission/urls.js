import express from "express";
import { log } from "../LoggingMiddleware/logging/logger.js"; // Adjust import as needed

const router = express.Router();
const urlMap = new Map();

function generateShortcode(length = 6) {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++)
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	return result;
}

router.post("/shorten", (req, res) => {
	const { url, shortcode, validity } = req.body;
	if (!url) {
		log("backend", "error", "controller", "Missing URL in request", {
			body: req.body,
		});
		return res.status(400).json({ error: "Missing URL" });
	}
	let code = shortcode || generateShortcode();
	if (urlMap.has(code)) {
		log("backend", "warn", "repository", "Shortcode collision", {
			shortcode: code,
		});
		return res.status(409).json({ error: "Shortcode already exists" });
	}
	let expiry = validity ? parseInt(validity) : 30;
	urlMap.set(code, { url, expiry: Date.now() + expiry * 60000 });
	log("backend", "info", "repository", "Short URL created", {
		shortcode: code,
		url,
		expiry,
	});
	return res
		.status(201)
		.json({ shortUrl: `${req.protocol}://${req.get("host")}/${code}`, expiry });
});

router.get("/:shortcode", (req, res) => {
	const code = req.params.shortcode;
	const entry = urlMap.get(code);
	if (!entry) {
		log("backend", "error", "handler", "Non-existent shortcode access", {
			shortcode: code,
		});
		return res.status(404).json({ error: "Shortcode not found" });
	}
	if (Date.now() > entry.expiry) {
		log("backend", "warn", "handler", "Shortcode expired", { shortcode: code });
		urlMap.delete(code);
		return res.status(410).json({ error: "Shortcode expired" });
	}
	log("backend", "info", "handler", "Redirecting to original URL", {
		shortcode: code,
		url: entry.url,
	});
	return res.redirect(entry.url);
});

export default router;
