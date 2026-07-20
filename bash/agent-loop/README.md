# agent-loop

Basic reusable version of the Pi planner / implementer / reviewer loop.

It is intentionally small and editable:

```text
agent-loop/
├── agent-loop
└── prompts/
    ├── common.md
    ├── planner.md
    ├── implementer.md
    ├── visual.md
    └── reviewer.md
```

Run it from a project root that has:

- a git repository
- a markdown task file, default `todo.md`
- the `pi`, `git`, `node` commands available

## Usage

```bash
/path/to/agent-loop/agent-loop plan
/path/to/agent-loop/agent-loop implement
/path/to/agent-loop/agent-loop review
/path/to/agent-loop/agent-loop cycle 3
/path/to/agent-loop/agent-loop cycle-visual 3
```

If moved to `~/bin/agent-loop`, run:

```bash
~/bin/agent-loop/agent-loop cycle
```

## Editing prompts

Edit the files in `prompts/` next to the script. You can also point a project at its own prompt directory:

```bash
AGENT_LOOP_PROMPT_DIR="/path/to/project/.agent-loop/prompts" \
~/bin/agent-loop/agent-loop cycle
```

Supported prompt placeholders:

```text
{{PROJECT_NAME}}
{{TODO_FILE}}
{{RUNS_FILE}}
{{TASK_ID_REGEX}}
{{REQUIRED_READING}}
{{BOUNDARIES}}
{{REFERENCE_NOTE}}
{{BUILD_COMMAND}}
{{TEST_COMMAND}}
{{CHECK_COMMANDS}}
{{BROWSER_COMMAND}}
{{SCREENSHOT_ROUTE}}
{{SCREENSHOT_DIR}}
```

## Common configuration

Use environment variables per project:

```bash
AGENT_LOOP_PROJECT_NAME="my-project" \
AGENT_LOOP_TODO_FILE="todo.md" \
AGENT_LOOP_RUNS_FILE="workflow-runs.md" \
AGENT_LOOP_REQUIRED_READING="AGENTS.md todo.md" \
AGENT_LOOP_BOUNDARIES="Work only inside this repository." \
AGENT_LOOP_BUILD_COMMAND="npm run build" \
AGENT_LOOP_TEST_COMMAND="npm run test" \
~/bin/agent-loop/agent-loop cycle
```

The tool keeps the same basic workflow statuses:

```text
pending -> ready -> working -> pending-review -> review -> done
```

Metrics are appended to `workflow-runs.md` and committed separately as `chore(metrics): ...`.
