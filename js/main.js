function addBtnClone() {
  const clone = document.createElement("a");
  clone.className = "btn";
  clone.textContent = "Clone";
  clone.onclick = () => {
    treeHeaderLast.style.gridTemplateColumns = "1fr 1fr";
    const input = document.createElement("input");
    input.setAttribute("readonly", true);
    input.style.fontSize = "bold";
    input.style.padding = "5px";
    input.value = `git clone https://${window.token}@github.com/${window.owner}/${window.repo}`;
    clone.remove();

    const copy = document.createElement("a");
    copy.className = "btn";
    copy.textContent = "Copy";
    copy.onclick = () => {
      input.focus();
      input.select();
      document.execCommand("copy");
      treeHeaderLast.innerHTML = "";
      treeHeaderLast.style.gridTemplateColumns = "1fr";
      treeHeaderLast.append(clone);
      var _ = clone.onclick;
      clone.onclick = undefined;
      clone.textContent = "Copied!";
      clone.style.cursor = "default";
      setTimeout(() => {
        clone.style.cursor = "pointer";
        clone.onclick = _;
        clone.textContent = "Clone";
      }, 1500);
    };
    treeHeaderLast.innerHTML = "";
    treeHeaderLast.append(input, copy);
  };
  treeHeaderLast.append(clone);
}

const DEFAULT_API_HEADERS = {
  headers: {
    "X-GitHub-Api-Version": "2022-11-28",
    "Accept-Charset": "UTF-8",
  },
};
const NEW_LINE_EXP = /\n(?!$)/g;

const rawBtn = document.getElementById("raw-btn"),
  previewDiv = document.getElementById("preview-div"),
  previewItemNameDiv = document.getElementById("preview-item-name-div"),
  previewItemContentDiv = document.getElementById("preview-item-content-div"),
  treeUl = document.getElementById("tree-ul"),
  cwdNameDiv = document.getElementById("cwd-name-div"),
  locationDiv = document.getElementById("location-div"),
  treeHeaderLast = document.querySelector(".tree > .header > .last"),
  noInternetDiv = document.getElementById("no-internet-div"),
  footerDiv = document.querySelector("div.footer"),
  mainLoaderSpinnerDiv = document.getElementById("main-loader-spinner-div"),
  createUrlDiv = document.getElementById("create-url"),
  aCreatedUrl = document.querySelector("#created-url > a"),
  btnCopyCreatedUrl = document.querySelector(
    'button[name="btn-copy-created-url"]'
  ),
  inpToken = document.getElementById("token"),
  inpUsername = document.getElementById("owner"),
  inpRepo = document.getElementById("repo");

var onlineLock = {};
onlineLock.lock = () => {
  onlineLock.p = new Promise((r) => (onlineLock.unlock = r));
};
onlineLock.wait = () => onlineLock.p;

window.addEventListener("online", () => {
  onlineLock.unlock();
  noInternetDiv.hidden = true;
});

window.addEventListener("offline", () => {
  noInternetDiv.hidden = false;
});

if (!navigator.onLine) noInternetDiv.hidden = true;

async function initMarkdownView(md) {
  var el = document.createElement("pre");
  el.classList.add("markdown");
  // console.log(md);
  el.innerHTML = DOMPurify.sanitize(marked.parse(md));
  // el.innerHTML = (await octokit.request('POST /markdown', {
  //     text: md,
  //     headers: DEFAULT_API_HEADERS.headers
  // })).data;
  previewItemContentDiv.appendChild(el);
}

