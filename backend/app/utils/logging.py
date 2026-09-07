import logging
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger("medikiosk.api")

class PrivacyAwareLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs HTTP request method, path, status, and latency.
    Strictly avoids logging headers (auth tokens, cookies) or request/response payloads
    containing Protected Health Information (PHI) or Personally Identifiable Information (PII).
    """

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        method = request.method
        url_path = request.url.path

        try:
            response: Response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            status_code = response.status_code

            logger.info(
                f"{method} {url_path} - Status: {status_code} - Latency: {process_time:.2f}ms"
            )
            return response
        except Exception as exc:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"{method} {url_path} - FAILED with unhandled exception - Latency: {process_time:.2f}ms: {exc.__class__.__name__}"
            )
            raise exc
