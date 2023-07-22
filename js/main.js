
function addBtnClone() {
    const clone = document.createElement('a')
    clone.className = 'btn'
    clone.textContent = 'Clone'
    clone.onclick = () => {
        treeHeaderLast.style.gridTemplateColumns = '1fr 1fr'
        const input = document.createElement('input')
        input.setAttribute('readonly', true)
        input.style.fontSize = 'bold';
        input.value = `git clone https://${window.token}@github.com/${window.owner}/${window.repo}`;
        clone.remove()

        const copy = document.createElement('a')
        copy.className = 'btn'
        copy.textContent = 'Copy'
        copy.onclick = () => {
            input.focus()
            input.select()
            document.execCommand('copy')
            treeHeaderLast.innerHTML = ''
            treeHeaderLast.style.gridTemplateColumns = '1fr'
            treeHeaderLast.append(clone)
            alert('Copied!')
        }
        treeHeaderLast.innerHTML = ''
        treeHeaderLast.append(input, copy)
    }
    treeHeaderLast.append(clone)
}

import { Octokit } from "https://esm.sh/octokit";
import mime from "https://cdn.skypack.dev/mime/lite";
mime._types.py = 'application/python'

window.mime = mime;
const DEFAULT_API_HEADERS = { headers: {'X-GitHub-Api-Version': '2022-11-28'} };

const
    rawBtn = document.getElementById('raw-btn'),
    previewDiv = document.getElementById('preview-div'),
    previewItemNameDiv = document.getElementById('preview-item-name-div'),
    previewItemContentDiv = document.getElementById('preview-item-content-div'),
    treeUl = document.getElementById('tree-ul'),
    cwdNameDiv = document.getElementById('cwd-name-div'),
    locationDiv = document.getElementById('location-div'),
    treeHeaderLast = document.querySelector('.tree > .header > .last');

async function gotoPath(path) {
    if (path.endsWith('..')) {
        // go back
        path = path.split('/').slice(0, -2).join('/');
    }
    var headerName = path ? path.split('/').at(-1) : window.repo;
    // get required path
    // 2 caces: requied path is a dir || file
    // if it is a dir: do dir view & view dir's README.md if exists
    // if it is a file: show content of this file
    // if path is invalid or repo is invalid => panic
    // TODO: update url params
    // TODO: handle browser forward and backward btn clicks to prevent leaving page
    try{
        var response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner, repo, path,
        headers: DEFAULT_API_HEADERS.headers,
      })
    } catch ( err ) {
        if (err.response.status === 404) {
            // TODO: owner, repo or path is invalid => panic
            alert('[404]: owner, repo or path is invalid => panic')
            return;
        }
    }

    if (response.data.length) {
        /* path is a dir */
        previewDiv.hidden = true;
        cwdNameDiv.innerHTML = headerName;
        treeUl.hidden = false;
        // TODO HERE: try get README.md of that dir then unhide previewDiv
        // set treeUl items
        treeUl.querySelectorAll('tree-item').forEach(el => el.remove());
        if (path != '') {
            var treeItem = document.createElement('tree-item');
            treeItem.setAttribute('data-item-name', '..');
            treeItem.setAttribute('data-item-path', path + '/..');
            treeItem.setAttribute('data-item-type', 'dir');
            treeUl.appendChild(treeItem);
        }
        var
            dirItems = [],
            fileItems = [];
        response.data.forEach((item) => { item.type === 'dir' ? dirItems.push(item) : fileItems.push(item) });
        dirItems.concat(fileItems).forEach((item) => {
            var treeItem = document.createElement('tree-item');
            treeItem.setAttribute('data-item-name', item.name);
            treeItem.setAttribute('data-item-path', item.path);
            treeItem.setAttribute('data-item-type', item.type);
            treeUl.appendChild(treeItem);
        })
    } else {
        /* path is a file */
        treeUl.hidden = true;
        previewItemNameDiv.innerHTML = headerName;
        previewItemContentDiv.innerHTML = '';
        var m = String(mime.getType(path)); // m.slice(0, m.indexOf('/'))
        if (m.startsWith('image/')) {
            // TODO: img render
        } else if (m.endsWith('/pdf')) {
            // TODO: pdf render
        } else if (m.endsWith('/markdown')) {
            // TODO: md parse
        } else {
            // normal text file
            // FIXME: use prism.js instead of highlight.js: https://prismjs.com/
            var el = document.createElement('pre');
            el.classList.add(headerName.split('.').at(-1))
            el.innerHTML = atob(response.data.content)
            hljs.highlightElement(el);
            previewItemContentDiv.appendChild(el);
        }
        previewDiv.hidden = false;
        // set Raw url
        rawBtn.setAttribute('href', response.data.download_url);
    }
    if (path.startsWith('/')) path = path.slice(1);
    window.path = path;
    // set Location bar
    locationDiv.innerHTML = '';
    var pathSplit = path.split('/')
    var onLocationClick = (evt) => {
        var el = evt.target;
        var parentChildren = el.parentNode.querySelectorAll('a');
        var
            pathToGo = '',
            child,
            itemName;
        for (let i = 0; i <= parentChildren.length; i++) {
            child = parentChildren[i];
            itemName = child.getAttribute('data-item-name');
            if (itemName) {
                pathToGo += '/' + itemName;
            }
            if (child == el) break;
        }
        gotoPath(pathToGo);
    }

    if (path) {
        var a = document.createElement('a');
        a.style.cursor = 'pointer';
        a.onclick = onLocationClick;
        a.setAttribute('data-item-name', '');
    } else {
        var a = document.createElement('span');
    }
    a.innerHTML = window.repo;
    locationDiv.appendChild(a);
    if (path) {
        pathSplit.slice(0, -1).forEach((i)=>{
            var slash = document.createElement('span');
            slash.innerHTML = ' / ';
            locationDiv.appendChild(slash);
            var a = document.createElement('a');
            a.style.cursor = 'pointer';
            a.onclick = onLocationClick;
            a.setAttribute('data-item-name', i);
            a.innerHTML = i;
            locationDiv.appendChild(a);
        });
        var slash = document.createElement('span');
        slash.innerHTML = ' / ';
        locationDiv.appendChild(slash);
        var span = document.createElement('span')
        span.innerHTML = pathSplit.at(-1);
        locationDiv.appendChild(span);
    }

}

