const animate = gsap.timeline({ paused: true });
let toggle = true;
animate
    .to(".toggle-button", 0.2, { scale: 0.7 }, 0)
    .set(".toggle", { backgroundColor: "#FFF" })
    .set(".circle", { display: "none" })
    .to(".moon-mask", 0.2, { translateY: 20, translateX: -10 }, 0.2)
    .to(".toggle-button", 0.2, { translateY: 49 }, 0.2)
    .to(".toggle-button", 0.2, { scale: 0.9 })

var switchBtn = document.querySelector("div.darkreader-switch")
switchBtn.addEventListener("click", async () => {
    if(toggle){
        animate.restart();
        darkreader.enable();
        localStorage.setItem('useDarkTheme', true)
    } else {
        animate.reverse();
        darkreader.disable();
        localStorage.setItem('useDarkTheme', false)
    }
    toggle = !toggle;
});




if (window.useDarkTheme) {
    switchBtn.click();
    delete window.useDarkTheme;
}

// switchBtn.addEventListener('load',
(() => {
    var targetNode = document.querySelector('html');
    (new MutationObserver(function(){
        if(targetNode.hasAttribute('data-darkreader-scheme')){
            // darkreader addon got activated
            darkreader.disable();
        } else {
            // darkreader addon got un-activated
            if (toggle) {
                darkreader.disable();
            } else {
                darkreader.enable();
            }
        }
    })).observe(targetNode, { attributes: true });
})();

