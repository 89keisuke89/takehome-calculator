#!/usr/bin/env python3
import base64
import html
import json
import os
import re
import sys
from typing import Any, Dict, List, Optional

import feedparser
import requests


DEFAULT_RSS = "https://www.cnbc.com/id/19746125/device/rss/rss.html"
DEFAULT_MAX_ARTICLES = 3
OPENAI_MODEL = "gpt-4.1-mini"
LOCAL_CREDENTIALS_FILE = os.path.join(
    os.path.dirname(__file__),
    "wordpress-local",
    "shared",
    "wordpress-credentials.json",
)


def getenv(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def load_local_credentials() -> Dict[str, str]:
    path = getenv("WORDPRESS_CREDENTIALS_FILE", LOCAL_CREDENTIALS_FILE)
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return {}
    if not isinstance(data, dict):
        return {}
    return {str(key): str(value) for key, value in data.items() if isinstance(value, str)}


def strip_html(raw: str) -> str:
    text = re.sub(r"<[^>]+>", " ", raw or "")
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def truncate(text: str, limit: int = 260) -> str:
    clean = strip_html(text)
    if len(clean) <= limit:
        return clean
    return clean[: limit - 1].rstrip() + "..."


def fallback_summary(title: str, body: str) -> str:
    body = strip_html(body)
    if not body:
        return f"{title} に関する金融ニュースの要点を簡潔にまとめた記事です。"
    sentences = re.split(r"(?<=[.!?。！？])\s+", body)
    selected = [s for s in sentences if s][:2]
    if not selected:
        selected = [body[:200]]
    summary = " ".join(selected).strip()
    return truncate(summary, 300)


def openai_summary(api_key: str, title: str, body: str, link: str) -> Optional[str]:
    payload = {
        "model": OPENAI_MODEL,
        "input": [
            {
                "role": "user",
                "content": (
                    "以下の金融ニュースを日本語で2-3文に要約してください。"
                    " 重要ポイントを優先し、憶測は書かないでください。\n\n"
                    f"タイトル: {title}\n"
                    f"本文: {truncate(body, 2000)}\n"
                    f"URL: {link}\n"
                ),
            }
        ],
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    try:
        resp = requests.post(
            "https://api.openai.com/v1/responses",
            headers=headers,
            json=payload,
            timeout=30,
        )
    except requests.RequestException as exc:
        print(f"[WARN] OpenAI API request failed: {exc}", file=sys.stderr)
        return None

    if not resp.ok:
        print(
            f"[WARN] OpenAI API returned {resp.status_code}: {truncate(resp.text, 180)}",
            file=sys.stderr,
        )
        return None

    try:
        data = resp.json()
    except json.JSONDecodeError:
        print("[WARN] OpenAI API response is not JSON.", file=sys.stderr)
        return None

    text = data.get("output_text")
    if isinstance(text, str) and text.strip():
        return truncate(text.strip(), 320)

    try:
        output = data.get("output", [])
        for item in output:
            for content in item.get("content", []):
                candidate = content.get("text")
                if isinstance(candidate, str) and candidate.strip():
                    return truncate(candidate.strip(), 320)
    except Exception:
        return None
    return None


def create_wp_post(
    wordpress_url: str,
    wordpress_user: str,
    wordpress_app_password: str,
    title: str,
    summary: str,
    source_link: str,
) -> Dict[str, Any]:
    credentials = f"{wordpress_user}:{wordpress_app_password}".encode("utf-8")
    token = base64.b64encode(credentials).decode("ascii")
    headers = {
        "Authorization": f"Basic {token}",
        "Content-Type": "application/json",
    }
    content_html = (
        f"<p>{html.escape(summary)}</p>"
        f'<p>引用元: <a href="{html.escape(source_link)}">{html.escape(source_link)}</a></p>'
    )
    payload = {
        "title": title,
        "content": content_html,
        "status": "draft",
    }

    endpoints = [
        wordpress_url.rstrip("/") + "/wp-json/wp/v2/posts",
        wordpress_url.rstrip("/") + "/index.php?rest_route=/wp/v2/posts",
        wordpress_url.rstrip("/") + "/index.php?rest_route=/finance-site/v1/draft-posts",
    ]
    last_response: Dict[str, Any] = {
        "ok": False,
        "status_code": None,
        "error": "No WordPress endpoint attempted",
        "response_text": "",
    }

    for endpoint in endpoints:
        try:
            resp = requests.post(endpoint, headers=headers, json=payload, timeout=30)
        except requests.RequestException as exc:
            last_response = {
                "ok": False,
                "endpoint": endpoint,
                "status_code": None,
                "error": str(exc),
                "response_text": "",
            }
            continue

        response_data: Dict[str, Any] = {
            "ok": resp.ok,
            "endpoint": endpoint,
            "status_code": resp.status_code,
            "response_text": truncate(resp.text, 500),
        }
        try:
            body = resp.json()
        except json.JSONDecodeError:
            body = None

        if isinstance(body, dict):
            response_data["response_json"] = body
            if resp.ok:
                response_data["post_id"] = body.get("id")
                response_data["post_link"] = body.get("link")
                return response_data

        if resp.ok and "text/html" not in resp.headers.get("content-type", ""):
            return response_data

        last_response = response_data

    return last_response


def main() -> int:
    local_credentials = load_local_credentials()
    rss_feed_url = getenv("RSS_FEED_URL", DEFAULT_RSS)
    wordpress_url = getenv("WORDPRESS_URL") or local_credentials.get("site_url", "")
    wordpress_user = getenv("WORDPRESS_USER") or local_credentials.get("username", "")
    wordpress_app_password = getenv("WORDPRESS_APP_PASSWORD") or local_credentials.get(
        "application_password", ""
    )
    openai_api_key = getenv("OPENAI_API_KEY")
    max_articles_raw = getenv("MAX_ARTICLES", str(DEFAULT_MAX_ARTICLES))

    try:
        max_articles = max(1, int(max_articles_raw))
    except ValueError:
        max_articles = DEFAULT_MAX_ARTICLES

    print("=== Auto Financial Blog Runner ===")
    print(f"RSS_FEED_URL: {rss_feed_url}")
    print(f"WORDPRESS_URL: {wordpress_url or '[NOT SET]'}")
    print(f"WORDPRESS_USER: {wordpress_user or '[NOT SET]'}")
    print(f"WORDPRESS_APP_PASSWORD: {'[SET]' if wordpress_app_password else '[NOT SET]'}")
    print(f"OPENAI_API_KEY: {'[SET]' if openai_api_key else '[NOT SET]'}")
    if local_credentials:
        print(f"LOCAL_CREDENTIALS_FILE: {LOCAL_CREDENTIALS_FILE}")
    print(f"MAX_ARTICLES: {max_articles}")
    print()

    feed = feedparser.parse(rss_feed_url)
    if getattr(feed, "bozo", False):
        print(f"[WARN] RSS parse bozo_exception: {getattr(feed, 'bozo_exception', 'unknown')}")

    entries: List[Any] = list(getattr(feed, "entries", []))
    if not entries:
        print("[ERROR] RSS entries are empty.")
        return 1

    wp_enabled = all([wordpress_url, wordpress_user, wordpress_app_password])
    if not wp_enabled:
        print("[WARN] WordPress environment variables are incomplete. Posting will be skipped.")

    for idx, entry in enumerate(entries[:max_articles], start=1):
        title = strip_html(getattr(entry, "title", "Untitled"))
        link = getattr(entry, "link", "")
        body = getattr(entry, "summary", "") or getattr(entry, "description", "")

        summary = None
        if openai_api_key:
            summary = openai_summary(openai_api_key, title, body, link)
        if not summary:
            summary = fallback_summary(title, body)

        post_title = f"[自動要約] {title}"

        print(f"--- Article {idx} ---")
        print(f"Title: {post_title}")
        print(f"Summary: {summary}")
        print(f"Source: {link}")

        if wp_enabled:
            wp_result = create_wp_post(
                wordpress_url=wordpress_url,
                wordpress_user=wordpress_user,
                wordpress_app_password=wordpress_app_password,
                title=post_title,
                summary=summary,
                source_link=link,
            )
            print("WordPress Response:")
            print(json.dumps(wp_result, ensure_ascii=False, indent=2))
        else:
            print("WordPress Response:")
            print(
                json.dumps(
                    {
                        "ok": False,
                        "status_code": None,
                        "error": "WORDPRESS_URL/WORDPRESS_USER/WORDPRESS_APP_PASSWORD not fully set",
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )
        print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
