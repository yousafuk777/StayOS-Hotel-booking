import redis.asyncio as redis
from app.core.config import settings

# Redis client for caching and session management
redis_client = redis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
    socket_connect_timeout=2.0,
    socket_timeout=2.0,
)


async def get_redis() -> redis.Redis:
    """Dependency for getting Redis client."""
    return redis_client
