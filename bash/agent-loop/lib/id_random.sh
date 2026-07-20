 #!/usr/bin/env bash

task_id_random() {
	local length="${1:-8}"
	local alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	local id=""
	local i index

	# loop length times
	for ((i = 0; i < length; i++)); do
		index=$(( RANDOM % ${#alphabet} ))
		id+="${alphabet:index:1}"
	done

	printf '%s\n' "$id"
}
