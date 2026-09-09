import urllib.parse
import urllib.request
import re
from fastapi import APIRouter, Query, Response, HTTPException

router = APIRouter(prefix="/tts", tags=["TTS"])

_AUDIO_CACHE: dict[str, bytes] = {}

def split_text_into_chunks(text: str, max_chunk_len: int = 180) -> list[str]:
    clean = re.sub(r'[\s]+', ' ', text).strip()
    if len(clean) <= max_chunk_len:
        return [clean]
    parts = re.split(r'([.।!?।,;\n]+)', clean)
    chunks: list[str] = []
    current = ""
    for part in parts:
        if len(current) + len(part) <= max_chunk_len:
            current += part
        else:
            if current.strip():
                chunks.append(current.strip())
            current = part
    if current.strip():
        chunks.append(current.strip())
    return chunks or [clean[:max_chunk_len]]

def fetch_tts_chunk(chunk: str, lang: str) -> bytes:
    q = urllib.parse.quote(chunk)
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={q}&tl={lang}&client=tw-ob"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"}
    )
    with urllib.request.urlopen(req, timeout=8) as res:
        return res.read()

@router.get("")
def get_tts_audio(text: str = Query(..., min_length=1), lang: str = Query("en")):
    lang_clean = lang.strip().lower()
    clean_text = text.replace('"', '').replace('“', '').replace('”', '').strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Empty text provided")

    cache_key = f"{lang_clean}:{clean_text}"
    if cache_key in _AUDIO_CACHE:
        return Response(content=_AUDIO_CACHE[cache_key], media_type="audio/mpeg")

    try:
        chunks = split_text_into_chunks(clean_text)
        audio_parts: list[bytes] = []
        for chunk in chunks[:6]:
            if chunk.strip():
                audio_parts.append(fetch_tts_chunk(chunk, lang_clean))
        
        combined_audio = b"".join(audio_parts)
        if len(_AUDIO_CACHE) < 500:
            _AUDIO_CACHE[cache_key] = combined_audio

        return Response(content=combined_audio, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS stream error: {str(e)}")
