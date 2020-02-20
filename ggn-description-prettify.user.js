// ==UserScript==
// @name         GGn Description prettify
// @namespace    http://tampermonkey.net/
// @version      0.5.1
// @description  Helper functions for description formatting
// @author       ZeDoCaixao
// @include      https://gazellegames.net/torrents.php?action=editgroup*
// @require      https://code.jquery.com/jquery-3.1.0.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlhttpRequest
// ==/UserScript==
/* globals jQuery, $ */

function addButton(id, title, callback) {
    id = "prettify_"+id;
    $('textarea[name="body"]')
        .after('<input type="button" id="'+id+'" value="'+title+'"/>');
    $('#'+id).click(callback);
}

(function() {
    'use strict';
    addButton("removejunk", "Remove Junk", remove_junk);
    addButton("fixfeatures", "Fix Features", fix_features);
    addButton("fixabout", "Fix About", fix_about);
    addButton("fixreqs", "Fix SR", fix_reqs);
    addButton("addabout", "Add About", add_about);
    addButton("makeitgood_1", "MAKE IT GOOD!", makeitgood);
})();

function makeitgood() {
    remove_junk();
    fix_features();
    fix_about();
    fix_reqs();
    add_about();
}

function add_about() {
    'use strict';
    var el = $('textarea[name="body"]');
    var about = "[align=center][b][u]About the game[/u][/b][/align]";
    if (el.val().indexOf(about) == -1) {
        el.val(about + "\n" + el.val());
    }
}

function remove_junk() {
    'use strict';
    var el = $('textarea[name="body"]');
    var res = el.val()
        .replace(/™/g, "")
        .replace(/©/g, "")
        .replace(/®/g, "");
    el.val(res);
}

function get_reqs() {
    'use strict';
    return $('textarea[name="body"]').val()
        .split("[quote]")[1]
        .split("[/quote]")[0]
        .replace(/.*System requirements.*/gi, "");
}

function set_reqs(s) {
    'use strict';
    var el = $('textarea[name="body"]');
    var desc = el.val().split("[quote]")[0];
    if ($('.welcome .username').html() != "LinkinsRepeater") {
        if (s.indexOf("[b]Minimum") == 0) { s = "\n" + s; }
    }
    el.val(desc + "[quote][align=center][b][u]System Requirements[/u][/b][/align]\n" + s + "[/quote]");
}

function removebb(s) {
    'use strict';
    return s
        .replace("[b]", "")
        .replace("[i]", "")
        .replace("[u]", "")
        .replace("[align]", "")
        .replace("[align=center]", "")
        .replace("[/b]", "")
        .replace("[/i]", "")
        .replace("[/u]", "")
        .replace("[/align]", "")
        .replace("[*]", "");
}

function fix_about() {
    'use strict';
    var lines = $('textarea[name="body"]').val().split("\n");
    var newcont = "";
    lines.forEach(function(s) {
        s = s.trim();
        var z = s.replace(":", "");
        if (removebb(z).toLowerCase() == "about the game"
           || removebb(z).toLowerCase() == "about this game") {
            s = "[align=center][b][u]About the game[/u][/b][/align]";
        }
        newcont += s + "\n";
    });
    $('textarea[name="body"]').val(newcont.trim());
}

function fix_features() {
    'use strict';
    var lines = $('textarea[name="body"]').val().split("\n");
    var newcont = "";
    lines.forEach(function(s) {
        s = s.trim();
        var z = s.replace(":", "");
        if (removebb(z) == "Features") {
            s = "[align=center][b][u]Features[/u][/b][/align]";
        }
        if (removebb(z) == "Key Features"
           || removebb(z) == "Key features") {
            s = "[align=center][b][u]Key Features[/u][/b][/align]";
        }
        newcont += s + "\n";
    });
    $('textarea[name="body"]').val(newcont.trim());
}

function normald(s) {
    'use strict';
    if (s.indexOf("[b]Minimum") != -1
       || s.trim().replace(/:$/, "") == "Minimum"
       || s.indexOf("[b]Recommended") != -1
       || s.trim().replace(/:$/, "") == "Recommended") {
        return "[b]"+removebb(s).trim().replace(/:$/, "")+"[/b]";
    }
    s = removebb(s).trim();
    if (s == "") {return "";}
    if (s == "undefined") {return "";}
    s = "[*][b]" + s.replace(":", "[/b]: ");
    return s.replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ");
}

function fix_reqs() {
    'use strict';
    var reqs = get_reqs().split('\n');
    var newreqs = "";
    reqs.forEach(function(r){ newreqs = newreqs + normald(r) + "\n"; });
    set_reqs(newreqs.trim());
}
