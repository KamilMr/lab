#!/bin/bash

# Define directories and their respective commands
directories=("b" "f")
commands=("npm run dev" "npm run start")

tmux kill-server # Kill any existing tmux server

for i in "${!directories[@]}"; do
  d="${directories[$i]}"
  cmd="${commands[$i]}"
  echo "$d"
  cd "$d" && { 
    session_name="${d//\//_}" # Replace '/' with '_' for tmux session name

    if ! tmux has-session -t "$session_name" 2>/dev/null; then
      tmux new-session -d -s "$session_name"
    fi
    tmux send-keys -t "$session_name" "$cmd" C-m

    cd - > /dev/null # Go back to the previous directory
  }
done

