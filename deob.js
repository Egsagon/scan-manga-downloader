const styleDoc = document.documentElement.style;

const checkRefUrl = document.referrer;
const isLelPage = window.location.href.includes("/lecture-en-ligne/");
const isLelReferrer = checkRefUrl && !checkRefUrl.includes("/lecture-en-ligne/");
const checkRefUrlDomain = isLelReferrer ? new URL(checkRefUrl).hostname.split(".").slice(-2)["join"](".") : null;
const lelHgHistoryBack = document.querySelector(".lelHgHistoryBack");
if (isLelPage && isLelReferrer && (checkRefUrlDomain === "scan-manga.com" || checkRefUrlDomain === "scanmanga.fr")) {
  sessionStorage.setItem("PreviousPageNotLel[" + idm + "]", checkRefUrl);
}
const setPreviousPageNotLelLink = () => {
  const _0xcefdx10 = sessionStorage.getItem("PreviousPageNotLel[" + idm + "]");
  const _0xcefdx11 = _0xcefdx10 ? new URL(_0xcefdx10).hostname.split(".").slice(-2)["join"](".") : null;
  if (_0xcefdx11 === "scan-manga.com") {
    lelHgHistoryBack.href = _0xcefdx10;
  }
};
setPreviousPageNotLelLink();
const DefaultMode = mode;
const readerView = document.querySelector(".reader_view");
const readerContainer = document.querySelector(".reader_container");
const resizable = document.querySelector(".resizable");
const img_lel = document.querySelector(".img_lel");
const minImgToLoadAfterVisible = 2;
const minSizeToLoadAfterVisible = 3;
const minHeightToLoadAfterVisible = 3e3;
const availableModes = ["strip", "single"];
const toggleMode = document.querySelector(".toggleMode");
const toggleQuality = document.querySelector(".quality");
const settingIco = document.querySelector(".setting_ico");
const settingOverlay = document.querySelector(".setting_overlay");
const lel_menu_setting = document.querySelector(".lel_menu_setting");
const pagination = document.querySelector("div.pagination");
const toTop = document.querySelector(".toTop");
const readerClickNav = document.querySelector(".reader_click_nav");
const Stretcher = document.querySelector(".Stretch");
const resizeImage = document.querySelector(".resizeImage");
const resizeImageAutoStrip = document.querySelector('.resizeImageAuto[data-aimfor="strip"]');
const resizeImageAutoSingle = document.querySelector('.resizeImageAuto[data-aimfor="single"]');
const fullScreen = document.querySelector(".fullScreen");
const teams = document.querySelector(".teams");
const readerViewNames = {strip: {minWidth: "readerMinWidthViewStrip", maxWidth: "readerMaxWidthViewStrip"}, single: {minWidth: "readerMinWidthViewSingle", maxWidth: "readerMaxWidthViewSingle"}};
let select = document.querySelector("#select_chapter");
let lelParametres = JSON.parse(localStorage.getItem("lelParametres")) || {};
let readerViewMouseX = 0;
let readerViewIsResizing = false;
let showHelpDirection = false;
let readerViewStarE;
let maxWidthImg;
let minWidthImg;
let constrainMaxWidthImg = false;
let constrainMinWidthImg = false;
let visibleTopPage = 1;
let Chapitre = [];
let animePagination;
let imagesStrip;
let menuBlock;
var bottomReach = 0;
const isNotDesktop = () => {
  const _0xcefdx3b = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  const _0xcefdx3c = window.orientation == 0;
  const NotDesktop = _0xcefdx3b && (_0xcefdx3c || window.innerWidth <= 1024);
  return NotDesktop;
};
const NotDesktop = isNotDesktop();
const calcSetAutoSizeImage = () => {
  if (mode == "strip") {
    optimalWidth = 40;
    if (window.innerWidth <= 1280 && window.orientation != 0) {
      optimalWidth = 35;
    } else {
      if (window.innerWidth <= 1280 && window.orientation == 0) {
        optimalWidth = 65;
      }
    }
    readerView.style.Width = optimalWidth + "vw";
    readerView.style.maxWidth = optimalWidth + "vw";
    readerView.style.minWidth = optimalWidth + "vw";
    styleDoc.setProperty("--min-width-img", optimalWidth + "vw");
  }
};
const setResizeImageAutoStrip = _0xcefdx40 => {
  recLelParametre("resizeImageAutoStrip", _0xcefdx40.toString());
  resizeImageAutoStrip.dataset.active = _0xcefdx40;
  if (_0xcefdx40 == 1) {
    resizable.style.display = "none";
    styleDoc.setProperty("--min-width-img", "");
    recLelParametre(readerViewNames[mode].maxWidth, "");
    recLelParametre(readerViewNames[mode].minWidth, "");
    readerView.style.minWidth = "";
    readerView.style.Width = "";
    readerView.style.maxWidth = "";
    Stretcher.style.width = "150px";
    img_lel.style.opacity = 1;
    resizeImage.dataset.active = 0;
    calcSetAutoSizeImage();
  }
  if (_0xcefdx40 == 0) {
    const _0xcefdx41 = parseInt(getComputedStyle(readerView).getPropertyValue("--min-width-img"));
    readerView.style.minWidth = "";
    readerView.style.Width = "";
    readerView.style.maxWidth = "";
    if (lelParametres[readerViewNames[mode].minWidth]) {
      styleDoc.setProperty("--min-width-img", lelParametres[readerViewNames[mode].minWidth]);
      Stretcher.style.width = lelParametres[readerViewNames[mode].minWidth];
    } else {
      styleDoc.setProperty("--min-width-img", "150px");
      Stretcher.style.width = "150px";
    }
    if (lelParametres[readerViewNames[mode].maxWidth]) {
      readerView.style.maxWidth = lelParametres[readerViewNames[mode].maxWidth];
    } else {
      readerView.style.maxWidth = "";
    }
  }
};
const setResizeImageAutoSingle = _0xcefdx40 => {
  recLelParametre("resizeImageAutoSingle", _0xcefdx40.toString());
  resizeImageAutoSingle.dataset.active = _0xcefdx40;
  if (_0xcefdx40 == 0) {
    readerView.style.minWidth = "";
    readerView.style.Width = "";
    readerView.style.maxWidth = "";
    styleDoc.setProperty("--min-width-img", "");
    styleDoc.setProperty("--fit-height-single", "");
    recLelParametre(readerViewNames[mode].maxWidth, "");
    recLelParametre(readerViewNames[mode].minWidth, "");
    resizeImageAutoSingle.classList.remove("custom");
  } else {
    if (_0xcefdx40 == 1) {
      readerView.style.minWidth = "";
      readerView.style.Width = "";
      readerView.style.maxWidth = "";
      styleDoc.setProperty("--fit-height-single", "100vh");
      styleDoc.setProperty("--min-width-img", "");
    } else {
      if (_0xcefdx40 == 2) {
        styleDoc.setProperty("--min-width-img", "100%");
        styleDoc.setProperty("--fit-height-single", "");
        readerView.style.minWidth = "";
        readerView.style.Width = "";
        readerView.style.maxWidth = "";
      }
    }
  }
};
function readerViewStartResize(_0xcefdx5) {
  _0xcefdx5.preventDefault();
  readerViewStarE = _0xcefdx5;
  readerViewMouseX = _0xcefdx5.touches && _0xcefdx5.touches.length > 0 ? _0xcefdx5.touches[0].clientX : _0xcefdx5.clientX;
  if (resizeImageAutoStrip.dataset.active == 1) {
    setResizeImageAutoStrip(0);
  }
  if (resizeImageAutoSingle.dataset.active != 0) {
    setResizeImageAutoSingle(0);
  }
  if (_0xcefdx5.target.classList.contains("maxWidth")) {
    if (_0xcefdx5.touches) {
      document.addEventListener("touchmove", readerViewResize, {passive: false});
      document.addEventListener("touchend", readerViewStopResize, {passive: false});
    } else {
      document.addEventListener("mousemove", readerViewResize);
      document.addEventListener("mouseup", readerViewStopResize);
    }
  }
  if (_0xcefdx5.target.classList.contains("maxStretch")) {
    if (_0xcefdx5.touches) {
      document.addEventListener("touchmove", readerViewStretch, {passive: false});
      document.addEventListener("touchend", readerViewStopStretch, {passive: false});
    } else {
      document.addEventListener("mousemove", readerViewStretch);
      document.addEventListener("mouseup", readerViewStopStretch);
    }
  }
  if (mode == "single") {
    resizeImageAutoSingle.classList.add("custom");
  }
}
function readerViewResize(_0xcefdx45) {
  _0xcefdx45.preventDefault();
  const _0xcefdx6 = readerViewStarE.target;
  let _0xcefdx46 = 1;
  readerViewIsResizing = true;
  if (_0xcefdx6.classList.contains("left")) {
    _0xcefdx46 = -1;
  } else {
    if (!_0xcefdx6.classList.contains("right")) {
      readerViewIsResizing = false;
    }
  }
  if (readerViewIsResizing) {
    const _0xcefdx47 = _0xcefdx45.touches && _0xcefdx45.touches.length > 0 ? _0xcefdx45.touches[0].clientX : _0xcefdx45.clientX;
    const _0xcefdx48 = (_0xcefdx47 - readerViewMouseX) * _0xcefdx46;
    maxWidthImg = resizable.offsetWidth + _0xcefdx48 + "px";
    const _0xcefdx41 = parseInt(getComputedStyle(readerView).getPropertyValue("--min-width-img"));
    if (parseInt(maxWidthImg) < _0xcefdx41) {
      styleDoc.setProperty("--min-width-img", maxWidthImg);
      Stretcher.style.width = maxWidthImg;
      minWidthImg = maxWidthImg;
      constrainMinWidthImg = 1;
    }
    readerView.style.maxWidth = maxWidthImg;
    readerViewMouseX = _0xcefdx47;
  }
}
function readerViewStretch(_0xcefdx45) {
  _0xcefdx45.preventDefault();
  const _0xcefdx6 = readerViewStarE.target;
  const readerContainer = document.querySelector(".reader_container");
  let _0xcefdx46 = 1;
  readerViewIsResizing = true;
  if (_0xcefdx6.classList.contains("left")) {
    _0xcefdx46 = -1;
  } else {
    if (!_0xcefdx6.classList.contains("right")) {
      readerViewIsResizing = false;
    }
  }
  if (readerViewIsResizing) {
    const _0xcefdx4a = _0xcefdx6.parentNode;
    const _0xcefdx47 = _0xcefdx45.touches && _0xcefdx45.touches.length > 0 ? _0xcefdx45.touches[0].clientX : _0xcefdx45.clientX;
    const _0xcefdx48 = (_0xcefdx47 - readerViewMouseX) * _0xcefdx46;
    minWidthImg = _0xcefdx4a.offsetWidth + _0xcefdx48 + "px";
    if (parseInt(minWidthImg) >= 150 && parseInt(minWidthImg) < parseInt(readerContainer.offsetWidth)) {
      if (parseInt(minWidthImg) > parseInt(readerView.style.maxWidth)) {
        readerView.style.maxWidth = minWidthImg;
        maxWidthImg = minWidthImg;
        constrainMaxWidthImg = 1;
      }
      styleDoc.setProperty("--min-width-img", minWidthImg);
      _0xcefdx4a.style.width = minWidthImg;
      readerViewMouseX = _0xcefdx47;
    }
  }
}
function readerViewStopStretch(_0xcefdx45) {
  _0xcefdx45.preventDefault();
  readerViewIsResizing = false;
  recLelParametre(readerViewNames[mode].minWidth, minWidthImg);
  if (constrainMaxWidthImg == 1) {
    recLelParametre(readerViewNames[mode].maxWidth, maxWidthImg);
  }
  if (_0xcefdx45.touches) {
    document.removeEventListener("touchmove", readerViewStretch);
    document.removeEventListener("touchend", readerViewStopStretch);
  } else {
    document.removeEventListener("mousemove", readerViewStretch);
    document.removeEventListener("mouseup", readerViewStopStretch);
  }
}
function readerViewStopResize(_0xcefdx45) {
  _0xcefdx45.preventDefault();
  readerViewIsResizing = false;
  recLelParametre(readerViewNames[mode].maxWidth, maxWidthImg);
  if (constrainMinWidthImg == 1) {
    recLelParametre(readerViewNames[mode].minWidth, minWidthImg);
  }
  if (_0xcefdx45.touches) {
    document.removeEventListener("touchmove", readerViewResize, {passive: false});
    document.removeEventListener("touchend", readerViewStopResize, {passive: false});
  } else {
    document.removeEventListener("mousemove", readerViewResize);
    document.removeEventListener("mouseup", readerViewStopResize);
  }
}
const recLelParametre = (_0xcefdx4e, _0xcefdx4f) => {
  let lelParametres = JSON.parse(localStorage.getItem("lelParametres")) || {};
  lelParametres[_0xcefdx4e] = _0xcefdx4f;
  localStorage.setItem("lelParametres", JSON.stringify(lelParametres));
};
const applyLelParametre = () => {
  const lelParametres = JSON.parse(localStorage.getItem("lelParametres")) || {};
  if (!NotDesktop || window.innerWidth >= 1024) {
    if (mode == "strip") {
      if (lelParametres.resizeImageAutoStrip == 1 || !lelParametres.resizeImageAutoStrip && !lelParametres[readerViewNames[mode].maxWidth]) {
        resizeImageAutoStrip.dataset.active = 1;
        calcSetAutoSizeImage();
      } else {
        if (lelParametres[readerViewNames[mode].maxWidth]) {
          resizeImageAutoStrip.dataset.active = 0;
          if (parseInt(lelParametres[readerViewNames[mode].maxWidth]) > parseInt(readerContainer.offsetWidth)) {
            readerView.style.maxWidth = readerContainer.offsetWidth;
          } else {
            readerView.style.maxWidth = lelParametres[readerViewNames[mode].maxWidth];
          }
        } else {
          if (lelParametres.resizeImageAutoStrip == 0) {
            resizeImageAutoStrip.dataset.active = 0;
          }
        }
      }
    } else {
      if (mode == "single") {
        if (lelParametres.resizeImageAutoSingle > 0) {
          resizeImageAutoSingle.dataset.active = lelParametres.resizeImageAutoSingle;
          setResizeImageAutoSingle(resizeImageAutoSingle.dataset.active);
        } else {
          if (lelParametres[readerViewNames[mode].maxWidth]) {
            resizeImageAutoSingle.dataset.active = 0;
            if (parseInt(lelParametres[readerViewNames[mode].maxWidth]) > parseInt(readerContainer.offsetWidth)) {
              readerView.style.maxWidth = readerContainer.offsetWidth;
            } else {
              readerView.style.maxWidth = lelParametres[readerViewNames[mode].maxWidth];
            }
            resizeImageAutoSingle.classList.add("custom");
          } else {
            if (lelParametres.resizeImageAutoSingle == 0) {
              resizeImageAutoSingle.dataset.active = 0;
            }
          }
        }
      }
    }
    if (lelParametres[readerViewNames[mode].minWidth]) {
      if (parseInt(lelParametres[readerViewNames[mode].minWidth]) > parseInt(readerContainer.offsetWidth)) {
        if (resizeImageAutoStrip.dataset.active == 0 && mode == "strip" || resizeImageAutoSingle.dataset.active == 0 && mode == "single") {
          styleDoc.setProperty("--min-width-img", readerContainer.offsetWidth);
          Stretcher.style.width = readerContainer.offsetWidth;
          if (mode == "single") {
            resizeImageAutoSingle.classList.add("custom");
          }
        }
      } else {
        if (resizeImageAutoStrip.dataset.active == 0 && mode == "strip" || resizeImageAutoSingle.dataset.active == 0 && mode == "single") {
          if (lelParametres[readerViewNames[mode].minWidth]) {
            styleDoc.setProperty("--min-width-img", lelParametres[readerViewNames[mode].minWidth]);
            Stretcher.style.width = lelParametres[readerViewNames[mode].minWidth];
          }
          if (mode == "single") {
            resizeImageAutoSingle.classList.add("custom");
          }
        }
      }
    }
  }
  if (lelParametres.PageDisplayStyle) {
    mode = lelParametres.PageDisplayStyle;
    if (DefaultMode == "strip") {
      mode = "strip";
    }
  }
  if (lelParametres.quality) {
    toggleQuality.dataset.active = lelParametres.quality;
  }
  if (lelParametres.brightness) {
    document.documentElement.style.setProperty("--img-brightness", `${""}${lelParametres.brightness}${"%"}`);
    range.value = lelParametres.brightness;
    const _0xcefdx7 = range.min;
    const _0xcefdx8 = range.max;
    const _0xcefdx9 = range.value;
    range.style.backgroundSize = (_0xcefdx9 - _0xcefdx7) * 100 / (_0xcefdx8 - _0xcefdx7) + "% 100%";
  }
  if (lelParametres.displayMenu_lel_menu_chapitre == 0) {
    const _0xcefdx51 = document.getElementById("closeMenu");
    _0xcefdx51.click();
  }
  if (lelParametres.displayMenu_lel_menu_setting == 0) {
    const _0xcefdx51 = document.getElementById("closeSetting");
    _0xcefdx51.click();
  }
};
function helpDirectionAnime() {
  if (!("lastReadingMode" in lelParametres) || mode != lelParametres.lastReadingMode) {
    const _0xcefdx53 = document.querySelectorAll(".helpDirection");
    for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdx53.length; _0xcefdx54++) {
      const _0xcefdx55 = _0xcefdx53[_0xcefdx54];
      _0xcefdx55.remove();
    }
    recLelParametre("lastReadingMode", mode);
    const readerView = document.querySelector(".reader_view");
    const _0xcefdx56 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    _0xcefdx56.setAttribute("class", "helpDirection");
    _0xcefdx56.setAttribute("viewBox", "0 0 24 24");
    const _0xcefdx57 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    _0xcefdx57.setAttribute("fill", "#ececec");
    _0xcefdx57.setAttribute("d", "M6.4 18L5 16.6L9.575 12L5 7.4L6.4 6l6 6l-6 6Zm6.6 0l-1.4-1.4l4.575-4.6L11.6 7.4L13 6l6 6l-6 6Z");
    showHelpDirection = true;
    const _0xcefdx58 = gsap.timeline({repeat: 3, yoyo: true});
    let _0xcefdx59 = {delay: 0, opacity: 1, display: "block", duration: 0.5, ease: "power1.inOut"};
    if (mode == "single") {
      _0xcefdx56.style.right = `${""}${(readerView.offsetLeft || 0) + 50}${"px"}`;
      _0xcefdx56.style.top = `${"50%"}`;
      _0xcefdx59.x = "+=45";
    } else {
      if (mode == "strip") {
        _0xcefdx56.style.cssText = `${"transform:rotate(90deg); top:75%; right:50%; left:50%"}`;
        _0xcefdx59.y = "+=45";
      }
    }
    _0xcefdx56.appendChild(_0xcefdx57);
    readerView.appendChild(_0xcefdx56);
    _0xcefdx58.to(".helpDirection", _0xcefdx59).eventCallback("onComplete", () => {
      if (readerView.contains(_0xcefdx56)) {
        readerView.removeChild(_0xcefdx56);
      }
    });
  }
}
function estVisible(_0xcefdx5b) {
  const _0xcefdx5c = window.innerHeight;
  const _0xcefdx5d = window.scrollY || window.pageYOffset;
  const {top, height} = _0xcefdx5b.getBoundingClientRect();
  const _0xcefdx5e = top + _0xcefdx5d;
  const _0xcefdx5f = _0xcefdx5e + height;
  return _0xcefdx5e < _0xcefdx5d + _0xcefdx5c && _0xcefdx5f > _0xcefdx5d;
}
resizable.addEventListener("mousedown", readerViewStartResize);
resizable.addEventListener("touchstart", readerViewStartResize, {passive: false});
const hashParts = window.location.hash.split("-");
let modeHash = hashParts[0].replace("#", "");
let modeTarget = parseInt(hashParts[1]);
let loadAlert;
let handleScrollGlobal;
let movetoY;
var user_interaction = false;
function onUserInteraction() {
  user_interaction = true;
}
document.addEventListener("click", onUserInteraction);
document.addEventListener("mousemove", onUserInteraction);
document.addEventListener("scroll", onUserInteraction);
document.addEventListener("keydown", onUserInteraction);
if (modeHash == "page") {
  mode = "single";
} else {
  if (modeHash == "scroll") {
    mode = "strip";
  }
}
const setQuality = () => {
  const lelParametres = JSON.parse(localStorage.getItem("lelParametres")) || {};
  if (loadAlert == "1" || lelParametres.quality == "0" || !lelParametres.quality && NotDesktop) {
    toggleQuality.dataset.active = "0";
  } else {
    toggleQuality.dataset.active = "1";
  }
  if (loadAlert == "1") {
    toggleQuality.classList.add("unavailable");
  }
};
const setModeLecture = () => {
  return new Promise(_0xcefdx6a => {
    applyLelParametre();
    if (DefaultMode == "strip") {
      mode = "strip";
      document.querySelector("div.toggleMode .pictSingle").remove();
    } else {
      if (toggleMode.dataset.customMode != mode && toggleMode.dataset.customMode != "" && typeof toggleMode.dataset.customMode != "undefined") {
        const _0xcefdx6b = document.querySelectorAll(".image-container");
        for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdx6b.length; _0xcefdx54++) {
          const _0xcefdx6c = _0xcefdx6b[_0xcefdx54];
          for (let _0xcefdx6d = 0; _0xcefdx6d < availableModes.length; _0xcefdx6d++) {
            const _0xcefdx6e = availableModes[_0xcefdx6d];
            if (_0xcefdx6c.classList.contains(_0xcefdx6e) && _0xcefdx6e !== mode) {
              _0xcefdx6c.classList.remove(_0xcefdx6e);
            }
          }
          _0xcefdx6c.classList.add(mode);
          _0xcefdx6c.classList.remove("right-cursor", "left-cursor", "down-cursor");
          if (mode != "strip" && !_0xcefdx6c.classList.contains("first")) {
            _0xcefdx6c.classList.add("hidden");
          } else {
            _0xcefdx6c.classList.remove("hidden");
          }
        }
      }
    }
    toggleMode.dataset.customMode = mode;
    img_lel.dataset.mode = mode;
    readerClickNav.dataset.mode = mode;
    const _0xcefdx6f = toggleMode.querySelectorAll("div");
    for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdx6f.length; _0xcefdx54++) {
      const _0xcefdx70 = _0xcefdx6f[_0xcefdx54];
      _0xcefdx70.dataset.active = 0;
    }
    if (mode == "single") {
      toggleMode.querySelector("div:nth-child(2)").dataset.active = 1;
      styleDoc.setProperty("--display-mode-single", "block");
      styleDoc.setProperty("--display-mode-strip", "none");
    }
    if (mode == "strip") {
      toggleMode.querySelector("div:first-child").dataset.active = 1;
      styleDoc.setProperty("--display-mode-single", "none");
      styleDoc.setProperty("--display-mode-strip", "block");
      styleDoc.setProperty("--fit-height-single", "");
    }
    if (NotDesktop && window.innerWidth < 1024) {
      toTop.style.display = "none";
    }
    _0xcefdx6a();
  });
};
const setHash = (_0xcefdx72, _0xcefdx73) => {
  if (_0xcefdx72 == null || _0xcefdx73 == null) {
    return false;
  }
  modeHash = _0xcefdx72;
  modeTarget = parseInt(_0xcefdx73);
  if (_0xcefdx72 && (_0xcefdx72 == "scroll" || _0xcefdx72 == "page") && _0xcefdx73 && Number.isInteger(parseInt(_0xcefdx73))) {
    if (history.replaceState) {} else {}
  } else {
    if (window.location.hash) {
      if (window.history.replaceState) {} else {}
    }
  }
  if (resizeImage && resizeImage.dataset && parseInt(resizeImage.dataset.active) === 1) {
    resizeImage.click();
  }
  if (img_lel.dataset.mode == "strip" && imagesStrip) {
    if (menuBlock.classList.contains("sticky")) {
      removeMobileMenuBlock(menuBlock);
    }
    if (settingIco.style.display != "none") {
      removeSettingIco();
    }
    if (NotDesktop && window.innerWidth < 1024) {
      handleToTop("none");
    } else {
      if (_0xcefdx73 != null && _0xcefdx73 > 1) {
        handleToTop("block");
      }
    }
  }
};
setModeLecture();
settingIco.addEventListener("click", function (_0xcefdx45) {
  if (lel_menu_setting.classList.contains("active")) {
    resetOverlay();
  } else {
    styleDoc.setProperty("overflow", "hidden");
    styleDoc.setProperty("pointerEvents", "none");
    const _0xcefdx74 = document.getElementById("lelCSS").sheet;
    _0xcefdx74.insertRule("::-webkit-scrollbar { display: none; }", 0);
    const _0xcefdx75 = document.createElement("div");
    _0xcefdx75.classList.add("overlay");
    document.body.insertBefore(_0xcefdx75, document.body.firstChild);
    lel_menu_setting.style.setProperty("overflow", "hidden");
    lel_menu_setting.style.setProperty("display", "block");
    lel_menu_setting.classList.add("active");
  }
  _0xcefdx45.preventDefault();
  _0xcefdx45.stopPropagation();
  return false;
});
resizeImageAutoStrip.addEventListener("click", function (_0xcefdx45) {
  _0xcefdx45.target.dataset.active = _0xcefdx45.target.dataset.active === "0" ? "1" : "0";
  if (_0xcefdx45.target.dataset.active == 0) {
    readerView.style.minWidth = "";
    readerView.style.Width = "";
    readerView.style.maxWidth = "";
  }
  setResizeImageAutoStrip(_0xcefdx45.target.dataset.active);
});
resizeImageAutoSingle.addEventListener("click", function (_0xcefdx45) {
  resizable.style.display = "none";
  styleDoc.setProperty("--min-width-img", "");
  readerView.style.maxWidth = "";
  img_lel.style.opacity = 1;
  resizeImage.dataset.active = 0;
  const _0xcefdx76 = parseInt(_0xcefdx45.target.dataset.active);
  const _0xcefdx77 = (_0xcefdx76 + 1) % 3;
  _0xcefdx45.target.dataset.active = _0xcefdx77.toString();
  recLelParametre("resizeImageAutoSingle", _0xcefdx45.target.dataset.active.toString());
  styleDoc.setProperty("--fit-height-single", "");
  setResizeImageAutoSingle(_0xcefdx45.target.dataset.active);
});
resizeImage.addEventListener("click", function (_0xcefdx45) {
  _0xcefdx45.target.dataset.active = _0xcefdx45.target.dataset.active === "1" ? "0" : "1";
  if (_0xcefdx45.target.dataset.active == 1) {
    resizable.style.display = "flex";
    img_lel.style.opacity = 0.2;
  } else {
    resizable.style.display = "none";
    img_lel.style.opacity = "";
  }
});
fullScreen.addEventListener("click", function (_0xcefdx45) {
  _0xcefdx45.target.dataset.active = _0xcefdx45.target.dataset.active === "1" ? "0" : "1";
  if (_0xcefdx45.target.dataset.active == 1) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else {
        if (document.documentElement.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else {
          if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
          } else {
            console.error("La méthode requestFullscreen n'est pas prise en charge par ce navigateur.");
          }
        }
      }
    }
  } else {
    document.exitFullscreen();
  }
  recLelParametre("fullScreen", _0xcefdx45.target.dataset.active);
});
document.addEventListener("fullscreenchange", function () {
  if (document.fullscreenElement) {
    fullScreen.dataset.active = 1;
  } else {
    fullScreen.dataset.active = 0;
  }
  recLelParametre("fullScreen", fullScreen.dataset.active);
});
window.addEventListener("resize", function () {
  var _0xcefdx78 = window.screen.height, _0xcefdx79 = window.screen.width, _0xcefdx7a = window.innerHeight, _0xcefdx7b = window.innerWidth;
  if (_0xcefdx79 == _0xcefdx7b && _0xcefdx78 == _0xcefdx7a) {
    fullScreen.dataset.active = 1;
  } else {
    fullScreen.dataset.active = 0;
  }
});
document.addEventListener("click", function (_0xcefdx45) {
  if (window.matchMedia("(max-width: 1120px)").matches) {
    if (_0xcefdx45.target.classList.contains("close") || _0xcefdx45.target !== lel_menu_setting && !lel_menu_setting.contains(_0xcefdx45.target) && lel_menu_setting.classList.contains("active")) {
      resetOverlay();
    }
  } else {
    if (_0xcefdx45.target.classList.contains("close")) {
      const _0xcefdx7c = _0xcefdx45.target.parentNode;
      recLelParametre("displayMenu_" + _0xcefdx7c.classList[0], 0);
      displayShowMenu(_0xcefdx7c);
    }
    if (_0xcefdx45.target.classList.contains("show")) {
      const _0xcefdx7d = _0xcefdx45.target.nextElementSibling;
      recLelParametre("displayMenu_" + _0xcefdx7d.classList[0], 1);
      _0xcefdx7d.style.display = "flex";
      _0xcefdx45.target.remove();
    }
  }
});
const checkIfBotTaken = () => {
  const _0xcefdx7f = document.querySelectorAll('[class^="impactify-player-"]');
  const _0xcefdx80 = _0xcefdx7f.length > 0 ? _0xcefdx7f[0].offsetHeight : null;
  if (_0xcefdx80 !== null) {
    const _0xcefdx81 = getComputedStyle(_0xcefdx7f[0]);
    if (_0xcefdx81.display != "none") {
      settingOverlay.style.marginBottom = `${""}${_0xcefdx80}${"px"}`;
      settingIco.style.marginBottom = `${""}${_0xcefdx80}${"px"}`;
      pagination.style.marginBottom = `${""}${_0xcefdx80}${"px"}`;
    }
  } else {
    settingOverlay.style.marginBottom = "";
    settingIco.style.marginBottom = "";
    pagination.style.marginBottom = "";
  }
};
const resetOverlay = () => {
  const _0xcefdx75 = document.querySelector(".overlay");
  if (_0xcefdx75) {
    const _0xcefdx74 = document.getElementById("lelCSS").sheet;
    _0xcefdx74.insertRule("::-webkit-scrollbar { display: none; }", 0);
    document.documentElement.style.overflow = "visible";
    document.documentElement.style.pointerEvents = "auto";
    _0xcefdx75.remove();
    lel_menu_setting.style.display = "none";
    lel_menu_setting.classList.remove("active");
    helpDirectionAnime();
  }
};
toggleMode.addEventListener("click", async function (_0xcefdx45) {
  const _0xcefdx83 = _0xcefdx45.target;
  if (_0xcefdx83.dataset.active == "0" && DefaultMode != "strip") {
    mode = mode === "single" ? "strip" : "single";
    recLelParametre("PageDisplayStyle", mode);
    await setModeLecture();
    showHelpDirection = false;
    const _0xcefdx84 = document.querySelector(`${'[data-page="'}${visibleTopPage}${'"]'}`);
    if (_0xcefdx84) {
      if (mode == "strip") {
        _0xcefdx84.scrollIntoView();
      } else {
        imageContainers = null;
        showImageSingle(parseInt(visibleTopPage));
      }
    }
  }
});
const getCurrentDivSingle = () => {
  return document.querySelector("div.single:not(.hidden)");
};
const updatePagination = (_0xcefdx70 = null) => {
  if (DefaultMode == "single") {
    if (_0xcefdx70 == null) {
      _0xcefdx70 = getCurrentDivSingle();
    }
    if (_0xcefdx70) {
      const _0xcefdx87 = document.querySelectorAll(".listPages div");
      for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdx87.length; _0xcefdx54++) {
        const _0xcefdx5b = _0xcefdx87[_0xcefdx54];
        _0xcefdx5b.removeAttribute("data-active");
      }
      pagination.textContent = _0xcefdx70.dataset.page + "/" + document.getElementById("container").dataset.nbpage;
      activePageInList = document.querySelector('.listPages div[data-page="' + _0xcefdx70.dataset.page + '"]');
      activePageInList.dataset.active = 1;
      activePageInList.scrollIntoView({block: "center", inline: "center"});
      if (mode == "strip") {
        visibleTopPage = parseInt(_0xcefdx70.dataset.page);
      }
      if (animePagination) {
        animePagination.kill();
      }
      pagination.style.opacity = 1;
      animePagination = gsap.delayedCall(2.5, () => {
        gsap.to(pagination, {duration: 0.5, opacity: 0});
      });
    }
  }
};
const listPages = document.querySelector(".listPages");
let isOpenListPages = false;
let paginationInitStyles;
let imageContainers;
pagination.addEventListener("click", () => {
  if (DefaultMode == "single") {
    if (!isOpenListPages) {
      if (animePagination) {
        animePagination.kill();
      }
      pagination.style.opacity = 1;
      gsap.to(listPages, {onStart: function () {
        listPages.style.display = "flex";
      }, duration: 0.2, width: window.innerWidth <= window.innerHeight ? "" : "100%", height: window.innerWidth > window.innerHeight ? "" : "100%"});
      paginationInitStyles = pagination.style;
      gsap.to(pagination, {duration: 0.5, top: "50%", left: "50%", transform: "translate(-50%, -50%)", borderRadius: "6vh", display: "inline-table", padding: "2vh", fontSize: "6vh"});
      isOpenListPages = true;
    } else {
      removeListPages();
    }
  }
});
let possibleChangeImage;
const showImageSingle = _0xcefdx8e => {
  possibleChangeImage = 0;
  img_lel.style.transform = "scale(1)";
  img_lel.style.transformOrigin = "";
  const _0xcefdx6c = document.querySelector("#container");
  if (!imageContainers || !imageContainers.length) {
    imageContainers = document.querySelectorAll(".image-container");
  }
  if (_0xcefdx6c.querySelector('div[data-page="' + _0xcefdx8e + '"]')) {
    for (let _0xcefdx54 = 0; _0xcefdx54 < imageContainers.length; _0xcefdx54++) {
      const _0xcefdx8f = imageContainers[_0xcefdx54];
      _0xcefdx8f.style.transform = `${"translateX(0)"}`;
      if (_0xcefdx54 + 1 === parseInt(_0xcefdx8e)) {
        _0xcefdx8f.classList.remove("hidden");
        possibleChangeImage = 1;
        removeSettingIco();
        visibleTopPage = _0xcefdx8e;
        setHash("page", _0xcefdx8e);
        document.querySelector(".reader_container").scrollIntoView({behavior: "instant", block: "start"});
        updatePagination();
        if (_0xcefdx8f.classList.contains("last")) {
          if (animePagination) {
            animePagination.kill();
          }
          setTimeout(function () {
            const _0xcefdx90 = document.querySelector("#navigation_bot");
            pagination.style.opacity = 1;
            _0xcefdx90.style.display = "flex";
          }, 100);
        }
      } else {
        if (!_0xcefdx8f.classList.contains("hidden")) {
          _0xcefdx8f.classList.add("hidden");
        }
      }
    }
  }
  if (possibleChangeImage === 0) {
    _0xcefdx6c.style.transform = "";
    const _0xcefdx91 = gsap.to(_0xcefdx6c, {duration: 0.05, x: "+=2", yoyo: true, repeat: 8, ease: "power2.out", onComplete: function () {
      _0xcefdx6c.style.transform = "";
    }});
  }
};
const navHash = () => {
  if (modeHash == "page") {
    showImageSingle(parseInt(modeTarget));
  } else {
    if (modeHash == "scroll") {
      if (movetoY) {
        window.scrollTo({top: movetoY});
        movetoY = null;
      } else {
        if (DefaultMode == "single") {
          const _0xcefdx93 = document.querySelector(`${'[data-page="'}${modeTarget}${'"]'}`);
          if (_0xcefdx93) {
            _0xcefdx93.scrollIntoView();
          }
        } else {
          if (document.querySelector(".image-container.strip")) {
            const _0xcefdx94 = Math.floor(document.querySelector(".image-container.strip").getBoundingClientRect().top + parseInt(modeTarget));
            window.scrollTo({top: _0xcefdx94});
          }
        }
      }
    }
  }
};
const removeListPages = () => {
  listPages.style.height = 0;
  listPages.style.width = 0;
  listPages.style.bottom = null;
  listPages.style.right = null;
  isOpenListPages = false;
  listPages.style.display = "none";
  pagination.style = paginationInitStyles;
  pagination.style.opacity = 1;
};
let noAnimeMenu = 0;
const removeMobileMenuBlockAnimeEnding = menuBlock => {
  menuBlock.classList.remove("sticky");
  menuBlock.style.top = "";
  menuBlock.style.opacity = "1";
  readerView.style.top = "";
  if (!searchBox.classList.contains("active")) {
    smHeader.style.position = "";
  }
  if (btn && btn.classList.contains("active")) {
    document.querySelector(".ham_ico").click();
  }
  if (menuSetting.classList.contains("active")) {
    showMenuSetting(0);
  }
};
const removeMobileMenuBlock = menuBlock => {
  if (noAnimeMenu == 0) {
    gsap.to(menuBlock, {duration: 0.5, opacity: 0, top: 0, onComplete: function () {
      removeMobileMenuBlockAnimeEnding(menuBlock);
    }});
  } else {
    removeMobileMenuBlockAnimeEnding(menuBlock);
  }
  noAnimeMenu = 0;
};
function getImageExtension(_0xcefdx9a) {
  const _0xcefdx9b = _0xcefdx9a.split(".");
  const _0xcefdx9c = _0xcefdx9b[_0xcefdx9b.length - 1].toLowerCase();
  return _0xcefdx9c;
}
function getMimeType(_0xcefdx9c) {
  const _0xcefdx9e = {jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", bmp: "image/bmp", webp: "image/webp"};
  return _0xcefdx9e[_0xcefdx9c.toLowerCase()] || "";
}
const removeSettingIco = () => {
  settingOverlay.dataset.active = "0";
  gsap.to(settingIco, {duration: 0.5, opacity: 0, onComplete: function () {
    settingIco.style.display = "none";
  }});
  pagination.style.opacity = 0;
};
const showSettingIco = () => {
  settingOverlay.dataset.active = "1";
  settingIco.style.left = "-4vh";
  settingIco.style.display = "block";
  settingIco.style.left = "1.5vh";
  settingIco.style.opacity = "1";
  checkIfBotTaken();
};
const handleToTop = _0xcefdxa2 => {
  if (_0xcefdxa2 == null) {
    if (toTop.style.display != "block") {
      toTop.style.opacity = "0";
      toTop.style.right = "-4vh";
      toTop.style.display = "block";
      toTop.style.right = "0";
      toTop.style.opacity = "1";
    } else {
      gsap.to(toTop, {duration: 0.5, opacity: 0, onComplete: function () {
        toTop.style.display = "none";
      }});
    }
  } else {
    if (toTop.style.display != _0xcefdxa2) {
      toTop.style.display = _0xcefdxa2;
    }
  }
};
const alertChapterNotAvailable = _0xcefdxa4 => {
  msgAvertissement = `${"Ce chapitre n'est pas disponible ("}${_0xcefdxa4}${")"}`;
  const _0xcefdx75 = document.createElement("div");
  _0xcefdx75.classList.add("overlay_avertissement");
  const _0xcefdx6c = document.createElement("div");
  _0xcefdx6c.classList.add("overlay_avertissement-container");
  const _0xcefdxa5 = document.createElement("p");
  _0xcefdxa5.innerHTML = msgAvertissement;
  const _0xcefdxa6 = document.createElement("div");
  _0xcefdxa6.classList.add("overlay_avertissement-buttons");
  const _0xcefdxa7 = document.createElement("button");
  _0xcefdxa7.classList.add("oui-avertissement-btn");
  _0xcefdxa7.textContent = "OK";
  _0xcefdxa7.addEventListener("click", () => {
    const _0xcefdxa8 = document.referrer ? new URL(document.referrer).hostname : "";
    const _0xcefdxa9 = window.location.hostname;
    if (_0xcefdxa8 === _0xcefdxa9 && window.history.length > 1) {
      window.history.back();
    } else {
      if (_0xcefdxa8 === _0xcefdxa9) {
        window.location.href = document.referrer;
      } else {
        window.location.href = domainSM;
      }
    }
  });
  _0xcefdxa6.appendChild(_0xcefdxa7);
  _0xcefdx6c.appendChild(_0xcefdxa5);
  _0xcefdx6c.appendChild(_0xcefdxa6);
  _0xcefdx75.appendChild(_0xcefdx6c);
  document.body.insertBefore(_0xcefdx75, document.body.firstChild);
  _0xcefdx75.style.display = "block";
};
const LoadLeL = () => {
  fixHeader = 0;
  const _0xcefdxab = setTimeout(function () {
    container.classList.add("loading-data");
  }, 500);
  if (!sme || !sml || sme == "" || sml == "") {
    alert("Erreur");
  }
  fetch(`${"/api/lel/"}${idc}${".json"}`, {method: "POST", credentials: "omit", headers: {"Content-type": "application/json; charset=UTF-8", source: window.location.href, Token: "sm"}, body: JSON.stringify({a: sme, b: sml})}).then(_0xcefdxde => {
    return _0xcefdxde.text();
  }).then(_0xcefdxad => {
    if (_0xcefdxad == "[]") {
      alertChapterNotAvailable(300);
      return;
    }
    try {
      const _0xcefdxae = JSON.parse(_0xcefdxad);
      if (_0xcefdxae.error) {
        alertChapterNotAvailable(_0xcefdxae.error);
      }
      return;
    } catch (error) {}
    clearTimeout(_0xcefdxab);
    container.classList.remove("loading-data");
    var _0xcefdxaf = JSON.parse(atob(_0xcefdxad.replace(new RegExp(idc.toString(16) + "$"), "").split("").reverse().join("")));
    const _0xcefdxb0 = document.querySelector(".navigation");
    const _0xcefdx90 = document.querySelector("#navigation_bot");
    const _0xcefdxb1 = _0xcefdxb0.querySelector(".arrow.left");
    const _0xcefdxb2 = _0xcefdxb0.querySelector(".arrow.right");
    const _0xcefdxb3 = () => {
      if (_0xcefdxaf.m == null) {
        alertChapterNotAvailable(301);
        return;
      } else {
        if (!isNaN(_0xcefdxaf.m)) {
          fetch(`${"/api/chapter/"}${_0xcefdxaf.m}${".json"}${dd === 1 ? `${"?d=1"}` : ""}${""}`, {method: "GET", credentials: "omit", headers: {"Content-type": "application/json; charset=UTF-8", Token: "sm"}}).then(_0xcefdxde => {
            return _0xcefdxde.json();
          }).then(_0xcefdxb4 => {
            var _0xcefdxb5 = [];
            var _0xcefdxb6 = null;
            let _0xcefdxb7 = false;
            let _0xcefdxb8;
            let _0xcefdxb9;
            let _0xcefdxba;
            let _0xcefdxbb;
            styleDoc.setProperty("--sc-current-color", "var(--sc-" + _0xcefdxb4.g.toLowerCase() + "-color)");
            styleDoc.setProperty("--sh-current-color", "var(--sh-" + _0xcefdxb4.g.toLowerCase() + "-color)");
            const _0xcefdxbc = _0xcefdxbd => {
              if (Chapitre[_0xcefdxbd] && Chapitre[_0xcefdxbd].u) {
                const _0xcefdxbe = domainSM + window.location.pathname.replace(window.location.pathname.split("/").pop(), Chapitre[_0xcefdxbd].u);
                window.location.href = _0xcefdxbe;
              }
            };
            for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdxb4.c.length; _0xcefdx54++) {
              const _0xcefdx5b = _0xcefdxb4.c[_0xcefdx54];
              let _0xcefdxbf = false;
              let _0xcefdxc0 = null;
              let _0xcefdxc1 = true;
              if (_0xcefdx5b.u === 0) {
                _0xcefdxc1 = false;
                _0xcefdxbf = true;
                _0xcefdxc0 = '<div><img src="https://cdn.scanmanga.eu/img/publisher/off_' + (_0xcefdx5b.tc && _0xcefdx5b.tc[0] ? _0xcefdx5b.tc[0] : "") + '.png" width="15" height="15"> ' + _0xcefdx5b.nt + "</div>";
              }
              Chapitre[_0xcefdx5b.i] = Chapitre[_0xcefdx5b.i] || {};
              Chapitre[_0xcefdx5b.i].u = _0xcefdx5b.u;
              Chapitre[_0xcefdx5b.i].n = _0xcefdx5b.n;
              if (_0xcefdx5b.v != null && _0xcefdx5b.v !== _0xcefdxb6) {
                _0xcefdxb6 = _0xcefdx5b.v;
                _0xcefdxb5.push({label: _0xcefdxb6, closable: "open", options: []});
              }
              if (_0xcefdxb7 === true && _0xcefdxc1 == true) {
                _0xcefdxb8 = parseInt(_0xcefdx5b.i);
                _0xcefdxb1.dataset.chapter = _0xcefdxb8;
              }
              if (_0xcefdxc1 == true) {
                _0xcefdxb7 = false;
              }
              if (_0xcefdx5b.i == idc) {
                _0xcefdxb7 = true;
                _0xcefdxb9 = _0xcefdxba;
                _0xcefdxb2.dataset.chapter = _0xcefdxb9;
                _0xcefdxbb = _0xcefdx5b;
              }
              if (_0xcefdxc1 == true) {
                _0xcefdxba = parseInt(_0xcefdx5b.i);
              }
              if (_0xcefdxb6 != null) {
                var _0xcefdxc2 = _0xcefdxb5[_0xcefdxb5.length - 1];
                _0xcefdxc2.options.push({html: _0xcefdxc0, text: _0xcefdx5b.nt, value: _0xcefdx5b.i, selected: _0xcefdxb7, disabled: _0xcefdxbf});
              } else {
                _0xcefdxb5.push({html: _0xcefdxc0, text: _0xcefdx5b.nt, value: _0xcefdx5b.i, selected: _0xcefdxb7, disabled: _0xcefdxbf});
              }
            }
            var _0xcefdxc3 = _0xcefdxb5.filter(function (_0xcefdxc4) {
              return _0xcefdxc4.options != null;
            }).map(function (_0xcefdxc4) {
              return {label: _0xcefdxc4.label, closable: "open", options: _0xcefdxc4.options};
            });
            var _0xcefdxc5 = new SlimSelect({select: select, settings: {hideSelected: false, placeholderText: "Chapitres", searchPlaceholder: "Rechercher", searchText: "Aucun chapitre correspondant", showOptionTooltips: true, searchHighlight: true, closeOnSelect: false, selectOnTab: false}, events: {beforeChange: _0xcefdxc6 => {
              let _0xcefdxc7 = _0xcefdxc6[0].value;
              if (parseInt(_0xcefdxc7) !== parseInt(idc) && Chapitre[_0xcefdxc7].u) {
                _0xcefdxbc(_0xcefdxc7);
              }
            }, beforeOpen: () => {
              if (NotDesktop) {
                document.body.style.overflow = "hidden";
              }
            }, beforeClose: () => {
              if (NotDesktop) {
                document.body.style.overflow = "";
              }
            }}});
            _0xcefdxc5.setData(_0xcefdxb5);
            document.querySelector("div.select_chapter").addEventListener("click", function (_0xcefdx45) {
              var _0xcefdxc8 = document.querySelector(".ss-search input");
              _0xcefdxc8.blur();
            });
            const _0xcefdxb0 = document.querySelector(".navigation");
            const _0xcefdx90 = document.querySelector("#navigation_bot");
            const _0xcefdxc9 = _0xcefdxb1.cloneNode(true);
            const _0xcefdxca = _0xcefdxb2.cloneNode(true);
            if (mode == "single") {
              if (window.innerWidth < 1024 && NotDesktop) {
                showSettingIco();
              }
              _0xcefdx90.style.display = "none";
            }
            _0xcefdx90.appendChild(_0xcefdxc9);
            _0xcefdx90.appendChild(_0xcefdxca);
            const _0xcefdxcb = _0xcefdx90.querySelector("svg.left");
            const _0xcefdxcc = _0xcefdx90.querySelector("svg.right");
            const _0xcefdxcd = document.createElementNS("http://www.w3.org/2000/svg", "text");
            _0xcefdxcd.setAttribute("y", "50%");
            _0xcefdxcd.setAttribute("dominant-baseline", "central");
            _0xcefdxcd.setAttribute("font-size", "0.5em");
            _0xcefdxcd.setAttribute("direction", "rtl");
            _0xcefdxcd.setAttribute("text-anchor", "start");
            const _0xcefdxce = _0xcefdxcd.cloneNode(true);
            _0xcefdxcd.setAttribute("x", "0");
            _0xcefdxce.setAttribute("direction", "ltr");
            _0xcefdxce.setAttribute("x", "100%");
            _0xcefdxcd.textContent = Chapitre[_0xcefdxb0.querySelector(".left").dataset.chapter] ? Chapitre[_0xcefdxb0.querySelector(".left").dataset.chapter].n : "";
            _0xcefdxce.textContent = Chapitre[_0xcefdxb0.querySelector(".right").dataset.chapter] ? Chapitre[_0xcefdxb0.querySelector(".right").dataset.chapter].n : "";
            if (_0xcefdxcb) {
              _0xcefdxcb.appendChild(_0xcefdxcd);
            }
            if (_0xcefdxcc) {
              _0xcefdxcc.appendChild(_0xcefdxce);
            }
            const _0xcefdxcf = () => {
              const _0xcefdxd0 = document.querySelectorAll(".arrow.left, .arrow.right");
              const _0xcefdxd1 = document.querySelector("div.select_chapter");
              const _0xcefdx74 = document.getElementById("lelCSS").sheet;
              _0xcefdx74.insertRule("div.navigation .arrow {height:" + _0xcefdxd1.clientHeight + "px!important} ", _0xcefdx74.cssRules.length);
              for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdxd0.length; _0xcefdx54++) {
                let _0xcefdxd2 = _0xcefdxd0[_0xcefdx54];
                if (_0xcefdxd2.classList.contains("left") && _0xcefdxb8 || _0xcefdxd2.classList.contains("right") && _0xcefdxb9) {
                  _0xcefdxd2.style.visibility = "visible";
                }
                _0xcefdxd2.addEventListener("click", _0xcefdx45 => {
                  _0xcefdx45.target.style.opacity = ".3";
                  if (!isNaN(_0xcefdxb8) && _0xcefdx45.target.classList.contains("left") || _0xcefdx45.target.closest("svg").classList.contains("left")) {
                    _0xcefdxbc(_0xcefdxb8);
                  } else {
                    if (!isNaN(_0xcefdxb9) && _0xcefdx45.target.classList.contains("right") || _0xcefdx45.target.closest("svg").classList.contains("right")) {
                      _0xcefdxbc(_0xcefdxb9);
                    }
                  }
                });
              }
            };
            _0xcefdxcf();
            const _0xcefdxd3 = () => {
              let _0xcefdxd4 = "";
              let _0xcefdxd5 = 0;
              document.addEventListener("keydown", _0xcefdx45 => {
                const _0xcefdxd7 = (new Date).getTime();
                if (_0xcefdx45.repeat) {
                  return;
                }
                if (_0xcefdx45.key === _0xcefdxd4 && _0xcefdxd7 - _0xcefdxd5 < 200) {
                  if (!isNaN(_0xcefdxb9) && _0xcefdx45.key === "ArrowRight" && estVisible(document.querySelector(".image-container." + mode + ".last"))) {
                    _0xcefdxbc(_0xcefdxb9);
                  } else {
                    if (!isNaN(_0xcefdxb8) && _0xcefdx45.key === "ArrowLeft" && estVisible(document.querySelector(".image-container." + mode + ".first"))) {
                      _0xcefdxbc(_0xcefdxb8);
                    }
                  }
                }
                _0xcefdxd4 = _0xcefdx45.key;
                _0xcefdxd5 = _0xcefdxd7;
              });
            };
            _0xcefdxd3();
            let _0xcefdxd8 = 0;
            let _0xcefdxd9 = [];
            for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdxbb.tc.length; _0xcefdx54++) {
              const _0xcefdxda = _0xcefdxbb.tc[_0xcefdx54];
              if (_0xcefdxb4.hasOwnProperty("t")) {
                if (_0xcefdxb4.t[_0xcefdxda]) {
                  _0xcefdxd8++;
                  let _0xcefdxdb = document.createElement("a");
                  _0xcefdxdb.href = domainSM + _0xcefdxb4.t[_0xcefdxda].u;
                  _0xcefdxdb.innerHTML = _0xcefdxb4.t[_0xcefdxda].n;
                  _0xcefdxd9.push(_0xcefdxdb);
                } else {
                  if (_0xcefdxda == "0") {
                    const _0xcefdxdc = Object.keys(_0xcefdxb4.t);
                    for (let _0xcefdx6d = 0; _0xcefdx6d < _0xcefdxdc.length; _0xcefdx6d++) {
                      const _0xcefdxdd = _0xcefdxdc[_0xcefdx6d];
                      const _0xcefdxda = _0xcefdxb4.t[_0xcefdxdd];
                      _0xcefdxd8++;
                      let _0xcefdxdb = document.createElement("a");
                      _0xcefdxdb.href = domainSM + _0xcefdxda.u;
                      _0xcefdxdb.innerHTML = _0xcefdxda.n;
                      _0xcefdxd9.push(_0xcefdxdb);
                    }
                  }
                }
              }
            }
            if (_0xcefdxd8 >= 1) {
              teams.querySelector("h3").textContent = "Team" + (_0xcefdxd8 > 1 ? "s" : "");
              for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdxd9.length; _0xcefdx54++) {
                teams.appendChild(_0xcefdxd9[_0xcefdx54]);
              }
            }
          });
        }
      }
    };
    _0xcefdxb3();
    const _0xcefdxdf = _0xcefdxaf => {
      const menuBlock = document.querySelector("div.lel_menu_chapitre:not(.navigation_bot)");
      window.addEventListener("popstate", function (_0xcefdx45) {
        if (_0xcefdx45.state != null) {
          modeHash = _0xcefdx45.state.type;
          modeTarget = _0xcefdx45.state.anchor;
        }
        navHash();
      });
      toTop.addEventListener("click", _0xcefdx5 => {
        _0xcefdx5.preventDefault();
        _0xcefdx5.stopPropagation();
        noAnimeMenu = 1;
        gsap.killTweensOf(window);
        gsap.to(window, {duration: 0, scrollTo: {y: "0"}, onComplete: function () {
          toTop.style.display = "none";
        }});
      });
      const _0xcefdx6c = document.querySelector("#container");
      const _0xcefdxe0 = _0xcefdx45 => {
        _0xcefdx45.preventDefault();
        _0xcefdx45.stopPropagation();
        const _0xcefdxe1 = _0xcefdx45.target.closest(".strip");
        if (_0xcefdxe1 && NotDesktop && window.innerWidth < 1024) {
          const menuBlock = document.querySelector("div.lel_menu_chapitre:not(.navigation_bot)");
          const _0xcefdxe2 = document.querySelector(".image-container.first");
          const _0xcefdxe3 = _0xcefdxe2.getBoundingClientRect();
          if (_0xcefdxe3.top < 0) {
            const _0xcefdxe4 = menuBlock.offsetHeight;
            if (!menuBlock.classList.contains("sticky")) {
              menuBlock.classList.add("sticky");
              menuBlock.style.opacity = "1";
              let _0xcefdxe5 = "0px";
              if (bottomReach == 1) {
                smHeader.style.position = "fixed";
                _0xcefdxe5 = "3rem";
                menuBlock.style.top = "calc(" - _0xcefdxe4 + "px + 3rem)";
              } else {
                smHeader.style.position = "relative";
                menuBlock.style.top = -_0xcefdxe4 + "px";
              }
              gsap.to(menuBlock, {duration: 0.3, ease: "power2.out", top: _0xcefdxe5});
            } else {
              removeMobileMenuBlock(menuBlock);
            }
          }
        }
        if (window.innerWidth < 1024) {
          if (settingIco.style.display == "block") {
            removeSettingIco();
          } else {
            if (NotDesktop) {
              showSettingIco();
              if (DefaultMode == "single") {
                if (animePagination) {
                  animePagination.kill();
                }
                pagination.style.right = "-10vw";
                pagination.style.opacity = "1";
                pagination.style.right = "0";
              }
            }
          }
          if (mode == "strip") {
            handleToTop();
          }
        }
      };
      const _0xcefdxe6 = _0xcefdx45 => {
        _0xcefdx45.preventDefault();
        if (mode == "strip") {
          gsap.to(window, {duration: 0.7, scrollTo: {y: "+=700", autoKill: false}, ease: "easeOutCubic"});
        } else {
          if (mode == "single") {
            const _0xcefdxe7 = getCurrentDivSingle();
            if (_0xcefdxe7) {
              const _0xcefdx93 = parseInt(_0xcefdxe7.dataset.page);
              const _0xcefdxe8 = _0xcefdx45.target.classList.contains("right-cursor");
              const _0xcefdxe9 = _0xcefdx45.target.classList.contains("left-cursor");
              if (_0xcefdxe8 || _0xcefdxe9) {
                const _0xcefdxea = _0xcefdxe8 ? _0xcefdx93 + 1 : _0xcefdx93 - 1;
                if (_0xcefdxea !== _0xcefdx93) {
                  showImageSingle(_0xcefdxea);
                }
              }
            }
          }
        }
      };
      const _0xcefdxeb = _0xcefdx45 => {
        const _0xcefdx93 = _0xcefdx45.target.dataset.page;
        if (mode == "single") {
          showImageSingle(_0xcefdx93);
        } else {
          if (mode == "strip") {
            const _0xcefdxec = document.querySelector('.image-container[data-page="' + _0xcefdx93 + '"]');
            if (_0xcefdxec) {
              _0xcefdxec.scrollIntoView();
            }
          }
        }
      };
      const _0xcefdxed = _.throttle(_0xcefdxe0, 1e3);
      _0xcefdx6c.addEventListener("click", _0xcefdxed);
      document.querySelector(".reader_click_nav .center").addEventListener("click", _0xcefdxed);
      const _0xcefdxee = () => {
        if (mode == "single") {
          const _0xcefdxef = document.querySelectorAll(".reader_click_nav div");
          for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdxef.length; _0xcefdx54++) {
            let _0xcefdxf0 = _0xcefdxef[_0xcefdx54];
            let _0xcefdxf1 = new Hammer(_0xcefdxf0);
            _0xcefdxf1.on("doubletap press", function (_0xcefdxf2) {
              setTimeout(function () {
                if (possibleChangeImage === 0) {
                  if (_0xcefdxf2.target.classList.contains("left-cursor")) {
                    document.querySelector(".arrow.left").dispatchEvent(new Event("click"));
                  } else {
                    if (_0xcefdxf2.target.classList.contains("right-cursor")) {
                      document.querySelector(".arrow.right").dispatchEvent(new Event("click"));
                    }
                  }
                }
              }, 150);
            });
          }
        }
      };
      _0xcefdxee();
      const _0xcefdxf3 = () => {
        const _0xcefdxf4 = document.querySelector("div.reader_click_nav");
        let _0xcefdxf5 = false;
        let _0xcefdxf6;
        window.addEventListener("mousemove", _0xcefdx45 => {
          if (_0xcefdxf5 && mode == "strip") {
            window.scrollTo(window.scrollX, window.scrollY + (_0xcefdxf6 - _0xcefdx45.pageY));
          }
        });
        _0xcefdxf4.addEventListener("mousedown", _0xcefdx45 => {
          if (_0xcefdx45.which === 3 && mode == "strip") {
            _0xcefdxf4.classList.add("grabbing");
            _0xcefdxf5 = true;
            _0xcefdxf6 = _0xcefdx45.pageY;
          }
        });
        _0xcefdxf4.addEventListener("mouseup", _0xcefdx45 => {
          if (_0xcefdx45.which === 3 && mode == "strip") {
            _0xcefdxf4.classList.remove("grabbing");
            _0xcefdxf5 = false;
          }
        });
        _0xcefdxf4.addEventListener("contextmenu", _0xcefdx45 => {
          _0xcefdx45.preventDefault();
        });
      };
      _0xcefdxf3();
      listPages.addEventListener("click", _0xcefdxeb);
      readerClickNav.addEventListener("click", _0xcefdxe6);
      const _0xcefdxf7 = new Hammer(readerClickNav);
      _0xcefdxf7.on("press", _0xcefdxe6);
      const _0xcefdxf8 = _0xcefdx45 => {
        if (_0xcefdx45.key === "ArrowRight" || _0xcefdx45.key === "ArrowLeft") {
          const _0xcefdxe7 = getCurrentDivSingle();
          if (_0xcefdxe7) {
            const _0xcefdx93 = _0xcefdxf9(_0xcefdx45.key, _0xcefdxe7.dataset.page);
            showImageSingle(_0xcefdx93);
          }
        }
      };
      document.addEventListener("keyup", _0xcefdxf8);
      const _0xcefdxf9 = (_0xcefdxdd, _0xcefdxfa) => {
        let _0xcefdxfb = parseInt(_0xcefdxfa);
        switch (_0xcefdxdd) {
          case "ArrowRight":
            _0xcefdxfb += 1;
            break;
          case "ArrowLeft":
            _0xcefdxfb -= 1;
            break;
          default:
            break;
        }
        return _0xcefdxfb;
      };
      const _0xcefdxfc = _0xcefdx45 => {
        onUserInteraction();
        const _0xcefdxe7 = getCurrentDivSingle();
        if (_0xcefdxe7) {
          let _0xcefdx93 = parseInt(_0xcefdxe7.dataset.page);
          if (_0xcefdx45.type === "swiperight") {
            _0xcefdx93 -= 1;
          } else {
            if (_0xcefdx45.type === "swipeleft") {
              _0xcefdx93 += 1;
            }
          }
          showImageSingle(_0xcefdx93);
        }
      };
      const _0xcefdxfd = _0xcefdx5 => {
        if (window.visualViewport.scale > 1) {
          readerClickNav.classList.add("zoom");
        } else {
          readerClickNav.classList.remove("zoom");
        }
      };
      window.visualViewport.addEventListener("resize", _0xcefdxfd);
      var _0xcefdxfe = new Hammer(readerClickNav);
      _0xcefdxfe.on("swipeleft swiperight", _0xcefdxfc);
    };
    _0xcefdxdf(_0xcefdxaf);
    processResponseData(_0xcefdxaf);
  }).catch(function (_0xcefdxac) {
    console.log("Erreur chargement json : ", _0xcefdxac);
  });
};
const processResponseData = async _0xcefdxaf => {
  if (!_0xcefdxaf.hasOwnProperty("p")) {
    return false;
  }
  const _0xcefdx100 = Object.keys(_0xcefdxaf.p).length;
  loadAlert = _0xcefdxaf.l;
  let _0xcefdx101 = 0;
  await setQuality();
  if (toggleQuality.dataset.active == "0") {
    _0xcefdx101 = 1;
  }
  let _0xcefdx102 = _0xcefdxaf.dN;
  if (_0xcefdx101 == 1) {
    _0xcefdx102 = _0xcefdxaf.dC;
  }
  let _0xcefdx103 = `${"/"}${_0xcefdxaf.s}${"/"}${_0xcefdxaf.v}${"/"}${_0xcefdxaf.c}${""}`;
  var _0xcefdx104 = `${"https://"}${_0xcefdx102}${""}${_0xcefdx103}${""}`;
  var _0xcefdx105 = Object.keys(_0xcefdxaf.p).map(_0xcefdxdd => {
    const _0xcefdx106 = _0xcefdxaf.p[_0xcefdxdd];
    var _0xcefdx107 = _0xcefdx104;
    var _0xcefdx108 = _0xcefdx106.e;
    if (_0xcefdx101 == 1) {
      _0xcefdx108 = "jpg";
      _0xcefdx107 += "/mobile";
    }
    const _0xcefdx109 = `${"/"}${encodeURIComponent(_0xcefdx106.f)}${"."}${_0xcefdx108}${""}`;
    _0xcefdx107 += _0xcefdx109;
    return _0xcefdx107;
  });
  const _0xcefdx10a = async (_0xcefdx9a, _0xcefdx6c, _0xcefdx10b) => {
    if (_0xcefdx6c.dataset.loaded === "1") {
      return _0xcefdx6c.querySelector("img");
    }
    _0xcefdx6c.dataset.loaded = "";
    const _0xcefdx10c = setTimeout(function () {
      _0xcefdx6c.classList.add("image-container-loading");
    }, 1e3);
    const _0xcefdx10d = _0xcefdx6c.dataset.page;
    try {
      const _0xcefdx10e = new URL(_0xcefdx9a);
      const _0xcefdx10f = `${""}${_0xcefdx10e.pathname}${""}`;
      const _0xcefdxde = await fetch(_0xcefdx9a, {mode: "cors", referrerPolicy: "unsafe-url", credentials: "omit", headers: {Accept: "*/*", "Sec-Fetch-Site": "cross-site"}, cf: {cacheEverything: true, cacheKey: CryptoJS.SHA256(_0xcefdx10f).toString()}});
      const _0xcefdx110 = _0xcefdxde.headers.get("content-length");
      let _0xcefdx111 = 0;
      const _0xcefdx112 = _0xcefdxde.body.getReader();
      const _0xcefdx113 = new ReadableStream({start: async function (_0xcefdx114) {
        async function _0xcefdx115() {
          const {done, value} = await _0xcefdx112.read();
          if (done) {
            _0xcefdx114.close();
            return;
          }
          _0xcefdx111 += value.length;
          const _0xcefdx116 = Math.round(_0xcefdx111 / _0xcefdx110 * 100 / 5) * 5;
          const _0xcefdx117 = Math.round(_0xcefdx111 / _0xcefdx110 * 100);
          _0xcefdx6c.style.setProperty("--before-width", `${""}${_0xcefdx116}${"%"}`);
          _0xcefdx6c.style.setProperty("--before-content", `${"'"}${_0xcefdx10d}${"/"}${_0xcefdx100}${" • "}${_0xcefdx117}${"%'"}`);
          _0xcefdx114.enqueue(value);
          await _0xcefdx115();
        }
        await _0xcefdx115();
      }});
      const _0xcefdx118 = getMimeType(getImageExtension(_0xcefdx9a));
      const _0xcefdx119 = new Response(_0xcefdx113, {headers: {"Content-Type": _0xcefdx118}});
      const _0xcefdx11a = await _0xcefdx119.blob();
      const _0xcefdx11b = new Image;
      _0xcefdx11b.setAttribute("oncontextmenu", "return false;");
      const _0xcefdx11c = () => {
        _0xcefdx11b.src = "https://cdn.scanmanga.eu/img/pictos/image-not-found-icon.svg";
        _0xcefdx11b.style.transform = "scale(0.2)";
        _0xcefdx11b.style.transformOrigin = "top center";
      };
      if (_0xcefdxde.status === 404) {
        _0xcefdx11c();
      } else {
        await new Promise((_0xcefdx6a, _0xcefdx11d) => {
          _0xcefdx11b.onload = _0xcefdx6a;
          _0xcefdx11b.onerror = () => {
            return _0xcefdx11d(new Error(`${"Failed to load image"}`));
          };
          _0xcefdx11b.src = URL.createObjectURL(_0xcefdx11a);
        });
      }
      _0xcefdx6c.style.removeProperty("--before-width");
      _0xcefdx6c.style.removeProperty("--before-content");
      _0xcefdx6c.style.removeProperty("--after-content");
      clearTimeout(_0xcefdx10c);
      _0xcefdx6c.classList.remove("image-container-loading");
      _0xcefdx6c.style.height = "fit-content";
      _0xcefdx6c.appendChild(_0xcefdx11b);
      _0xcefdx6c.dataset.loaded = "1";
      URL.revokeObjectURL(_0xcefdx11b.src);
      if (!showHelpDirection) {
        helpDirectionAnime();
      }
      return _0xcefdx11b;
    } catch (error) {
      clearTimeout(_0xcefdx10c);
      _0xcefdx6c.classList.remove("image-container-loading");
      if (!_0xcefdx6c.classList.contains("image-container-error")) {
        _0xcefdx6c.classList.add("image-container-error");
        const _0xcefdx11e = document.createElement("div");
        _0xcefdx11e.style.setProperty("--after-page", `${"'Erreur chargement page #"}${_0xcefdx10d}${"'"}`);
        _0xcefdx6c.appendChild(_0xcefdx11e);
        const _0xcefdx11f = () => {
          _0xcefdx6c.removeChild(_0xcefdx11e);
          _0xcefdx6c.classList.remove("image-container-error");
          _0xcefdx6c.dataset.loaded = "";
          _0xcefdx10a(_0xcefdx9a + "?" + Math.floor(Math.random() * 10001), _0xcefdx6c, true);
          _0xcefdx11e.removeEventListener("click", _0xcefdx11f);
        };
        _0xcefdx11e.addEventListener("click", _0xcefdx11f);
      }
    }
  };
  const _0xcefdx120 = (_0xcefdx121, _0xcefdxdd, _0xcefdx122) => {
    let _0xcefdx123 = 0;
    let _0xcefdx124 = 0;
    for (let _0xcefdx54 = _0xcefdx121 + 1; _0xcefdx54 < _0xcefdx122 && _0xcefdxaf.p[_0xcefdx54] && _0xcefdxaf.p[_0xcefdx54][_0xcefdxdd]; _0xcefdx54++) {
      _0xcefdx123 += parseInt(_0xcefdxaf.p[_0xcefdx54][_0xcefdxdd]);
      _0xcefdx124++;
      if (_0xcefdx123 >= _0xcefdx122) {
        return _0xcefdx124;
      }
    }
    return _0xcefdx124;
  };
  const _0xcefdx125 = () => {
    const _0xcefdx126 = new IntersectionObserver(async _0xcefdx127 => {
      for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdx127.length; _0xcefdx54++) {
        const _0xcefdx128 = _0xcefdx127[_0xcefdx54];
        const _0xcefdx6c = _0xcefdx128.target;
        const _0xcefdx8e = parseInt(_0xcefdx6c.dataset.page);
        const _0xcefdx9a = _0xcefdx105[_0xcefdx8e - 1];
        if (_0xcefdx128.isIntersecting) {
          if (_0xcefdx6c.dataset.loaded !== "1") {
            if (!_0xcefdx6c.hasAttribute("data-loaded")) {
              _0xcefdx10a(_0xcefdx9a, _0xcefdx6c, true);
            }
          }
          _0xcefdx126.unobserve(_0xcefdx6c);
          const _0xcefdx129 = _0xcefdx120(_0xcefdx8e, "h", minHeightToLoadAfterVisible);
          const _0xcefdx12a = _0xcefdx120(_0xcefdx8e, "s", minSizeToLoadAfterVisible * 1024 * 1024);
          let _0xcefdx12b = Math.max(_0xcefdx129, _0xcefdx12a, minImgToLoadAfterVisible);
          if (user_interaction === false) {
            _0xcefdx12b = 1;
          }
          for (let _0xcefdx6d = 1; _0xcefdx6d <= _0xcefdx12b && _0xcefdx6d <= _0xcefdx105.length - _0xcefdx8e; _0xcefdx6d++) {
            let _0xcefdx12c = _0xcefdx8e + _0xcefdx6d;
            let _0xcefdx12d = document.querySelector(`${'[data-page="'}${_0xcefdx12c}${'"]'}`);
            if (_0xcefdx12d.dataset.loaded !== "1" && !_0xcefdx12d.hasAttribute("data-loaded")) {
              await _0xcefdx10a(_0xcefdx105[_0xcefdx12c - 1], _0xcefdx12d, false);
            }
          }
        }
      }
    });
    const _0xcefdx6b = document.querySelectorAll(".image-container");
    for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdx6b.length; _0xcefdx54++) {
      _0xcefdx126.observe(_0xcefdx6b[_0xcefdx54]);
    }
  };
  const _0xcefdx12e = (_0xcefdx121 = 0) => {
    const _0xcefdx6c = document.getElementById("container");
    let _0xcefdx12f = window.innerWidth;
    return new Promise((_0xcefdx6a, _0xcefdx11d) => {
      for (let _0xcefdx54 = 0; _0xcefdx54 < Object.entries(_0xcefdxaf.p).length; _0xcefdx54++) {
        const [key, infos_image] = Object.entries(_0xcefdxaf.p)[_0xcefdx54];
        const _0xcefdx70 = document.createElement("div");
        _0xcefdx70.className = `${"image-container "}${mode}${" Default"}${DefaultMode}${""}`;
        if (!NotDesktop || window.innerWidth >= 1024) {
          _0xcefdx70.classList.add("maxWidthEl");
        }
        if (_0xcefdx54 !== _0xcefdx121 && mode == "single") {
          _0xcefdx70.classList.add("hidden");
        }
        if (_0xcefdx54 === 0) {
          _0xcefdx70.classList.add("first");
        } else {
          if (_0xcefdx54 + 1 == Object.keys(_0xcefdxaf.p).length) {
            _0xcefdx70.classList.add("last");
          }
        }
        const _0xcefdx130 = parseInt(infos_image.h) / parseInt(infos_image.w);
        const _0xcefdx131 = Math.round(_0xcefdx130 * _0xcefdx12f);
        _0xcefdx70.style.height = `${""}${_0xcefdx131}${"px"}`;
        _0xcefdx70.dataset.page = key;
        _0xcefdx70.dataset.height = infos_image.h;
        _0xcefdx70.dataset.width = infos_image.w;
        _0xcefdx6c.appendChild(_0xcefdx70);
        if (DefaultMode == "single") {
          const _0xcefdx132 = document.createElement("div");
          _0xcefdx132.dataset.page = key;
          _0xcefdx132.innerText = key;
          listPages.appendChild(_0xcefdx132);
        }
        if (_0xcefdx54 + 1 === Object.keys(_0xcefdxaf.p).length) {
          _0xcefdx6c.dataset.nbpage = _0xcefdx54 + 1;
          _0xcefdx6a();
        }
      }
    });
  };
  _0xcefdx12e().then(() => {
    navHash();
    _0xcefdx125();
  });
  const _0xcefdx133 = () => {
    const _0xcefdx126 = new MutationObserver((_0xcefdx134, _0xcefdx126) => {
      const imageContainers = document.querySelectorAll(".image-container");
      for (const _0xcefdx5b of imageContainers) {
        if (_0xcefdx5b.offsetParent !== null) {
          _0xcefdx126.disconnect();
          break;
        }
      }
    });
    let _0xcefdx135 = document.querySelector(".image-container.strip.last");
    const _0xcefdx136 = () => {
      if (!_0xcefdx135) {
        _0xcefdx135 = document.querySelector(".image-container.strip.last");
      }
      if (_0xcefdx135) {
        var _0xcefdx137 = _0xcefdx135.getBoundingClientRect();
        var _0xcefdx138 = _0xcefdx137.bottom - 300 <= window.innerHeight && _0xcefdx137.bottom >= 0;
      }
      if (_0xcefdx138) {
        return _0xcefdx135.dataset.page;
      } else {
        for (let _0xcefdx54 = imagesStrip.length - 1; _0xcefdx54 >= 0; _0xcefdx54--) {
          const _0xcefdx5b = imagesStrip[_0xcefdx54];
          const _0xcefdx139 = _0xcefdx5b.getBoundingClientRect();
          if (_0xcefdx139.y <= 300) {
            return _0xcefdx5b.dataset.page;
          }
        }
      }
      return 1;
    };
    const imageContainers = document.querySelectorAll(".image-container");
    for (const _0xcefdx5b of imageContainers) {
      _0xcefdx5b.addEventListener("click", () => {
        _0xcefdx126.observe(document.body, {attributes: true, subtree: true});
      });
    }
    _0xcefdx126.observe(document.body, {attributes: true, subtree: true});
    imagesStrip = document.querySelectorAll(".image-container.strip");
    let _0xcefdx13a = imagesStrip[imagesStrip.length - 1];
    let _0xcefdx13b;
    let _0xcefdx13c;
    menuBlock = document.querySelector("div.lel_menu_chapitre:not(.navigation_bot)");
    const _0xcefdx90 = document.getElementById("navigation_bot");
    let _0xcefdx13d = document.querySelector(".image-container.strip");
    
    handleScrollGlobal = _0xcefdx45 => {
      if (img_lel.dataset.mode == "strip" && imagesStrip.length === 0) {
        imagesStrip = document.querySelectorAll(".image-container.strip");
        _0xcefdx13d = document.querySelector(".image-container.strip");
        _0xcefdx13a = imagesStrip[imagesStrip.length - 1];
      }
      if (img_lel.dataset.mode == "strip" && imagesStrip) {
        bottomReach = 0;
        if (window.pageYOffset > 3e3) {
          if (estVisible(_0xcefdx90)) {
            bottomReach = 1;
          }
        }
        if (!_0xcefdx13d) {
          _0xcefdx13d = document.querySelector(".image-container.strip");
        }
        var _0xcefdx13e = _0xcefdx13d.pageYOffset || document.documentElement.scrollTop;
        if (DefaultMode === "strip") {
          const _0xcefdx13f = Math.floor(_0xcefdx13e / 1500) * 1500;
          if (_0xcefdx13f !== _0xcefdx13b) {
            setHash("scroll", _0xcefdx13f);
          }
          _0xcefdx13b = _0xcefdx13f;
        } else {
          var _0xcefdx140 = _0xcefdx136(_0xcefdx13e);
          if (_0xcefdx140 !== _0xcefdx13c) {
            _0xcefdx13c = _0xcefdx140;
            if (_0xcefdx140 >= 1) {
              setHash("scroll", _0xcefdx140);
            }
            const _0xcefdx141 = document.querySelector('.listPages div[data-page="' + _0xcefdx140 + '"]');
            updatePagination(_0xcefdx141);
          }
          _0xcefdx13c = _0xcefdx140;
        }
      }
    };
    const _0xcefdx142 = _.throttle(handleScrollGlobal, 500);
    window.addEventListener("scroll", _0xcefdx142, {passive: true});
    window.addEventListener("keydown", () => {
      _0xcefdx126.observe(document.body, {attributes: true, subtree: true});
    });
  };
  const _0xcefdx143 = _0xcefdx5 => {
    _0xcefdx5.preventDefault();
    _0xcefdx5.stopPropagation();
    movetoY = window.scrollY;
    const _0xcefdx144 = () => {
      if (loadAlert == "0") {
        window.removeEventListener("scroll", handleScrollGlobal);
        toggleQuality.removeEventListener("click", _0xcefdx143);
        toggleQuality.dataset.active = toggleQuality.dataset.active === "1" ? "0" : "1";
        recLelParametre("quality", toggleQuality.dataset.active);
        container.textContent = "";
        imageContainers = null;
        processResponseData(_0xcefdxaf);
      } else {
        toggleQuality.dataset.active = "0";
      }
    };
    if (!toggleQuality.classList.contains("unavailable")) {
      _0xcefdx144();
    }
  };
  _0xcefdx133();
  updatePagination();
  toggleQuality.addEventListener("click", _0xcefdx143);
};
const changeMaxWidthElement = _0xcefdx5b => {
  _0xcefdx5b.classList.toggle("maxWidthEl", !NotDesktop || window.innerWidth >= 1024);
};
window.addEventListener("orientationchange", () => {
  if (!_0xcefdx146) {
    var _0xcefdx146 = document.querySelectorAll(".image-container");
  }
  for (let _0xcefdx54 = 0; _0xcefdx54 < _0xcefdx146.length; _0xcefdx54++) {
    changeMaxWidthElement(_0xcefdx146[_0xcefdx54]);
  }
  removeListPages();
});
if (!NotDesktop && window.innerWidth >= 1024) {
  document.querySelector(".resizable").style.visibility = "visible";
}
const avertissement_msg = async () => {
  const _0xcefdx148 = JSON.parse(localStorage.getItem("avertissement")) || {};
  if (avertissement >= 1 && !_0xcefdx148.hasOwnProperty(idm)) {
    let _0xcefdx149;
    if (avertissement == 2) {
      _0xcefdx149 = "Cette oeuvre contient des scènes à caractère sexuel et s'adresse à un public averti, déconseillée au moins de 16 ans";
    } else {
      if (avertissement == 1) {
        _0xcefdx149 = "Cette oeuvre est réservé à un public averti.<br>Il peut en effet contenir :<br><br><div style='text-align:left'>- des scènes de violence (sang, gore, etc)\r<br>- des scènes à caractère sexuel (sous forme d'humour ou bien de manière plus explicite)<br>- un langage vulgaire (grossier, insultes, etc.)</div><br>Nous vous invitons à lire les descriptions des différents genres attribués à cette oeuvre pour plus d'informations.";
      }
    }
    const _0xcefdx14a = document.createElement("div");
    _0xcefdx14a.classList.add("overlay_avertissement");
    const _0xcefdx14b = document.createElement("div");
    _0xcefdx14b.classList.add("overlay_avertissement-container");
    const _0xcefdx14c = document.createElement("p");
    _0xcefdx14c.innerHTML = _0xcefdx149;
    const _0xcefdx14d = document.createElement("div");
    _0xcefdx14d.classList.add("overlay_avertissement-buttons");
    const _0xcefdx14e = document.createElement("button");
    _0xcefdx14e.classList.add("oui-avertissement-btn");
    _0xcefdx14e.textContent = "OK";
    const _0xcefdx14f = document.createElement("button");
    _0xcefdx14f.classList.add("non-avertissement-btn");
    _0xcefdx14f.textContent = "Annuler";
    _0xcefdx14d.appendChild(_0xcefdx14e);
    _0xcefdx14d.appendChild(_0xcefdx14f);
    _0xcefdx14b.appendChild(_0xcefdx14c);
    _0xcefdx14b.appendChild(_0xcefdx14d);
    _0xcefdx14a.appendChild(_0xcefdx14b);
    document.body.insertBefore(_0xcefdx14a, document.body.firstChild);
    _0xcefdx14a.style.display = "block";
    let _0xcefdx150 = setTimeout(function () {
      window.location.href = document.querySelector(".lelHgSerie a").getAttribute("href");
    }, 25e3);
    return new Promise(_0xcefdx6a => {
      _0xcefdx14e.addEventListener("click", () => {
        clearTimeout(_0xcefdx150);
        _0xcefdx14a.style.display = "none";
        _0xcefdx14a.remove();
        _0xcefdx6a(true);
      });
      _0xcefdx14f.addEventListener("click", () => {
        _0xcefdx14a.style.display = "none";
        _0xcefdx14a.remove();
        _0xcefdx6a(false);
      });
    });
  } else {
    return Promise.resolve(true);
  }
};
const preLoadLeL = async () => {
  const _0xcefdx152 = await avertissement_msg();
  if (_0xcefdx152) {
    LoadLeL();
    if (avertissement >= 1) {
      const _0xcefdx148 = JSON.parse(localStorage.getItem("avertissement")) || {};
      _0xcefdx148[idm] = "";
      localStorage.setItem("avertissement", JSON.stringify(_0xcefdx148));
    }
  } else {
    const _0xcefdxa8 = document.referrer ? new URL(document.referrer).hostname : "";
    const _0xcefdxa9 = window.location.hostname;
    if (_0xcefdxa8 === _0xcefdxa9 && window.history.length > 1) {
      window.history.back();
    } else {
      if (_0xcefdxa8 === _0xcefdxa9) {
        window.location.href = document.referrer;
      } else {
        window.location.href = domainSM;
      }
    }
  }
};
preLoadLeL();
