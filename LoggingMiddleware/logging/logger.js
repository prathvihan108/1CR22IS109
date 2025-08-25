import axios from "axios";

const LOG_SERVER_URL = "http://20.244.56.144/evaluation-service/logs";

export function sendLog({ stack, level, pkg, message, extra }) {
	const logEntry = { stack, level, package: pkg, message, ...extra };
	return axios.post(LOG_SERVER_URL, logEntry).catch((err) => {
		console.error("Failed to send log:", err.message);
	});
}

export function log(stack, level, pkg, message, extra = {}) {
	if (!stack || !level || !pkg || !message) {
		throw new Error("Missing required log fields");
	}
	sendLog({ stack, level, pkg, message, extra });
}
