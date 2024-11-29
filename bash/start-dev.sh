#!/bin/bash
# Simple basic script that opens multiple windows in tmux simultaneously, each connected to a different repository.

# Define session name
SESSION="skb-all"

# Define arrays for window names, directories, and commands
WINDOW_NAMES=("sso-b" "sso-fe" "cv-be" "inter")
DIRS=("sso_be" "sso_f" "cv-be" "inter")
COMMANDS=("npm run dev" "npm run dev" "npm run dev" "npm run start")

# Kill existing session with the same name
tmux kill-session -t $SESSION

# Start a new tmux session for the first window
tmux new-session -d -s $SESSION -n ${WINDOW_NAMES[0]}
tmux split-window -h
tmux send-keys "cd ${DIRS[0]} && v ." C-m
tmux select-pane -t 0
tmux send-keys "cd ${DIRS[0]} && ${COMMANDS[0]}" C-m
tmux resize-pane -L 85

# Loop through the rest of the windows
for i in {1..3}; do
    tmux new-window -t $SESSION -n ${WINDOW_NAMES[$i]}
    tmux split-window -h
    tmux send-keys "cd ${DIRS[$i]} && v ." C-m
    tmux select-pane -t 0
    tmux send-keys "cd ${DIRS[$i]} && ${COMMANDS[$i]}" C-m
    tmux resize-pane -L 75
done

# Attach to the tmux session
tmux attach-session -t $SESSION