class TreeItem extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = `
        <li class="entry" style="cursor: pointer;">
            <img class="icon ${this.getAttribute('data-item-type')}">
            <a>${this.getAttribute('data-item-name')}</a>
        </li>
    `;
    this.getElementsByTagName('a')[0].addEventListener('click', () => {
        gotoPath(this.getAttribute('data-item-path'));
    })
  }
}
customElements.define("tree-item", TreeItem);


(async () => {
    var urlParams = new URLSearchParams(document.location.search);
    window.repo = urlParams.get('repo');
    if (!repo) {
        // TODO: no repo-name is supplied => panic
        alert('no repo-name is supplied => panic')
        return;
    }
    window.token = urlParams.get('token');
    if (!token) {
        // TODO: no token is supplied => panic
        alert('no token is supplied => panic')
        return;
    }
    token = JSON.parse(urlParams.get('token_ready')) ? token : atob(token);
    window.octokit = new Octokit({ auth: token });
    // check token
    try {
        var tokenAuthenticatedUser = (await octokit.request('GET /user', DEFAULT_API_HEADERS)).data.login;
    } catch (err) {
        if (err.response.status === 401) {
            // TODO: token is not valid: panic
            alert('token is not valid: panic')
            return;
        }
    }

    window.path = urlParams.get('path');
    path = path ? path : '';

    window.owner = urlParams.get('owner');
    // if no usernae is supplied, then: set is as the user who created that access_token
    owner = owner ? owner : tokenAuthenticatedUser;

    document.title = `${owner} / ${repo} · ${document.title}`;
    addBtnClone();
    // TODO: make gutter numbers for code viles view: https://stackoverflow.com/questions/41306797/html-how-to-add-line-numbers-to-a-source-code-block
    // TODO: render svg and imgs instead of viewing them raw
    // TODO: wrap octokit.request with unsafe method to prevent internet errors from being miss-understood as API errors in code
    // TODO: add online/offline events and icon to indicate online status
    // TODO: add a spinner progress to make user wait while fetch API finish fetching data

    // get required path
    await gotoPath(path)
})();

