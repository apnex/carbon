#!/bin/bash

TOKEN=$(cat vrni.token.txt)
URL='https://field-demo.vrni.cmbu.local/api/ni/info/version'

RESPONSE=$(curl -k -X GET \
	--header 'Accept: application/json' \
	--header "Authorization: NetworkInsight ${TOKEN}" \
"${URL}" 2>/dev/null)

printf "${RESPONSE}" | jq --tab .

APPID=$(printf "${RESPONSE}" | jq -r '.results[0].entity_id')

#printf "${APPID}"
