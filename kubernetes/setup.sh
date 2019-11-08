#!/bin/bash

mkdir -p state
#./define.js > ./state/ctx.define
./type.js > ./state/ctx.path

function makeTemplate {
read -r -d '' BODYVAR <<'BODYTEMPLATE'
#!/bin/bash
_temp_bind() {
	## temporarily change a bunch of bind terminal settings
	local OLDSETTINGS
	local WIDTH=$(bind -v | sed -n 's/^set completion-display-width //p')
	local POINT=$(bind -v | sed -n 's/^set history-preserve-point //p')
	local AMBIG=$(bind -v | sed -n 's/^set show-all-if-ambiguous //p')
	local UNMOD=$(bind -v | sed -n 's/^set show-all-if-unmodified //p')
	local COLOR=$(bind -v | sed -n 's/^set colored-completion-prefix //p')
	local PAGES=$(bind -v | sed -n 's/^set page-completions //p')
	local QUERY=$(bind -v | sed -n 's/^set completion-query-items //p')
	if [[ "${WIDTH}" -ne 0 ]]; then
		bind "set completion-display-width 0"
		OLDSETTINGS+="; bind 'set completion-display-width ${WIDTH}'"
	fi
	if [[ "${AMBIG}" == "off" ]]; then
		bind "set show-all-if-ambiguous on"
		OLDSETTINGS+="; bind 'set show-all-if-ambiguous ${AMBIG}'"
	fi
	if [[ "${POINT}" == "off" ]]; then
		bind "set history-preserve-point on"
		OLDSETTINGS+="; bind 'set history-preserve-point ${POINT}'"
	fi
	if [[ "${UNMOD}" == "off" ]]; then
		bind "set show-all-if-unmodified on"
		OLDSETTINGS+="; bind 'set show-all-if-unmodified ${UNMOD}'"
	fi
	if [[ "${COLOR}" == "off" ]]; then
		bind "set colored-completion-prefix on"
		OLDSETTINGS+="; bind 'set colored-completion-prefix ${COLOR}'"
	fi
	if [[ "${PAGES}" == "on" ]]; then
		bind "set page-completions off"
		OLDSETTINGS+="; bind 'set page-completions ${PAGES}'"
	fi
	if [[ "${QUERY}" -ne 0 ]]; then
		bind "set completion-query-items 0"
		OLDSETTINGS+="; bind 'set page-completions ${QUERY}'"
	fi
	if [[ -n "${OLDSETTINGS}" ]]; then # reset bind settings to previous
		PROMPT_COMMAND="PROMPT_COMMAND=$(printf \u25q "${PROMPT_COMMAND}")"
		PROMPT_COMMAND+="${OLDSETTINGS}"
	fi
}
_temp_base_complete() {
	local CMDFILE=$1
	local CUR PRV
	local ARRAY=()
	COMPREPLY=()
	CUR="${COMP_WORDS[COMP_CWORD]}"
	PRV="${COMP_WORDS[COMP_CWORD-1]}"
	CYAN='\\033[0;36m' # cyan
	NC='\\033[0m' # no colour
	BB='\\u001B[94m' # blueBright
	BBC='\\u001B[39m' # close

	_temp_bind
	local IFS=$'\\n'
	if [[ ${#COMP_WORDS[@]} -ge 1 ]]; then
		ARRAY=($(./complete.js "${CMDFILE}" "${COMP_WORDS[@]:1:${#COMP_WORDS[@]}-2}" 2>/dev/null | tr -d '\\r')) # handle CRLF in tty
	else
		ARRAY=($(./complete.js "${CMDFILE}" 2>/dev/null | tr -d '\\r')) # handle CRLF in tty
	fi
	local HEADER="${ARRAY[0]}"
	local VALUES=("${ARRAY[@]:1}")
	local SUGGESTIONS=($(compgen -W "${VALUES[*]}" -- "${CUR}"))
	if [ "${#SUGGESTIONS[@]}" -ge "2" ]; then # print header/values
		printf "\\n${BB}${HEADER}${BBC}" 1>&2
		for I in "${!SUGGESTIONS[@]}"; do
			SUGGESTIONS[$I]="$(printf '\u25*s' "-$COLUMNS"  "${SUGGESTIONS[$I]}")"
		done
		COMPREPLY=("${SUGGESTIONS[@]}")
	else
		if [ "${#SUGGESTIONS[@]}" == "1" ]; then
			local ID="${SUGGESTIONS[0]\u25\u25\ *}"
			COMPREPLY=("$ID")
		fi
	fi
	return 0
}
BODYTEMPLATE

SHELLNAME=$1
if [[ $SHELLNAME == "clive" ]]; then

read -r -d '' FOOTERVAR <<BODYTEMPLATE
_${SHELLNAME}_complete() {
	_temp_base_complete "./state/ctx.path"
}
complete -F _${SHELLNAME}_complete ${SHELLNAME}
BODYTEMPLATE
printf "${BODYVAR}" > ./state/${SHELLNAME}.complete
printf "\n${FOOTERVAR}" >> ./state/${SHELLNAME}.complete

else

read -r -d '' FOOTERVAR <<BODYTEMPLATE
_${SHELLNAME}_complete() {
	_temp_base_complete "./state/ctx.${SHELLNAME}"
}
complete -F _${SHELLNAME}_complete ${SHELLNAME}
BODYTEMPLATE
printf "${BODYVAR}" > ./state/${SHELLNAME}.complete
printf "\n${FOOTERVAR}" >> ./state/${SHELLNAME}.complete

fi

printf "#!/bin/bash\n" > ./state/${SHELLNAME}
TESTVAR='${PWD}'"/${SHELLNAME}.js"' "${@}"'
printf "${TESTVAR}" >> ./state/${SHELLNAME}

}

makeTemplate "clive"
makeTemplate "query"
makeTemplate "define"
source ./state/clive.complete
source ./state/query.complete
source ./state/define.complete
