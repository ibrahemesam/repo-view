class IncludeHTML extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.style.display = "none !important;";
    var src = this.getAttribute("src");
    if (src) {
        fetch(src).then((r) => { r.text().then( (t) => {
            setOuterHTML(this, t);
        })});
    }
  }
}
customElements.define("include-html", IncludeHTML);

async function setOuterHTML(elm, html) {
    var lastHidden = elm.hidden;
    elm.hidden = true;
    elm.innerHTML = html;
    Array.from(elm.querySelectorAll("script")).forEach(async(oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes)
            .forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        newScript.async = false;

        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
    elm.outerHTML = html;
    elm.hidden = lastHidden;
}
