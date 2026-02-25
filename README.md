# HR Management AI System 🚀

An advanced, AI-driven HR management and simulation platform utilizing sophisticated multi-agent architectures, self-evolving planners, and real-time frontend visualization.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![React](https://img.shields.io/badge/react-18-blue)

## 📋 Overview

The HR Management AI system simulates an entire human resources department using multiple autonomous agents capable of collaborative planning, reflection, and evolution.
It uses **Antigravity** concepts for dynamic planner graph evolution, monitoring system confidence and risk levels in real-time to adjust strategies organically.

## 🌟 Key Features

- **Multi-Agent Ecosystem**: Includes specialized agents like Recruiter, Analytics, Scheduler, and Bias Detection.
- **Self-Evolving Planner**: The system dynamically adapts its computational graph based on confidence and risk scores.
- **Reflection & Memory**: Agents incorporate sophisticated memory mechanisms allowing them to log feedback, reflect on previous actions, and improve organically.
- **Real-time Visualization**: An interactive React-based frontend providing a live simulation panel and agent status dashboard.
- **MCP Integration**: Model Context Protocol (MCP) server for deep contextual analysis and design understanding.

## 🏗️ Architecture

The repository is split into three main parts:

1.  **`/backend`**: Python-based AI agent logic, reflection engines, state managers, and communication layers.
2.  **`/frontend`**: React + TypeScript client. Includes the Antigravity planner UI, state memory store, and simulation panels.
3.  **`/mcp-design-server`**: MCP integration nodes for contextual project design and context supplying.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.10+)

### Setting up the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Setting up the Frontend

```bash
cd frontend
npm install
npm run dev
```

### Running the MCP Server

```bash
cd mcp-design-server
npm install
npm run build
```

## 🧠 The Antigravity Planner

At the core of the system is the `SelfEvolvingPlanner`, which manages a graph of operational nodes. It monitors memory streams (via `plannerMemory.ts`) to inject specialized guard-nodes (e.g., Bias Detection) automatically when system risk is elevated or confidence drops below optimal thresholds.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is licensed under the MIT License.
