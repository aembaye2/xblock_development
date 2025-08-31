.DEFAULT_GOAL := help

.PHONY: upgrade help requirements
.PHONY: extract_translations compile_translations
# .PHONY: detect_changed_source_translations dummy_translations build_dummy_translations
# .PHONY: validate_translations pull_translations install_transifex_clients

REPO_NAME := xblock-react-5
PACKAGE_NAME := react_xblock_2
EXTRACT_DIR := $(PACKAGE_NAME)/conf/locale/en/LC_MESSAGES
JS_TARGET := $(PACKAGE_NAME)/public/js/translations

help:
	@perl -nle'print $& if m{^[\.a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m  %-25s\033[0m %s\n", $$1, $$2}'

# Define PIP_COMPILE_OPTS=-v to get more information during make upgrade.
PIP_COMPILE = pip-compile --upgrade $(PIP_COMPILE_OPTS)

upgrade: export CUSTOM_COMPILE_COMMAND=make upgrade
upgrade: ## update the requirements/*.txt files with the latest packages satisfying requirements/*.in
	pip install -qr requirements/pip-tools.txt
	# Make sure to compile files after any other files they include!
	$(PIP_COMPILE) --allow-unsafe -o requirements/pip.txt requirements/pip.in
	$(PIP_COMPILE) -o requirements/pip-tools.txt requirements/pip-tools.in
	pip install -qr requirements/pip.txt
	pip install -qr requirements/pip-tools.txt
	$(PIP_COMPILE) -o requirements/base.txt requirements/base.in
	$(PIP_COMPILE) -o requirements/test.txt requirements/test.in
	$(PIP_COMPILE) -o requirements/doc.txt requirements/doc.in
	$(PIP_COMPILE) -o requirements/quality.txt requirements/quality.in
	$(PIP_COMPILE) -o requirements/ci.txt requirements/ci.in
	$(PIP_COMPILE) -o requirements/dev.txt requirements/dev.in
	# Let tox control the Django version for tests
	sed '/^[dD]jango==/d' requirements/test.txt > requirements/test.tmp
	mv requirements/test.tmp requirements/test.txt

piptools: ## install pinned version of pip-compile and pip-sync
	pip install -r requirements/pip.txt
	pip install -r requirements/pip-tools.txt

requirements: piptools ## install development environment requirements
	pip-sync -q requirements/dev.txt requirements/private.*

## Localization targets

extract_translations: ## extract strings to be translated, outputting .po files
	cd $(PACKAGE_NAME)/frontend && npm run i18n:extract

compile_translations: ## compile translation files, outputting .mo files for each supported language
	cd $(PACKAGE_NAME)/frontend && npm run i18n:compile

# detect_changed_source_translations:
# 	cd $(PACKAGE_NAME) && i18n_tool changed

# dummy_translations: ## generate dummy translation (.po) files
# 	cd $(PACKAGE_NAME) && i18n_tool dummy

# build_dummy_translations: dummy_translations compile_translations ## generate and compile dummy translation files

# validate_translations: build_dummy_translations detect_changed_source_translations ## validate translations

# pull_translations: ## pull translations from transifex
# 	cd $(PACKAGE_NAME) && i18n_tool transifex pull

# install_transifex_client: ## Install the Transifex client
# 	# Installing client will skip CHANGELOG and LICENSE files from git changes
# 	# so remind the user to commit the change first before installing client.
# 	git diff -s --exit-code HEAD || { echo "Please commit changes first."; exit 1; }
# 	curl -o- https://raw.githubusercontent.com/transifex/cli/master/install.sh | bash
# 	git checkout -- LICENSE README.md ## overwritten by Transifex installer

selfcheck: ## check that the Makefile is well-formed
	@echo "The Makefile is well-formed."
