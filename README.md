<h1 align="center">~: repo-view :~</h1>
<p align="center">
  <img src="https://github.com/ibrahemesam/repo-view/blob/main/asset/favicon.svg?raw=true" width="30%"/>
</p>
— lets employers see your private GitHub repositories in your CV
<hr>
<h1>Overview :-</h1>
<pre>
let's say you have a really good private repo that you wanna add to your CV.
wait! it is private. right ? then how ?? would you make it public ???
hell NO! it is private and MUST stay as is.
sure you don't wanna your business proprietary code base be published as open-source.
man!, you just wanna show it only to some employers.
of course you can add these employers as collaborators with read-only permissions to this private repo.
but, first you will have to get their GitHub usernames. also, you will have to add them one by one.
maybe you gonna use a cloud storage service with code syntax highlighting ?
oh, what about synchronization between your Github repo and these cloud services ??
what if the cloud shared folder got found by search engines ???
</pre>
<hr>
<h1>Solution :-</h1>
<pre>
there is a website called <a href="https://gitfront.io" target="_blank">GitFront.io</a> :
    it can host your private repo and provide a presentation url that is accessible to anyone who has it.
- problem with GitFront is that: it allows hosting only less-than 100 MB repo for free account.
    if your private repo is larger than that, you gonna have to pay 💵💵💲
    ( this was the reason why I created this project )
- your github repo does not get directly synchronized with GitFront
</pre>
<pre>
my repo-view do exactly the same except that:
- it is a static web page (no backend) -> your code exists only on Github. it does not goto any 3rd party server
- it uses official GitHub REST API, it gets files directly from GitHub
- no problem if repo is larger than 100 MB. you still can preview it
- it is a single page application
- it has some extra features eg: downloading repo as zip or tar, dark theme switch, ...
</pre>
<p align="center">
  <img src="https://github.com/ibrahemesam/repo-view/blob/main/matrix-meme.png?raw=true" />
</p>
<hr>
<h1>Usage :-</h1>
<pre>
it is a static web page. so, configuration is gonna be passed as url params.
<h2>params :-</h2>
<strong>token</strong> : string => github access_token
    warning: use only tokens with only permissions: repos read-only<br>
<strong>repo</strong> : string => the repo name on github<br>
<strong>owner</strong> : string => the repo owner username (or organization username) on github
                  if omitted, it would be fetched from githun (the username who created the access_token).
                              so, if that username is not the owner of the repo, you gonna get ERROR 404<br>
<strong>token_ready</strong> : bool => it is optional: default is "false" =>
    if true: provide token param is gonna be used as is
    else:
        the provided token param must be provied as encodes base64 string using js "btoa" method
        it first will be decoded back before use ( using js "atob" method )
        why?
            - the token does not exist readily on url:
                if any web scrapper found the url and got the token and tried it on his terminal:
                    it wont work. it fist need to be decoded
            - if the one ,to whom you send the url, tried to use the token (in their terminal)
                before they view the url on web browser. and it worked.
                they may think they got hands on a treasure. and they may exploit this token.
                but if it did not work (ie: it was base64-encoded): sooner or later, after they open the url,
                    they gonna find that they can just get the real token from the web page.
                    so, they wont get too excited about that token.<br>
<strong>so</strong> the url would be: https://ibrahemesam.github.io/repo-view/?token=<token>&repo=<repo-name>&owner=<owner-username>
</pre>
<hr>
<pre>
<strong>!! Warning !!</strong>: any one with the url can preview and clone the repo
          so, put it only on your CV and send it only to employers
              do NOT put it on places where it may be stolen eg: https://<your_username>.github.io
                    or the production business website of the private repo
</pre>
<hr>
<h1 align="center" style="margin: auto;">feel free to report any bug through issues section</h1>
<hr>
<h1>TODOs :-</h1>

- [ ] js/theme-switch.js TODOs && index.html TODOs
- [ ] add btn for zip download and another for tar download

- [ ] handle browser forward and backward btn clicks to prevent leaving SPA page: https://codepen.io/tamjk/pen/NWxWOxL
- [ ] after each gotoPath run: update url params: add path to dir|file in url params => start directly from it

- [ ] on startup initialization: add a spinner progress to make user wait while fetch API finish fetching data
    - [ ] add prgress spinner bar that is shown only while gotoPath is executing
    - [ ] add locks to prevent gotoPath while previous gotoPath is still running: (eg: disable clicks on < a >s & set css cursor: default)

- [ ] add online/offline events and icon to indicate online status

- [ ] add LICENSE.txt
- [ ] backend automation: re-new token anually using python
