const urlAttributeRegex =
  /([\w|data-]+)=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))+.)["']?/g;
// const urlAttributeRegex = /(\S+)\s*=\s*([']|["])([\W\w]*?)\2/g;
const is_http_regix = /^https?:\/\//;
const github_absolute_url_regix =
  /^https?:\/\/github.com\/(?<owner>[^/]*)\/(?<repo>[^/]*)(\/(?<path_type>blob|tree)\/(?<branch>[^/]*)(\/(?<path>.*))?)?/;
// https://github.com/ibrahemesam/repo-view-demo/blob/main/directory/subdir/sample.c
function __parseUrl(url) {
  /*
  parse url:-
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
  // console.log(url);
  var internal = false, // inside github.com
    owner = window.owner,
    repo = window.repo,
    path = "";
  if (is_http_regix.test(url)) {
    try {
      var github_url_groups = github_absolute_url_regix.exec(url);
    } catch (err) {
      console.log(url);
      throw err;
    }
    if (github_url_groups) {
      github_url_groups = github_url_groups.groups;
      internal = true;
      owner = github_url_groups.owner;
      repo = github_url_groups.repo;
      path = github_url_groups.path;
    } else {
      // pass
    }
  } else {
    internal = true;
    if (url.startsWith("/")) url = url.slice(1);
    path = url;
  }
  return {
    internal,
    owner,
    repo,
    path,
  };
}

window.extensionFixUrls = () => {
  /*
  tested:-
    x a href relative
    x a href absolute
    x img src relative
    x img src absolute
    x md link relative
    x md link absolute
    x md image relative
    x md image absolute
  */
  return {
    async: true,
    async walkTokens(token) {
      // console.log(token);
      switch (token.type) {
        case "html":
          token.text = token.text.replaceAll(
            urlAttributeRegex,
            (match, name, value) => {
              if (["src", "href"].includes(name)) {
                // parse url
                var { internal, owner, repo, path } = __parseUrl(value);
                switch (name) {
                  case "src":
                    try {
                      var mime_is_image = mime
                        .getType(path)
                        .startsWith("image");
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
                    if (
                      !value.startsWith("#") &&
                      internal &&
                      owner === window.owner &&
                      repo === window.repo
                    ) {
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
          break;
        case "image":
          var { internal, owner, repo, path } = __parseUrl(token.href);
          try {
            var mime_is_image = mime.getType(path).startsWith("image");
          } catch (err) {
            var mime_is_image = true;
          }
          if (internal && mime_is_image) {
            token.href = resopnse2imgSrc(
              await octokit.request(
                "GET /repos/{owner}/{repo}/contents/{path}",
                {
                  owner,
                  repo,
                  path,
                  headers: DEFAULT_API_HEADERS.headers,
                }
              )
            );
          }
          break;
        case "link":
          var { internal, owner, repo, path } = __parseUrl(token.href);
          if (token.href.startsWith("#")) {
            // the URL is a local reference
            break;
          } else if (
            internal &&
            owner === window.owner &&
            repo === window.repo
          ) {
            // console.log(token);
            if (token.title === null) token.title = path;
            token.href = `data-repoview-href=${path}`;
          }
          break;
        default:
          return;
      }
      return;
    },
  };
};
