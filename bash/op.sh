#!/bin/bash

openProject() {
    search_dir=~/WebDev

    # Initialize the projects array
    declare -a projects

    # Fill projects with directories that start with a capital letter
    for entry in "$search_dir"/*; do
        if [[ -d "$entry" && $(basename "$entry") =~ ^[A-Z] ]]; then
            projects+=("${entry##*/}")
        fi
    done

    for entry in "$search_dir"/*; do
        # If entry is equal to one of the projects in the array
        if [[ " ${projects[@]} " =~ " ${entry##*/} " ]]; then
            for nested_entry in "$entry"/*; do
                echo "$nested_entry"
            done
        else
            echo "$entry"
        fi
    done
}

open() {
    # Get current directory
    current_dir=$(pwd)
    cd "$(openProject | fzf)"

    # If the user presses enter and the directory is not the same as the current directory
    if [ "$current_dir" != "$(pwd)" ]; then
        # Run devTmux.sh
        . devTmux.sh
    fi
}

open

