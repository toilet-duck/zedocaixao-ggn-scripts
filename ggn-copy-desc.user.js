// ==UserScript==
// @name         GGn Copy Desc
// @version      0.5
// @match        https://gazellegames.net/torrents.php?id=*
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';
    document.querySelectorAll("a[title=Permalink]").forEach(function (el) {
        var torrent_id = el.href.replace(/.*torrentid=/, '');
        var newA = document.createElement("a");
        newA.innerHTML = "CP";
        newA.setAttribute('title', 'copyDescriptionContent');
        newA.onclick = function () {
            GM_setClipboard("Not copied yet");
            fetch("https://gazellegames.net/torrents.php?action=edit&id="+torrent_id)
                .then(response => response.text()).then(
                text => {
                    const parser = new DOMParser();
                    const htmlDocument = parser.parseFromString(text, "text/html");
                    var qel = htmlDocument.documentElement.querySelector('#release_desc');
                    GM_setClipboard(qel.value);
                });
        }
        var newB = document.createElement("span");
        newB.innerHTML = " | ";
        el.parentNode.insertBefore(newA, el.nextSibling);
        el.parentNode.insertBefore(newB, el.nextSibling);
    });
})();
