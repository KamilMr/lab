#!/bin/bash

# Start a new tmux session named 'dev'
tmux new-session -d -s dev -n finance-be

# Split the first window into two panes and run the commands
tmux split-window -h
tmux send-keys 'cd b && nvim .' C-m
tmux select-pane -t 0
tmux send-keys 'cd b && npm run dev' C-m
tmux resize-pane -L 75 

# Create a new window for booking-admin
tmux new-window -n fe 
tmux split-window -h
tmux send-keys 'cd f && nvim .' C-m
tmux select-pane -t 0
tmux send-keys 'cd f && npm run start' C-m
tmux resize-pane -L 75 

# Attach to the tmux session
tmux attach-session -t dev

