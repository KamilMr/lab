# Agent Loop Task Backend Todo

Use this plan to replace direct Markdown task handling with a Bash + `jq` task backend.

## Working rules

- Keep each task small and focused on one Bash concept.
- Bash controls flow; `jq` reads and transforms JSON.
- Store task IDs in uppercase and accept IDs case-insensitively.
- Agents must eventually use helper methods instead of editing `tasks.json` directly.
- Allow at most one active task across `ready`, `working`, `pending-review`, and `review`.
- Run `bash -n` on changed shell files and manually test each new function.
- Do not integrate the helpers into the main `agent-loop` script until the read-only API is stable.

## Tasks

- [pending-review] AL-001 Implement the read-only `task_current` function in `agent-loop/lib/task_db.sh`.
  - Read `.agent-loop/tasks.json` by default and allow an explicit file argument.
  - Add a minimal JSON fixture under `agent-loop/tests/fixtures/`.
  - Return the single task whose status is `ready`, `working`, `pending-review`, or `review`.
  - Return a clear non-zero result when the file is missing, no active task exists, or multiple active tasks exist.
  - Do not modify the JSON file.

- [pending] AL-002 Add read-only task-file validation.
  - Validate the top-level JSON shape and required task fields.
  - Check that IDs are unique and contain only uppercase letters and numbers.
  - Check allowed statuses, numeric ranks, dependency references, and the one-active-task invariant.
  - Keep validation errors concise and send them to stderr.
  - depends_on: AL-001

- [pending] AL-003 Complete the ID helper API in `agent-loop/lib/id_random.sh`.
  - Add ID normalization and format-validation functions.
  - Validate the requested random-ID length before generating an ID.
  - Keep generated IDs uppercase and numeric only.
  - Leave collision detection to the task database layer.
  - depends_on: AL-002

- [pending] AL-004 Add the remaining basic read-only task queries.
  - Implement `task_get <id>` with case-insensitive input.
  - Implement deterministic task listing ordered by `rank`.
  - Implement selection of the next pending task whose dependencies are done.
  - Reuse validation and ID helpers rather than duplicating `jq` expressions.
  - depends_on: AL-003

- [pending] AL-005 Add a small Bash test runner for the helper functions.
  - Cover valid and invalid IDs.
  - Cover zero, one, and multiple active tasks.
  - Cover missing files, malformed JSON, duplicate IDs, and blocked dependencies.
  - Use temporary fixture copies so tests never mutate source fixtures.
  - Document the test command in `agent-loop/README.md`.
  - depends_on: AL-004

## Later

After these tasks, plan the write API (`task_add`, status transitions, notes, and atomic writes), then expose it to Pi through controlled tools and protect `tasks.json` from direct edits.
