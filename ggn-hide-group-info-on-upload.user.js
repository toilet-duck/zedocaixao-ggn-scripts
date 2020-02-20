// ==UserScript==
// @name         GGn hide group info on upload
// @version      0.1
// @description  makes uploading more minimalistic
// @author       ZeDoCaixao
// @match        https://gazellegames.net/upload.php?groupid=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    document.getElementById("groupinfo").style.display = 'none';
})();
