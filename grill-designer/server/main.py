"""Entry point: python -m server.main (run from grill-designer/)."""
import os
from pathlib import Path

import uvicorn

ROOT = Path(__file__).resolve().parents[1]
env_file = ROOT / ".env.staging"
if env_file.exists():
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

from server.app import create_app  # noqa: E402

app = create_app()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("GGD_PORT", "8800")))
