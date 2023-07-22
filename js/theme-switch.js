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
switchBtn.addEventListener("click", () => {
    if(toggle){
        animate.restart();
        darkreader.enable();
    } else {
        animate.reverse();
        darkreader.disable();
    }
    toggle = !toggle;
});




if (window.useDarkTheme) {
    switchBtn.click()
}

// <!--  TODO: save dark theme cfg in cookies  -->
