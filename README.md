
<div align="center">

## 🚨 Patronet OpenEnv — Emergency Response RL Environment

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![OpenEnv](https://img.shields.io/badge/OpenEnv-Agent_Env-4B8BBE)](https://github.com/meta-llama/openenv)
[![TRL](https://img.shields.io/badge/TRL-GRPO-FF9A00)](https://github.com/huggingface/trl)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![uv](https://img.shields.io/badge/uv-Package_Manager-FFD43B)](https://github.com/astral-sh/uv)

</div>

<img src="Images/fire_house.png" width="800" alt="Patronet OpenEnv" />

> **OpenEnv-compatible MDP** for emergency triage & responder dispatch. Train LLM agents with **GRPO**, **dense + sparse rewards**, and **verifier-based** scoring — all behind a **FastAPI** HTTP API.

---

### 📋 At a glance

| | |
|---|---|
| **What** | RL environment: triage victim → dispatch correct responder within step budget |
| **Stack** | OpenEnv, FastAPI, GRPOTrainer (TRL), Docker, **uv** |
| **MDP** | State (victim, responders, time) → Actions (triage, route, wait) → Dense + sparse rewards + verifiers |

---

### 🗂 Project layout

| Path | Role |
|------|------|
| `patronet/env.py` | Core MDP: state, `step()`, transitions, deterioration |
| `patronet/environment.py` | OpenEnv adapter (`Environment` interface) |
| `patronet/models.py` | `PatronetAction`, `PatronetObservation` (Pydantic) |
| `patronet/rubric.py` | Dense rewards (per-step) + sparse (episode-end) + verifiers |
| `patronet/app.py` | FastAPI server (`/reset`, `/step`, `/schema`, `/health`) |
| `patronet/client.py` | HTTP client for remote env |
| `patronet/train.py` | GRPO `rollout_func`: reset → LLM actions → step → reward |
| `data/ontology.json` | Crisis types → valid responders, escalation, time window |
| `data/triage.json` | Crisis type → question tags (triage bank) |
| `frontend/` | Web UI to run & visualize episodes |

---

---
title: Patronet Emergency Environment Server
emoji: 🚨
colorFrom: red
colorTo: blue
sdk: docker
app_port: 8000
tags: [openenv, rl, grpo, fastapi]
---
<div align="center">

### ⚡ Quick start

```bash
uv sync
uv run python -m patronet.app   # Server at http://localhost:8000
```

**Client:**

```python
from patronet.client import PatronetEmergencyEnv

with PatronetEmergencyEnv(base_url="http://localhost:8000") as env:
    obs = env.reset()
    obs, reward, done, info = env.step(action)
```
---

### 🔧 Actions & rewards (summary)

| Actions | Description |
|---------|-------------|
| `triage_assess` | Ask victim a question by `question_tag` (from triage bank) |
| `route_responder` | Dispatch by `responder_type` (valid per ontology) |
| `wait` | Pass step (penalized if victim deteriorating/critical) |

| Reward type | Examples |
|-------------|----------|
| **Dense** (per step) | Triage +8 / −5, routing +20 / −15, idle −15, deterioration −15 |
| **Sparse** (episode end) | Rescue +50, partial +20, failure −50 |
| **Verifiers** | Rescue, triage, routing scores in [0, 1] for curriculum/replay |

---

### 📐 Key constants

| Constant | Value |
|----------|--------|
| Step budget | 20 (medium pressure) |
| Deterioration | stable 90s → deteriorating 150s → critical 300s |
| Responder ETA (dense_urban) | 4 min base |
| Tool durations | triage 15s, route 3s, wait 15s |

---

### 🌐 OpenEnv HTTP API

| Endpoint | Purpose |
|----------|---------|
| `POST /reset` | New episode → initial observation |
| `POST /step` | Send action (JSON) → observation, reward, done, info |
| `GET /schema` | Action & observation JSON schemas |
| `GET /health` | Liveness |

---

### 🧪 Commands

| Task | Command |
|------|---------|
| Run server | `uv run python -m patronet.app` |
| Tests | `uv run pytest tests/` |
| Lint / format | `uv run ruff check .` · `uv run ruff format .` |
| Train (GRPO) | `uv run python -m patronet.train --model Qwen/Qwen2.5-3B-Instruct --num_episodes 256` |
| Docker | `docker build -f server/Dockerfile -t patronet-openenv .` |

---

### 📚 More

- **data/** — extend crisis types and triage questions via JSON; no code change needed for new scenarios.

---

#### 📬 Let’s connect

Feedback, questions, or contributions? Open an issue or fork the repo.

<p align="center">
  <a href="https://www.linkedin.com/in/mansimore9/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://github.com/MansiMore99"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://medium.com/@mansi.more943"><img src="https://img.shields.io/badge/Medium-000000?style=for-the-badge&logo=medium&logoColor=white" alt="Medium" /></a>
  <a href="https://x.com/MansiMore99"><img src="https://img.shields.io/badge/X-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="X" /></a>
  <a href="https://www.youtube.com/@tech_girl-m9"><img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" /></a>
</p>
