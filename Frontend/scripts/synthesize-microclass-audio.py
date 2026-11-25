"""Codifica el audio local solicitado por generate-microclass-audio.mjs."""

import json
from pathlib import Path
import subprocess
import sys

import imageio_ffmpeg
from kokoro_onnx import Kokoro
from mutagen.mp3 import MP3

VOICE = "ef_dora"
LANGUAGE = "es-419"
SPEED = 0.96


def encode(samples, rate, target, max_seconds):
    """Normaliza el volumen y conserva una pausa breve antes de la siguiente escena."""
    filters = ["highpass=f=65", "loudnorm=I=-18:TP=-2:LRA=7"]
    if max_seconds:
        tempo = len(samples) / rate / (max_seconds - 0.18)
        if tempo > 1:
            filters.insert(0, f"atempo={tempo:.4f}")
    subprocess.run(
        [
            imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error",
            "-f", "f32le", "-ar", str(rate), "-ac", "1", "-i", "pipe:0",
            "-af", ",".join(filters), "-ar", "44100", "-b:a", "64k", str(target),
        ],
        input=samples.astype("<f4").tobytes(),
        check=True,
    )
    return MP3(target).info.length


def main():
    model, voices, output = sys.argv[1:]
    phrases = json.loads(sys.stdin.buffer.read())
    kokoro = Kokoro(model, voices)
    clips = {}
    for key, phrase in phrases.items():
        samples, rate = kokoro.create(phrase["text"], VOICE, speed=SPEED, lang=LANGUAGE)
        limit = phrase.get("maxSeconds")
        seconds = encode(samples, rate, Path(output) / f"{key}.mp3", limit)
        if seconds <= 0 or seconds >= 12 or (limit and seconds > limit):
            raise ValueError(f"Duración fuera de rango en {key}: {seconds:.2f} s")
        clips[key] = {"seconds": round(seconds, 2)}
    print(json.dumps({"voice": f"kokoro-v1.0:{VOICE}", "license": "Apache-2.0", "clips": clips}))


if __name__ == "__main__":
    main()
