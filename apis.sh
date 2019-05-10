#!/bin/bash

URL="https://apigw.vmware.com/v1/m4/api/dcr/rest/apix/apis"

RESPONSE=$(curl -k -X GET \
	-H "Content-Type: application/json" \
"$URL" 2>/dev/null)

printf "%s\n" "${RESPONSE}" > apis.json
#printf "%s\n" "${RESPONSE}" | jq --tab '. | map(select(.api_ref_doc_type=="SWAGGER"))'

## build record structure
read -r -d '' INPUTSPEC <<-CONFIG
	. | map(select(.api_ref_doc_type=="SWAGGER"))
	| map({
		"id": .id,
		"name": .name,
		"version": .version,
		"api_ref_doc_url": .api_ref_doc_url
	})
CONFIG
PAYLOAD=$(echo "$RESPONSE" | jq -r "$INPUTSPEC")
echo "${PAYLOAD}" | jq --tab .
