#!/bin/bash

docker run -it -e VMWUSER -e VMWPASS -v ${PWD}:/files apnex/vmw-cli $1 $2 $3
