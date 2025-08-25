import express from "express";
import { log } from "../LoggingMiddleware/logger.js";

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

router.post("/", (req, res) => {
	const { url, validity, shortcode } = req.body;
	if (!url || typeof url !== "string" || !/^https?:\/\//.test(url)) {
		log("backend", "error", "controller", "Invalid or missing URL", {
			body: req.body,
		});
		return res.status(400).json({ error: "Invalid or missing URL" });
	}
	let code = shortcode || generateShortcode();
	if (urlMap.has(code)) {
		log("backend", "warn", "repository", "Shortcode collision", {
			shortcode: code,
		});
		return res.status(409).json({ error: "Shortcode already exists" });
	}
	// Expiry in minutes, default 30
	let expiry = validity ? parseInt(validity) : 30;
	const expiryDate = new Date(Date.now() + expiry * 60000).toISOString();
	urlMap.set(code, {
		url,
		creationDate: new Date().toISOString(),
		expiry: expiryDate,
		clicks: [],
	});
	log("backend", "info", "repository", "Short URL created", {
		shortcode: code,
		url,
		expiry: expiryDate,
	});
	return res.status(201).json({
		shortLink: `${req.protocol}://${req.get("host")}/shorturls/${code}`,
		expiry: expiryDate,
	});
});

// Redirect handler and click statistics
router.get("/:shortcode", (req, res) => {
	const code = req.params.shortcode;
	const entry = urlMap.get(code);
	if (!entry) {
		log("backend", "error", "handler", "Shortcode not found", {
			shortcode: code,
		});
		return res.status(404).json({ error: "Shortcode not found" });
	}
	// Click statistics: If "stats" query present, show stats; else, redirect
	if (req.query.stats !== undefined) {
		// Provide usage statistics
		return res.json({
			url: entry.url,
			creationDate: entry.creationDate,
			expiry: entry.expiry,
			clickCount: entry.clicks.length,
			clicks: entry.clicks,
		});
	}
	// Expiry check
	if (new Date() > new Date(entry.expiry)) {
		log("backend", "warn", "handler", "Shortcode expired", { shortcode: code });
		urlMap.delete(code);
		return res.status(410).json({ error: "Shortcode expired" });
	}
	// Collect click statistics
	const clickInfo = {
		timestamp: new Date().toISOString(),
		referrer: req.get("Referer") || "direct",
		ip: req.ip,
		// For geo, add placeholder (would normally use geo IP service)
		geo: "unknown",
	};
	entry.clicks.push(clickInfo);
	log("backend", "info", "handler", "Redirecting to original URL", {
		shortcode: code,
		url: entry.url,
	});
	return res.redirect(entry.url);
});

export default router;
