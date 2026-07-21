#!/usr/bin/env bash

task_current() {
  local file="${1:-.agent-loop/tasks.json}"
  local active_tasks
  local active_count

  if [[ ! -f "$file" ]]; then
    printf 'task file not found: %s\n' "$file" >&2
    return 1
  fi

  if ! active_tasks="$(jq '[.tasks[] | select(.status == "ready" or .status == "working" or .status == "pending-review" or .status == "review")]' "$file")"; then
    printf 'could not read task file: %s\n' "$file" >&2
    return 1
  fi

  active_count="$(jq 'length' <<<"$active_tasks")"

  case "$active_count" in
    0)
      printf 'no active task found in: %s\n' "$file" >&2
      return 1
      ;;
    1)
      jq '.[0]' <<<"$active_tasks"
      ;;
    *)
      printf 'multiple active tasks found in: %s\n' "$file" >&2
      return 1
      ;;
  esac
}
