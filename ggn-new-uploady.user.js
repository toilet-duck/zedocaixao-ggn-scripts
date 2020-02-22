// ==UserScript==
// @name         GGn New Uploady
// @namespace    https://gazellegames.net/
// @version      0.2300
// @description  Steam Uploady for GGn
// @author       NeutronNoir, ZeDoCaixao
// @match        https://gazellegames.net/upload.php*
// @match        https://gazellegames.net/torrents.php?action=editgroup*
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// ==/UserScript==

function html2bb(str) {
    if (!str) return "";
    str = str.replace(/< *br *\/*>/g, "\n\n"); //*/
    str = str.replace(/< *b *>/g, "[b]");
    str = str.replace(/< *\/ *b *>/g, "[/b]");
    str = str.replace(/< *u *>/g, "[u]");
    str = str.replace(/< *\/ *u *>/g, "[/u]");
    str = str.replace(/< *i *>/g, "[i]");
    str = str.replace(/< *\/ *i *>/g, "[/i]");
    str = str.replace(/< *strong *>/g, "[b]");
    str = str.replace(/< *\/ *strong *>/g, "[/b]");
    str = str.replace(/< *em *>/g, "[i]");
    str = str.replace(/< *\/ *em *>/g, "[/i]");
    str = str.replace(/< *li *>/g, "[*]");
    str = str.replace(/< *\/ *li *>/g, "");
    str = str.replace(/< *ul *class=\\*\"bb_ul\\*\" *>/g, "");
    str = str.replace(/< *\/ *ul *>/g, "");
    str = str.replace(/< *h2 *class=\"bb_tag\" *>/g, "\n[align=center][u][b]");
    str = str.replace(/< *h[12] *>/g, "\n[align=center][u][b]");
    str = str.replace(/< *\/ *h[12] *>/g, "[/b][/u][/align]\n");
    str = str.replace(/\&quot;/g, "\"");
    str = str.replace(/\&amp;/g, "&");
    str = str.replace(/< *img *src="([^"]*)".*>/g, "\n");
    str = str.replace(/< *a [^>]*>/g, "");
    str = str.replace(/< *\/ *a *>/g, "");
    str = str.replace(/< *p *>/g, "\n\n");
    str = str.replace(/< *\/ *p *>/g, "");
    //Yeah, all these damn stars. Because people put spaces where they shouldn't.
    str = str.replace(//g, "\"");
    str = str.replace(//g, "\"");
    str = str.replace(/  +/g, " ");
    str = str.replace(/\n +/g, "\n");
    str = str.replace(/\n\n\n+/gm, "\n\n");
    str = str.replace(/\n\n\n+/gm, "\n\n");
    str = str.replace(/\[\/b\]\[\/u\]\[\/align\]\n\n/g, "[/b][/u][/align]\n");
    str = str.replace(/\n\n\[\*\]/g, "\n[*]");
    return str;
}

function fix_emptylines(str) {
    var lst = str.split("\n");
    var result = "";
    var empty = 1;
    lst.forEach(function(s) {
        if (s) {
            empty = 0;
            result = result + s + "\n";
        } else if (empty < 1) {
            empty = empty + 1;
            result = result + "\n";
        }
    });
    return result;
}

function pretty_sr(str) {
    if (!str) return "";
    str = str.replace(/™/g, "");
    str = str.replace(/®/g, "");
    str = str.replace(/:\[\/b\] /g, "[/b]: ");
    str = str.replace(/:\n/g, "\n");
    str = str.replace(/:\[\/b\]\n/g, "[/b]\n");
    str = str.replace(/\n\n\[b\]/g, "\n[b]");
    return str;
}

function fill_form(response) {
    //We store the data in gameInfo, since it's much easier to access this way
    var gameInfo = response.response[$("#steamid").val()].data;
    var about = gameInfo.about_the_game;
    if (about === '') { about = gameInfo.detailed_description; }
    about = "[align=center][b][u]About the game[/u][/b][/align]\n" + html2bb(about).trim();
    var year = gameInfo.release_date.date.split(", ").pop();
    var addScreens = true;
    var screens = document.getElementsByName("screens[]");
    var add_screen = $("#image_block a[href='#']").first();     //This is a shortcut to add a screenshot field.
    gameInfo.screenshots.forEach(function(screen, index) {
        //The site doesn't accept more than 20 screenshots
        if (index >= 20) return;
        if (index >= 3) add_screen.click();
        screens[index].value = screen.path_full.split("?")[0];
    });
    var platform = "Windows"
    var cover_field = "input[name='image']";
    var desc_field = "textarea[name='body']";

    if (window.location.href.includes("action=editgroup")) {
        $("input[name='year']").val(year);
        $("input[name='name']").val(gameInfo.name);  //Get the name of the game
        if ($("#trailer~a").attr("href").includes("Linux")) {
            platform = "Linux";
        } else if ($("#trailer~a").attr("href").includes("Mac")) {
            platform = "Mac";
        }
    } else {
        $("#title").val(gameInfo.name);  //Get the name of the game
        $("#year").val(year);
        var genres = [];
        gameInfo.genres.forEach(function (genre) {
            var tag = genre.description.toLowerCase().replace(/ /g, ".");
            genres.push(tag);
        });
        $("#tags").val(genres.join(", "));
        cover_field = "#image";
        desc_field = "#album_desc";
        platform = $("#platform").val();
    }
    var recfield = gameInfo.pc_requirements;
    switch (platform) {
        case "Windows":
            recfield = gameInfo.pc_requirements;
            break;
        case "Linux":
            recfield = gameInfo.linux_requirements;
            break;
        case "Mac":
            recfield = gameInfo.mac_requirements;
            break;
    }
    var sr = html2bb(recfield.minimum) + "\n" + html2bb(recfield.recommended);
    sr = "\n\n[quote][align=center][b][u]System Requirements[/u][/b][/align]\n\n" +
             pretty_sr(html2bb(recfield.minimum+"\n"+recfield.recommended)) +
             "[/quote]";
    $(desc_field).val(about);
    $(desc_field).val($(desc_field).val() + sr);
    $(cover_field).val(gameInfo.header_image.split("?")[0]);       //Get the image URL
    var big_cover = "https://steamcdn-a.akamaihd.net/steam/apps/" + $("#steamid").val() + "/library_600x900_2x.jpg";
    var request_image = new GM.xmlHttpRequest({
            method: "GET",                  //We call the Steam API to get info on the game
            url: big_cover,
            responseType: "json",
            onload: function(response) {
                if(response.status == 200){
                    $(cover_field).val(big_cover);
                }
            }
    });
    $(desc_field).val(fix_emptylines($(desc_field).val()));
}

(function() {
    'use strict';
    if (window.location.href.includes("action=editgroup")) {
        $("td.center").parent().after("<tr><td class='label'>Steam ID</td><td><input id='steamid' /></td></tr>");
    }
    else {
        $("#steamid").after(
            '<a href="javascript:;" id="fill_win">Win</a> <a href="javascript:;" id="fill_lin">Lin</a> <a href="javascript:;" id="fill_mac">Mac</a>');
        $('#fill_win').click(function () { $("#platform").val("Windows"); });
        $('#fill_lin').click(function () { $("#platform").val("Linux"); });
        $('#fill_mac').click(function () { $("#platform").val("Mac"); });
    }
    $("#steamid").blur(function() { //After the "appid" input loses focus
        var request = new GM.xmlHttpRequest({
            method: "GET",                  //We call the Steam API to get info on the game
            url: "http://store.steampowered.com/api/appdetails?l=en&appids=" + $("#steamid").val(),
            responseType: "json",
            onload: fill_form
        });
    });
})();
