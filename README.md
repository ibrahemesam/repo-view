# repo-view.github.io

## TODOs:-

- [ ] js/theme-switch.js TODOs && index.html TODOs
- [ ] add btn for zip download and another for tar download

- [ ] handle browser forward and backward btn clicks to prevent leaving SPA page: https://codepen.io/tamjk/pen/NWxWOxL
- [ ] after each gotoPath run: update url params: add path to dir|file in url params => start directly from it

- [ ] on startup initialization: add a spinner progress to make user wait while fetch API finish fetching data
    - [ ]  add prgress spinner bar that is shown only while gotoPath is executing
    - [ ] add locks to prevent gotoPath while previus gotoPath is still running: (eg: disable clicks on <a>s & set css cursor: default)

- [ ] add online/offline events and icon to indicate online status

- [ ] document this project
    - useless b64 token in url params is for لسبب نفسي + ان التوكن ميبقاش مباشر في اللنك

- [ ] backend automation: re-new token anually using python

- [x] pdf render
- [x] fixme: darkreader browser addon can't switch to light if page was set to dark
    - solution: (on js: detect when theme switch go hidden => unset dark filter & when go visible: set dark filter if it was set)
- [x] disable Octokit logs
- [x] wrap octokit.request with unsafe method to overcome internet disconnections
- [x] make gutter numbers for code files view: https://prismjs.com/plugins/line-numbers/