function decodeContent(str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(
    atob(str)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}

function updateHistory(path) {
  history.pushState(
    "",
    "",
    `?token=${window.tokenUrlParam}&owner=${window.owner}&repo=${window.repo}${
      path ? "&path=" + path : ""
    }`
  );
}

async function gotoPath(path, boolUpdateHistory = true, disableAels = true) {
  /* first of all: remove click event to prevent multiple concurrency calls to this methods */
  if (disableAels) {
    Array.from(locationDiv.querySelectorAll("a"))
      .concat(Array.from(treeUl.querySelectorAll("tree-item a")))
      .forEach((a) => {
        a.onclick = undefined;
        var style = a.style;
        style.textDecoration = "none";
        // style.color = 'inherit';
        style.cursor = "default";
      });
  }
  // ..
  if (path.endsWith("..")) {
    // go back
    path = path.split("/").slice(0, -2).join("/");
  }
  if (boolUpdateHistory) updateHistory(path);
  var headerName = path ? path.split("/").at(-1) : window.repo;
  // get required path
  // 2 caces: requied path is a dir || file
  // if it is a dir: do dir view & view dir's README.md if exists
  // if it is a file: show content of this file
  try {
    var response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner,
        repo,
        path,
        headers: DEFAULT_API_HEADERS.headers,
      }
    );
  } catch (err) {
    if (err.response.status === 404) {
      // if path is invalid or repo is invalid => panic:-
      // owner, repo or path is invalid => panic
      showErrorMsg("[404]: owner, repo or path is invalid");
      return;
    }
  }
  treeUl.querySelectorAll("tree-item").forEach((el) => el.remove());
  if (response.data.length) {
    /* path is a dir */
    previewDiv.hidden = true;
    cwdNameDiv.innerHTML = headerName;
    treeUl.hidden = false;
    // set treeUl items
    if (path != "") {
      var treeItem = document.createElement("tree-item");
      treeItem.setAttribute("data-item-name", "..");
      treeItem.setAttribute("data-item-path", path + "/..");
      treeItem.setAttribute("data-item-type", "dir");
      treeUl.appendChild(treeItem);
    }
    var dirItems = [],
      fileItems = [];
    response.data.forEach((item) => {
      item.type === "dir" ? dirItems.push(item) : fileItems.push(item);
    });
    dirItems.concat(fileItems).forEach((item) => {
      var treeItem = document.createElement("tree-item");
      treeItem.setAttribute("data-item-name", item.name);
      treeItem.setAttribute("data-item-path", item.path);
      treeItem.setAttribute("data-item-type", item.type);
      treeUl.appendChild(treeItem);
    });
    var readMeExists =
      treeUl.querySelector('[data-item-name*="readme"]') ||
      treeUl.querySelector('[data-item-name*="README"]');
    if (readMeExists) {
      try {
        response = await octokit
          .request("GET /repos/{owner}/{repo}/readme/{dir}", {
            owner,
            repo,
            dir: path,
            headers: DEFAULT_API_HEADERS.headers,
          })
          .catch((e) => {});
        previewItemContentDiv.innerHTML = "";
        previewDiv.hidden = false;
        previewItemNameDiv.innerHTML = response.data.name;
        // set Raw url
        rawBtn.setAttribute("href", response.data.download_url);
        initMarkdownView(decodeContent(response.data.content));
      } catch (err) {
        if (err.response.status === 404 || err.status === 404) {
          // no README.md, this is ok
        } else {
          throw err;
        }
      }
    }
  } else {
    /* path is a file */
    treeUl.hidden = true;
    previewItemNameDiv.innerHTML = headerName;
    previewItemContentDiv.innerHTML = "";
    var m = String(mime.getType(path)); // m.slice(0, m.indexOf('/'))
    if (m.startsWith("image/")) {
      // img render
      var b64content = response.data.content;
      if (b64content) {
        var imgSrc = `data:image/${headerName.split(".").at(-1)};base64,${
          response.data.content
        }`;
      } else {
        var imgSrc = response.data.download_url;
      }
      previewItemContentDiv.innerHTML = `
                <div class="content-img">
                    <img src="${imgSrc}">
                </div>
            `;
    } else if (m.endsWith("/pdf")) {
      // pdf render
      previewItemContentDiv.innerHTML = `
                <iframe
                    src="https://mozilla.github.io/pdf.js/web/viewer.html?file=${response.data.download_url}"
                    frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;"
                    >
                    <div style="
                            padding: 5%;    position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                        ">
                        <h3 style="margin: auto; text-align: center;">PDF preview is not supported in this browser.</h3>
                        <h4 style="margin: auto; text-align: center;">sorry for any inconvenience.</h4>
                    </div>
                </iframe>
            `;
    } else if (m.endsWith("/markdown")) {
      // md parse
      initMarkdownView(decodeContent(response.data.content));
    } else {
      // normal text file
      var pre = document.createElement("pre"),
        code = document.createElement("code"),
        lang = headerName.split(".").at(-1),
        txt = decodeContent(response.data.content);
      if (!Prism.languages[lang]) {
        var _ = /\blang(?:uage)?-([\w-]+)\b/i.exec(txt);
        if (_) lang = _[1];
        else lang = "none";
      }
      // if (Prism.languages[lang]) {
      pre.className = "line-numbers language-" + lang;
      code.className = "language-" + lang;
      code.style.display = "inline-block";
      var match = txt.match(NEW_LINE_EXP);
      var lineNumbersWrapper = `<span aria-hidden="true" class="line-numbers-rows">${new Array(
        (match ? match.length + 1 : 1) + 1
      ).join("<span></span>")}</span>`;
      code.innerHTML =
        DOMPurify.sanitize(Prism.highlight(txt, Prism.languages[lang], lang)) +
        lineNumbersWrapper;
      pre.appendChild(code);
      // } else {
      // el.textContent = txt;
      // }
      previewItemContentDiv.appendChild(pre);
    }
    previewDiv.hidden = false;
    // set Raw url
    rawBtn.setAttribute("href", response.data.download_url);
  }
  if (path.startsWith("/")) path = path.slice(1);
  window.path = path;
  // set Location bar
  locationDiv.innerHTML = "";
  var pathSplit = path.split("/");
  var onLocationClick = (evt) => {
    var el = evt.target;
    var parentChildren = el.parentNode.querySelectorAll("a");
    var pathToGo = "",
      child,
      itemName;
    for (let i = 0; i <= parentChildren.length; i++) {
      child = parentChildren[i];
      itemName = child.getAttribute("data-item-name");
      if (itemName) {
        pathToGo += "/" + itemName;
      }
      if (child == el) break;
    }
    gotoPath(pathToGo);
  };

  if (path) {
    var a = document.createElement("a");
    a.style.cursor = "pointer";
    a.onclick = onLocationClick;
    a.setAttribute("data-item-name", "");
  } else {
    var a = document.createElement("span");
  }
  a.innerHTML = window.repo;
  locationDiv.appendChild(a);
  if (path) {
    pathSplit.slice(0, -1).forEach((i) => {
      var slash = document.createElement("span");
      slash.innerHTML = " / ";
      locationDiv.appendChild(slash);
      var a = document.createElement("a");
      a.style.cursor = "pointer";
      a.onclick = onLocationClick;
      a.setAttribute("data-item-name", i);
      a.innerHTML = i;
      locationDiv.appendChild(a);
    });
    var slash = document.createElement("span");
    slash.innerHTML = " / ";
    locationDiv.appendChild(slash);
    var span = document.createElement("span");
    span.innerHTML = pathSplit.at(-1);
    locationDiv.appendChild(span);
  }
  locationDiv.hidden = false;
}

