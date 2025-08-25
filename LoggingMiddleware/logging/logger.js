import axios from "axios";

const LOG_SERVER_URL = "http://20.244.56.144/evaluation-service/logs";
const AUTH_TOKEN =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJwcmhhMjJpc2VAY21yaXQuYWMuaW4iLCJleHAiOjE3NTYxMDIzOTAsImlhdCI6MTc1NjEwMTQ5MCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImRmZjYzZjdlLWExZTYtNDYyOC04NGI0LWJhOTM5NjM0N2NkNSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InByYXRodmlyYWogaGFuaW1hbmFsZSIsInN1YiI6IjNkZGM2NWE0LTBmNDctNDJkZC05OTQ1LWZmMDllMWQ1NzA5YyJ9LCJlbWFpbCI6InByaGEyMmlzZUBjbXJpdC5hYy5pbiIsIm5hbWUiOiJwcmF0aHZpcmFqIGhhbmltYW5hbGUiLCJyb2xsTm8iOiIxY3IyMmlzMTA5IiwiYWNjZXNzQ29kZSI6InlVVlFYSyIsImNsaWVudElEIjoiM2RkYzY1YTQtMGY0Ny00MmRkLTk5NDUtZmYwOWUxZDU3MDljIiwiY2xpZW50U2VjcmV0IjoiYmp1U3FSektodXRGelBrQyJ9.0jUlx3nIWlO3QQFgFGIRmONTaB_cxoxKSeqUisQkTWI";
export function sendLog({ stack, level, pkg, message, extra }) {
	const logEntry = { stack, level, package: pkg, message, ...extra };
	return axios
		.post(LOG_SERVER_URL, logEntry, {
			headers: {
				Authorization: `Bearer ${AUTH_TOKEN}`,
				"Content-Type": "application/json",
			},
		})
		.catch((err) => {
			if (err.response) {
				console.error(
					"Failed to send log:",
					err.response.data,
					err.response.status
				);
			} else {
				console.error("Failed to send log:", err.message);
			}
		});
}

export function log(stack, level, pkg, message, extra = {}) {
	if (!stack || !level || !pkg || !message) {
		throw new Error("Missing required log fields");
	}
	sendLog({ stack, level, pkg, message, extra });
}
