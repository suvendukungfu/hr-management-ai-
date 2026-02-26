# Antigravity AI Extension

Small plugin-driven utilities used for repository analysis and safe local automation.

## Folder Structure

```text
antigravity-ai/
├── config.py              # Plugin registry + shared target path settings
├── main.py                # CLI entrypoint and smoke tests
├── target_project -> ..   # Symlink to repo root (default analysis target)
└── agents/
    ├── __init__.py
    ├── gsd_executor.py    # Safe command executor plugin
    ├── graph_tools.py     # Repository structure analysis plugin
    └── coderabbit.py      # Lightweight static code review plugin
```

## Usage

Run from this directory:

```bash
python3 main.py
```

Only initialize plugins:

```bash
python3 main.py --skip-tests
```

## Configuration

- `ANTIGRAVITY_PLUGINS`: comma-separated plugins to enable.  
  Default: `gsd,graph,coderabbit`
- `ANTIGRAVITY_TARGET_PROJECT`: absolute/relative path to analyze.  
  Default: `./target_project`