class TreeItem extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = `
        <li class="entry" style="cursor: pointer;">
            <img class="icon ${this.getAttribute("data-item-type")}">
            <a>${this.getAttribute("data-item-name")}</a>
        </li>
    `;
    this.getElementsByTagName("a")[0].onclick = () => {
      gotoPath(this.getAttribute("data-item-path"));
    };
  }
}
customElements.define("tree-item", TreeItem);

function showErrorMsg(msg) {
  mainLoaderSpinnerDiv.hidden = true;
  mainLoaderSpinnerDiv.innerHTML = msg;
  mainLoaderSpinnerDiv.style.zoom = 2;
  mainLoaderSpinnerDiv.style.height = "fit-content";
  mainLoaderSpinnerDiv.style.width = "fit-content";
  mainLoaderSpinnerDiv.style.textAlign = "center";
  mainLoaderSpinnerDiv.style.top = "40%";
  mainLoaderSpinnerDiv.style.border = "solid 1px crimson";
  mainLoaderSpinnerDiv.style.padding = "5px";
  mainLoaderSpinnerDiv.style.borderRadius = "5px";
  footerDiv.style.top = "30%";
  mainLoaderSpinnerDiv.hidden = false;
}
/* ~: js encryption by MetaTron@stackoverflow :~ */
/* https://stackoverflow.com/a/66938952/10701585 */
const crypt = (salt, text) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);
  return text
    .split("")
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join("");
};
const decrypt = (salt, encoded) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);
  return encoded
    .match(/.{1,2}/g)
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");
};
/* ------------------------------------------ */
function encryptToken(token) {
  return crypt("", token) + "_enc";
}
function decryptToken(token) {
  return decrypt("", token.slice(0, token.lastIndexOf("_enc")));
}
/* ------------------------------------------ */
function copyTextToClipboard(text) {
  // Create a temporary textarea element to hold the text
  const tempElement = document.createElement("textarea");
  tempElement.value = text;
  tempElement.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
  document.body.appendChild(tempElement);
  // Select the text inside the textarea
  tempElement.select();
  // Copy the selected text to the clipboard
  let successful = false;
  try {
    successful = document.execCommand("copy");
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
  // Remove the temporary textarea element
  document.body.removeChild(tempElement);
  return successful;
}
async function importModule(module) {
  /* try importing a module forever until done */
  while (true) {
    try {
      return await import(module);
    } catch (err) {
      console.error(err);
    }
  }
}
async function mainLoop() {
  if (document.location.search === "?new") {
    // handleNewUrlCreation
    createUrlDiv.hidden = false;
    document.addEventListener("click", async (evt) => {
      var el = evt.target;
      switch (el.getAttribute("name")) {
        case "btn-inp-paste":
          evt.preventDefault();
          try {
            var clipboardText = await navigator.clipboard.readText();
            var inputElement = document.querySelector(
              el.getAttribute("target")
            );
            inputElement.value = clipboardText;
          } catch (err) {
            console.error(err);
          }
          break;
        case "btn-copy-created-url":
          evt.preventDefault();
          var txt = aCreatedUrl.getAttribute("href");
          if (txt === "") break;
          var success = copyTextToClipboard(txt);
          var btnCopyCreatedUrlText = btnCopyCreatedUrl.innerText;
          if (success) btnCopyCreatedUrl.innerText = "Copied";
          else btnCopyCreatedUrl.innerText = "Can't copy";
          setTimeout(() => {
            btnCopyCreatedUrl.innerText = btnCopyCreatedUrlText;
          }, 1000);
          break;
        case "btn-create-url":
          evt.preventDefault();
          var btnText = el.innerText;
          var url =
            document.location.origin +
            document.location.pathname +
            (document.location.pathname !== "/" ? "/" : "") +
            `?token=${encryptToken(
              inpToken.value.trim()
            )}&owner=${inpUsername.value.trim()}&repo=${inpRepo.value.trim()}`;
          aCreatedUrl.setAttribute("href", url);
          aCreatedUrl.innerText = url;
          el.innerText = "Created";
          setTimeout(() => {
            el.innerText = btnText;
          }, 1000);
          break;
        default:
          break;
      }
    });
    return;
  }
  window.Octokit = (await importModule("https://esm.sh/@octokit/core")).Octokit;
  window.Mime = (
    await importModule("https://unpkg.com/mime@latest/dist/src/index_lite.js")
  ).Mime;
  window.stdMimeTypes = (
    await importModule("https://unpkg.com/mime@latest/dist/types/standard.js")
  ).default;
  window.otherMimeTypes = (
    await importModule("https://unpkg.com/mime@latest/dist/types/other.js")
  ).default;
  window.programmingTypes = (
    await importModule("./programming-txt-mime.js")
  ).default;
  window.mime = new Mime(stdMimeTypes, otherMimeTypes, programmingTypes);

  marked.setOptions({
    highlight: (code, lang) => {
      if (Prism.languages[lang]) {
        return Prism.highlight(code, Prism.languages[lang], lang);
      } else {
        return code;
      }
    },
    pedantic: false,
    gfm: true,
  });
  const urlParams = new URLSearchParams(document.location.search);
  window.repo = urlParams.get("repo");
  if (!repo) {
    // no repo-name is supplied => panic
    showErrorMsg("no repo name is supplied in url params");
    return;
  }
  window.token = urlParams.get("token");
  if (!token) {
    // no token is supplied => panic
    showErrorMsg("no token is supplied in url params");
    return;
  }
  if (
    JSON.parse(
      urlParams.get("token_ready") ||
        token.startsWith("github_") ||
        token.startsWith("ghp_")
    )
  ) {
    window.tokenUrlParam = `${token}&token_ready=true`;
  } else {
    window.tokenUrlParam = token;
    try {
      if (token.endsWith("_enc")) token = decryptToken(token);
      else token = atob(token);
    } catch {
      // token is not valid: panic
      showErrorMsg("can't decode Github access token");
      return;
    }
  }
  window.octokit = new Octokit({ auth: token });

  // wrap octokit.request with unsafe method to overcome internet disconnections
  var __octokit_request = octokit.request;
  octokit.request = async function () {
    while (true) {
      onlineLock.lock();
      try {
        return await __octokit_request.apply(null, arguments);
      } catch (err) {
        // when  net::ERR_INTERNET_DISCONNECTED error catched has .response undefined
        if (err.response !== undefined) throw err;
        // wait for 'online' event before retrying
        await onlineLock.wait();
      }
    }
  };

  // check token
  try {
    var tokenAuthenticatedUser = (
      await octokit.request("GET /user", DEFAULT_API_HEADERS)
    ).data.login;
  } catch (err) {
    if (err.response.status === 401) {
      // token is not valid: panic
      showErrorMsg("Github access token is NOT valid");
      return;
    }
  }

  window.path = urlParams.get("path");
  path = path ? path : "";

  window.owner = urlParams.get("owner");
  // if no usernae is supplied, then: set is as the user who created that access_token
  owner = owner ? owner : tokenAuthenticatedUser;

  document.title = `${owner} / ${repo} · ${document.title}`;
  addBtnClone();

  // get required path
  await gotoPath(path, false, false);
}

window.addEventListener("popstate", function (event) {
  var previousPath = new URLSearchParams(document.location.search).get("path");
  gotoPath(previousPath ? previousPath : "", false);
});

mainLoop();
