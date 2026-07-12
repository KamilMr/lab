# "a meaning beyond its literal meaning"
#

# Comment
echo "The # here does not begin a comment."
echo 'The # here does not begin a comment.'
echo The \# here does not begin a comment.
echo The # here begins a comment.

echo ${PATH#*:}       # Parameter substitution, not a comment.
echo $(( 2#101011 ))  # Base conversion, not a comment.

# Terminates in case of `;;`
# dot
# Before file is hidden file and `fs` will not show.
# When matching `.` match single character.
# quotes
# `"` preserves most of special characters withing string
# `'` preserves all of special characters withing string

# Commas links together a series of arithmetic operations, evaluates them but only one returned
let "t2 = ((a = 9, 15/3))"
echo $t2
echo $a
