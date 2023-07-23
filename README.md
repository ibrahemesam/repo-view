# repo-view.github.io

## TODOs:-

- [ ] add a spinner progress to make user wait while fetch API finish fetching data
- [ ] js/theme-switch.js TODOs && index.html TODOs
- [ ] add btn for zip download and another for tar download

- [ ] make gutter numbers for code files view: https://stackoverflow.com/questions/41306797/html-how-to-add-line-numbers-to-a-source-code-block

- [ ] disable Octokit logs

- [ ] handle browser forward and backward btn clicks to prevent leaving SPA page: https://codepen.io/tamjk/pen/NWxWOxL
- [ ] after each gotoPath run: update url params: add path to dir|file in url params => start directly from it

- [ ] add locks to prevent gotoPath while previus gotoPath is still running
    - add prgress spinner bar that is shown only while gotoPath is executing

- [ ] wrap octokit.request with unsafe method to overcome internet disconnections
- [ ] add online/offline events and icon to indicate online status

- [ ] document this project
    - useless b64 token in url params is for لسبب نفسي + ان التوكن ميبقاش مباشر في اللنك

- [ ] backend automation: re-new token anually using python

- [x] pdf render
- [x] fixme: darkreader browser addon can't switch to light if page was set to dark
    - solution: (on js: detect when theme switch go hidden => unset dark filter & when go visible: set dark filter if it was set)
