#!/usr/bin/env python3
"""Run from grill-designer/: python tools/check_isolation.py
Exits non-zero if the designer source references production services or secrets."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from server.isolation import scan_source_tree  # noqa: E402

findings = scan_source_tree()
for f in findings:
    print(f"FAIL {f['file']}: {f['issue']}")
print("PASS: no production references or secrets found" if not findings else f"{len(findings)} finding(s)")
sys.exit(1 if findings else 0)
