#!/bin/bash

ARRAY=$(echo "item987\r\nitem65\r\nitem4\r\n")

#printf $ARRAY
VALUE=$(echo ${ARRAY[@]})
printf $VALUE | tr -d '\r'
#local SUGGESTIONS=(\$(compgen -W "\${ARRAY[@]}" 

#local ARRAY=\$(${CALLED} list)
