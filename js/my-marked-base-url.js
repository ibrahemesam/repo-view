// based on: https://github.com/markedjs/marked-base-url
const urlAttributeRegex =
  /([\w|data-]+)=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))+.)["']?/g;
// const urlAttributeRegex = /(\S+)\s*=\s*([']|["])([\W\w]*?)\2/g;

window.extensionFixRelativeUrl = (base) => {
  /*
  TODO test:-
    x a href relative
    x a href absolute
    x img src relative
    - img src absolute
    - md link relative
    - md link absolute
    - md image relative
    - md image absolute
  */
  base = base.trim().replace(/\/+$/, "/"); // if multiple '/' at the end, just keep one
  const reIsAbsolute = /^[\w+]+:\/\//;
  const isBaseAbsolute = reIsAbsolute.test(base);
  const dummyUrl = "http://__dummy__";
  const dummyBaseUrl = new URL(base, dummyUrl);
  const dummyUrlLength = dummyUrl.length + (base.startsWith("/") ? 0 : 1);

  const is_http_regix = /^https?:\/\//g;
  const github_absolute_url_regix =
    /^https?:\/\/github.com\/(?<owner>[^/]*)\/(?<repo>[^/]*)\/(?<path_type>blob|tree)\/(?<branch>[^/]*)\/(?<path>.*)/;
  // https://github.com/ibrahemesam/repo-view-demo/blob/main/directory/subdir/sample.c

  return {
    walkTokens(token) {
      if (token.type === "html") {
        // # TODO: reset repo-view-demo README.md
        token.text = token.text.replaceAll(
          urlAttributeRegex,
          (match, name, value) => {
            if (["src", "href"].includes(name)) {
              /*
              parse value:-
              it maybe:
              - relative path => extract owner, repo, path
              - absolute path:
                - to this repo => extract owner, repo, path
                - to something else
              =====
              if url starts with "http(s)?://“:
                if url starts with "http(s)?://github.com“:
                  extract repo, owner & path (consider tree and branch) (internal=true) 
                else: leave url as is
              else if starts with"/*" or "*":
                This is a relative path:
                  repo and owner are same. And path is that relative path (internal=true)

              If external (ie: outside github):
                Leave as is
              Else if internal:
                if <img>: fetch b64content
                Else if <a>: make repo-view url
            */
              // console.log(value);
              var internal = false, // inside github.com
                owner = window.owner,
                repo = window.repo,
                path = undefined;
              if (is_http_regix.test(value)) {
                var github_url_groups =
                  github_absolute_url_regix.exec(value).groups;
                if (github_url_groups) {
                  internal = true;
                  owner = github_url_groups.owner;
                  repo = github_url_groups.repo;
                  path = github_url_groups.path;
                } else {
                  // pass
                }
              } else {
                internal = true;
                if (value.startsWith("/")) value = value.slice(1);
                path = value;
              }
              switch (name) {
                case "src":
                  try {
                    var mime_is_image = mime.getType(path).startsWith("image");
                  } catch (err) {
                    var mime_is_image = true;
                  }
                  if (internal && mime_is_image) {
                    /*                          
                      if src ends with an image extension mime
                      fetch image as base64 using github rest API
                      set src to this base64
                      else
                      set src to base + relative-url
                    */
                    name = "data-repoview-lazy-src";
                    value = JSON.stringify({
                      owner,
                      repo,
                      path,
                    });
                  }
                  break;
                case "href":
                  // console.log(value);
                  if (internal) {
                    name = "data-repoview-href";
                    value = path;
                  }
                  break;
              }
            }
            // console.log(`${name}="${value}"`);
            return `${name}='${value}'`;
          }
        );
        // console.log(token.text);
        return;
      }
      if (!["link", "image"].includes(token.type)) {
        return;
      }

      if (reIsAbsolute.test(token.href)) {
        // the URL is absolute, do not touch it
        return;
      }

      if (token.href.startsWith("#")) {
        // the URL is a local reference
        return;
      }

      if (isBaseAbsolute) {
        try {
          token.href = new URL(token.href, base).href;
        } catch {
          // ignore
        }
      } else {
        // base is not absolute
        if (token.href.startsWith("/")) {
          // the URL is from root
          return;
        }
        try {
          const temp = new URL(token.href, dummyBaseUrl).href;
          token.href = temp.slice(dummyUrlLength);
        } catch {
          // ignore
        }
      }
    },
  };
};
