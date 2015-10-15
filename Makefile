ifeq (,$(shell which node))
   $(error "Requires node in $PATH")
endif
ifeq (,$(shell which npm))
   $(error "Requires npm in $PATH")
endif
ifeq (,$(shell which entr))
   $(error "Requires entr in $PATH")
endif

get-parties:
	 node src/get-parties.js

install:
	 npm install
.PHONY: install

watch:
	 @find . -not -path '*node_modules*' \( -name '*.js' -o -name '*.json' \) \
         | entr -r node src/index.js

