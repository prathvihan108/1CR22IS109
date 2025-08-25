import { log } from "./logger.js";

export default function loggingMiddleware(req, res, next) {
	const pkg = req.route ? req.route.path : "unknown";
	log("backend", "info", pkg, `Incoming request: ${req.method} ${req.url}`, {
		body: req.body,
		ip: req.ip,
	});

	res.on("finish", () => {
		let level =
			res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
		log("backend", level, pkg, `Response completed: ${req.method} ${req.url}`, {
			status: res.statusCode,
		});
	});
	next();
}
