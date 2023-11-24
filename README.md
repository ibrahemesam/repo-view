<h1 align="center">~: repo-view :~</h1>
<p align="center">
  <img src="https://github.com/ibrahemesam/repo-view/blob/main/asset/favicon.svg?raw=true" width="30%"/>
</p>
— It is a static web page that uses Github REST API to preview repos.<br>
  It lets employers see your private GitHub repositories in your CV (with your permission of course) without making them public 💵↗️↗️
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
- your GitFront repo does not get directly synchronized with GitHub
</pre>
<pre>
my <a href="#">repo-view</a> do exactly the same except that:
- it is a static web page (no backend) -> your code exists only on GitHub. it does not goto any 3rd party server
- it uses official GitHub REST API, it gets files directly from GitHub
- no problem if repo is larger than 100 MB. you still can preview it
- it is a single page application
- it has some extra features eg: dark theme switch, preview pdf, detect internet disconnect...
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
                  if omitted, it would be fetched from Github (the username who created the access_token).
                              so, if that username is not the owner of the repo, you gonna get ERROR 404<br>
<strong>token_ready</strong> : bool => it is optional: default is "false" =>
    if true: provide token param is gonna be used as is
    else:
        the provided token param must be provied as encodes base64 string using js "btoa" method
        it first will be decoded back ( using js "atob" method )
        why?
            - the token does not exist readily on url:
                if any web scrapper found the url and got the token and tried it on their terminal:
                    it wont work. it fist need to be decoded
            - if the one ,to whom you send the url, tried to use the token (in their terminal)
                before they view the url on web browser. and it worked.
                they may think they got hands on a treasure. and they may exploit this token.
                but if it did not work (ie: it was base64-encoded): sooner or later, after they open the url,
                    they gonna find that they can just get the real token from the web page.
                    so, they wont get too excited about that token.<br>
<strong>so, </strong>the url would be: https://ibrahemesam.github.io/repo-view/?token=&lt;token&gt;&repo=&lt;repo-name&gt;&owner=&lt;owner-username&gt;
</pre>
<h1><a href="https://bit.ly/repo-view-demo-till-jan-2024" target="_blank">DEMO</a> :-</h1>
<pre>
this demo repo is <a href="https://github.com/ibrahemesam/repo-view-demo">a private github repository</a>. if you visit it, you get 404 because it is <strong>Private</strong>.
NB: this DEMO url EXPIRES on 17 Jan 2024. (this expiration is related to GitHub's fine-gained token settings)
</pre>
<pre><strong>NB: </strong> public repos can also be viewed</pre>
<hr>
<pre>
<strong style="color: red;">!! Warning !!</strong>: any one with the url can preview and clone the repo
    so, put it only on your CV and send it only to employers
        do NOT put it on places where it may be stolen eg: https://&lt;your_username&gt;.github.io
            or the production business website of the private repo
</pre>
<h1>To create a token :-</h1>
<pre>
1 - go to <a href="https://github.com/settings/personal-access-tokens/new" target="_blank">Github > settings > Developer settings > Personal access tokens > Fine-gained tokens</a>
2 - set "Token name" and "Expiration" date.
3 - on "Repository access" section: select "Only select repositories" then select the repo you wanna use.
4 - under "Permissions section": under "Repository permissions": select "Contents" with "Read-only" access level.
5 - click "Generate token" then copy it.
</pre>
<pre>
<strong style="color: red;">!! Warning !!</strong>: any one with the url can get the token.
    so, when creating the token, do NOT add any permissions to the token other than
        read-only access to repository content (access to only one private repo. NOT all !).
    otherwise, the token may be exploited !!
</pre>
<hr>
<h1 align="center" style="margin: auto;">feel free to report any bug through issues section</h1>
<pre align=center>if you like this project, give it a Star ⭐</pre>
<hr>
<h1>LICENSE :-</h1>
<pre>
This project is provided "AS IS" with absolutely "NO WARRANTY".
If you gonna use its source-code somewhere: make a clear credit refering to <a href="https://github.com/ibrahemesam/repo-view" target="_blank">this repo-view repository</a>.
</pre>
<pre>
  - [ ] FIXME: when putting the CV in github.io page, github detects btoa-encoded token and think it exists by mistake as a vulnerability so token and URLs are immediately disabled. so => change encoding to something that github can't detect. also, mintain backward compatibility
</pre>
