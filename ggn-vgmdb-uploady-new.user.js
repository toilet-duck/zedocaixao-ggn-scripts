// ==UserScript==
// @name         GGn VGMDB Uploady NEW
// @namespace    https://orbitalzero.ovh/scripts
// @version      0.7.2
// @include      https://gazellegames.net/upload.php*
// @match        https://gazellegames.net/torrents.php?action=editgroup*
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @description  Uploady for VGMDB
// @author       NeutronNoir, ZeDoCaixao
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM.addStyle
// ==/UserScript==
/* globals $ */

var VGMDB_UPLOADY_FIELD =
    `<input placeholder="VGMDB URI" type="text" id="catalog_number" size="60">
     </input>`;

(function() {
    if (window.location.href.includes("action=editgroup")) {
        $("input[name='aliases']").after($(VGMDB_UPLOADY_FIELD))
        insert_button(editgroup_page_handler);
    } else {
        $("#categories").click(function () {
            var el = $(this);
            setTimeout(function() {
                $("#catalog_number").remove();
                if (el.find(":selected").text() == "OST") {
                    insert_button(upload_page_handler);
                }
            }, 500);
        });
    }
})();

function handle_page(handler, input) {
    return (response) => {
        if (response.status != 200) {
            $(input).val("Album not found");
        }
        handler($(response.responseText));
    }
}

function insert_button(handler) {
    $("#categories").after($(VGMDB_UPLOADY_FIELD));
    $("#catalog_number").on("blur", function() {
        $("#vgmdburi").val($(this).val());
        var input = this;
        var request = GM.xmlHttpRequest({
            "method": "GET",
            "url": $(this).val(),
            "onload": handle_page(handler, input)
        });
    });
}

function upload_page_handler(env) {
    $("#aliases").val(get_aliases(env));
    $("#album_desc").val(get_desc(env));
    $("#title").val(get_title(env));
    $("#year").val(get_year(env));
    $("#image").val(get_cover(env));
}

function editgroup_page_handler(env) {
    $("input[name='aliases']").val(get_aliases(env));
    $("textarea[name='body']").val(get_desc(env));
    $("input[name='name']").val(get_title(env));
    $("input[name='year']").val(get_year(env));
    $("input[name='image']").val(get_cover(env));
}

function get_cover(env) {
    return env.find("#coverart").css("background-image")
        .replace(/url\("([^"]*)"\)/, "$1").replace("medium-", "");
}

function get_year(env) {
    return env
        .find("#album_infobit_large>tbody>tr>td>span>b:contains('Release Date')")
        .parent().parent().parent()
        .find("td").last().text().trim().split(" ").pop();
}

function get_title(env) {
    var composers = env
        .find("#album_infobit_large>tbody>tr>td>span>b:contains('Composed by')")
        .parent().parent().parent()
        .find("td").last().text().trim().split(", ");

    let title = env.find(".albumtitle").first().text();

    if (composers.length >= 2) return title + " by Various Artists";
    else return title + " by " + composers[0];
}

function get_aliases(env) {
    var aliases = [];
    env.find("#innermain .albumtitle:not(:first)[lang='en']").each(function() {
        aliases.push($(this).text().trim());
    });
    return aliases.join(", ");
}

function get_desc(env) {
    var desc = "[align=center][size=3][u][b]Album Information\n"
        + env.find(".albumtitle").first().text()
        + "[/b][/u][/size][/align]\n\n";

    env.find("#album_infobit_large>tbody>tr").each(function() {
        //Generate the info on the album
        $(this).find("[style*='display:none']").remove();
        $(this).find("script").remove();
        var title = $(this).find("td>span>b").text();
        var value = $(this).find("td").last().text().trim();
        if (value !== "") {
            desc += "[*][b]" + title + ":[/b]\t" + value + "\n";
        }
    });

    desc += "\n[align=center][pre]Tracklist\n";
    env.find("#tracklist").find("[style*='display: none']").remove();
    var disc_count =
        (env.find("#tracklist").text().match(/Disc [0-9]+/g) || []).length;

    var max_title_length = 0;
    env.find("#tracklist").find("tr").each(function() {
        var td = $(this).find("td").eq(1);
        if ($(td).text().length > max_title_length) {
            max_title_length = $(td).text().length;
        }
    });

    env.find("#tracklist>span>table>tbody").each(function(index) {
        //Generate the track list
        if (disc_count > 1) {
            desc += "Disc " + (index + 1) + "\n";
        }
        $(this).find("tr").each(function(index) { //For each track
            //The first index is a span containing the track number
            var tds = $(this).find("td");
            desc += tds.first().find("span").text()
                + "      "
                + tds.eq(1).text().trim()
                + " ".repeat(Math.ceil(Math.ceil(max_title_length)
                                       - tds.eq(1).text().length))
                + tds.last().text().trim() + "\n";
        });
        desc += "\n";
    });
    desc = desc.substring(0, desc.length - 2) + "[/pre][/align]";

    var notes = env.find("#notes");
    if (notes.length != 0) {
        notes = notes.html().replace(/< *br *>/g, "\n");
        if (notes !== "") {
            desc += "\n\n[align=left][pre]Notes\n" + notes + "[/pre][/align]";
        }
    }

    return desc;
}
