// ==UserScript==
// @name         GGn editor helper
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Various fixes and helpers useful for moderators and editors
// @author       ZeDoCaixao
// @match        https://gazellegames.net/torrents.php?id=*
// @require      https://code.jquery.com/jquery-3.1.0.min.js
// @require      https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js
// @require      https://cdn.jsdelivr.net/npm/jquery-sortablejs@latest/jquery-sortable.js
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// ==/UserScript==
/* globals $, authkey, imageUpload */

// EX "GGn mod helper"

(function() {
    'use strict';
    //do_add_trumpy();
    add_srrdb();
    add_rename_form();
    hl_bad_images();
    add_left_box()
    try { add_sort_screenshots (); } catch (err) {}
    try { add_gogdb_search(); } catch (err) {}
    try { do_steam_things(); } catch (err) {}
    // TODO
    $(".filelist_table").each(function() {
        var bad_file = false;
        var tbody = $(this).find('tbody');
        tbody.find('tr td:not([class*="nobr"])').each(function(n, e) {
            if (n >0 && /\.flac$/i.test($(e).text())) {
                bad_file = true;
            }
            if (bad_file) {
                // alert(e);
                //tbody.parent().parent().parent().parent().prev().children().first().append("aa");
            }
        });
    });
})();

function do_add_trumpy() {
    $(".torrent_table").each(function() {
        var tbody = $(this).find('tbody');
        tbody
            .find('tr.group_torrent > td:not([class*="nobr"]) > span')
            .each(function(n, e) {
                var torrent_id = $(e).find("a[title=Permalink]")
                    .attr("href").replace(/.*torrentid=/, '');
            $(e).html($(e).html().replace(/]$/, ''));
            $(e).append(' | <a id="bad_'
                        +torrent_id+'" href="javascript:;">BT</a>');
            $(e).append(' | <a id="good_'
                        +torrent_id+'" href="javascript:;">GT</a> ]');
        });
    });
    $(".torrent_table").after('<div id="trumpy">');
}

function add_gogdb_search() {
    $('#modhelperLeftBox ul').append(`
        <li><a href="https://www.gogdb.org/products?search=`
            + /.* - (.*) ::.*/.exec(document.title)[1]
            + `">Search GOG DataBase`);
}

function add_sort_screenshots() {
    /*$('#modhelperLeftBox ul').append(`<li>
        <a href="javascript:;" id="mh_sort_screenshots_button">
            Sort Screenshots`);
    */
    $('.screenshots_div .head').prepend(`<div id="mh_screenButtons">
         <a href="javascript:;" id="mh_sort_screenshots_button">[sort]</a>
    </div>`);
    $('#mh_screenButtons').css('float', 'right');
    $('#mh_screenButtons').css('align', 'right');
    $('#mh_screenButtons').css('vertical-align', 'super');
    $('#mh_screenButtons').css('margin', '-5px 0');
    $('#mh_sort_screenshots_button').click(function () {
        sortable_screenshots();
    });
}


function sortable_screenshots() {
    $('#mh_screenshotsFormDiv').remove();
    $('.screenshots').attr('id', 'mh_good_screenshots');
    $('#mh_good_screenshots').parent().parent().before(`
        <div class="box screenshots_div">
        <div class="head">Trash</div>
        <div class="screenshots" id="mh_bad_shots">`);
    $('#mh_bad_shots').sortable({group: 'mh_screenshots'});
    $('#mh_good_screenshots').sortable({group: 'mh_screenshots'});
    $('#mh_good_screenshots').after(
        '<a href="javascript:;" id="mh_screenshots_post">submit</a>');
    var group_id = decodeURIComponent(
        window.location.search.match(/(\?|&)id\=([^&]*)/)[2]);
    $('#mh_screenshots_post').click(function () {
        var coverUrl = $('.box_albumart p img').attr('src');
        var mh_screenForm = `
            <form action="torrents.php" method="post" id="mh_screenshotsForm">
                <input type="hidden" name="action" value="takeimagesedit">
                <input type="hidden" name="groupid" value="` + group_id + `">
                <input type="hidden" name="categoryid" value="1">
                cover <input type="text" id="mhCover" name="image" size="92" value="`
                + coverUrl + `">
                <h3>Screenshots</h3>
                <div id="mh_screenshotsFormScreenshots"
                     style="text-align: center"></div>
                <input type="submit" value="Submit">
                <input type="checkbox" name="markcheckedwiki"
                       id="markcheckedwiki" value="1">
                &nbsp;<label for="markcheckedwiki">Mark as Checked</label>
            </form>`;
        $('#mh_screenshotsFormDiv').remove();
        $('#mh_good_screenshots').after('<div id="mh_screenshotsFormDiv">');
        $('#mh_screenshotsFormDiv').html(mh_screenForm);
        var scrFormCounter = 0;
        $('#mh_good_screenshots a').each(function () {
            scrFormCounter += 1;
            var url = $(this).attr('href').replace('postimg.org', 'postimg.cc');
            $("#mh_screenshotsFormScreenshots").append(
                '<input type="text" id="mh_scrInput' +
                scrFormCounter +
                '" name="screens[]" idstyle="width: 90%;" value="' +
                url+'" style="width: 45%"/>&nbsp;');
            $(this).remove();
            imageUpload(url,
                        document.getElementById('mh_scrInput'+scrFormCounter));
        });
        imageUpload(coverUrl, document.getElementById("mhCover"));
    });
}

function add_left_box() {
    $('#weblinksdiv').after('<div class="box" id="modhelperLeftBox"><ul>');
}

function add_screenshot_to_list(url) {
    $('#mh_good_screenshots').append(
        '<a href="' + url + '" data-fancybox="gallery" rel="t57964"><img src="'
        + url + '" alt="Torrent screenshot" style="max-width:150px"></a>'
    );
}

const isValidUrl = function(str){
  const regexp = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  return regexp.test(str);
};

function do_steam_things() {
    var steamUrl = $('#weblinksdiv a[title="Steam"]').attr('href');
    var steamId = /.*\.com\/app\/([0-9]+)/.exec(steamUrl)[1];
    var depotsUrl = 'https://steamdb.info/app/'+steamId+'/depots/#depots';
    $('#modhelperLeftBox').prepend('<div class="head">Steam ID: '
                                  + steamId+'</div>');
    var cvrHeigth = document.querySelector('.box_albumart img').naturalHeight;
    var cvrWidth = document.querySelector('.box_albumart img').naturalWidth;
    // $('.box_albumart').after('<p>('+cvrWidth+'×'+cvrHeigth+') <a href="javascript:;" id="steamCoverDo">Check Steam</a>');
    $('#modhelperLeftBox ul').append('<li><a href="'+depotsUrl+'">Depots');

    $('#mh_screenButtons')
        .prepend('<a href="javascript:;" id="steamScreenshotsDo">[steam]</a>');
    $('#mh_screenButtons').prepend('   <a href="javascript:;" id="steamCoverDo">[cover (' +cvrWidth+'×'+cvrHeigth+')]</a>  ');
    $('#mh_screenButtons a').css('margin', '0px');

    var steamCoverUrl = "https://steamcdn-a.akamaihd.net/steam/apps/"+steamId+"/library_600x900_2x.jpg";

    $('#steamCoverDo').click(function () {
        GM.xmlHttpRequest({
            method: "GET",
            url: steamCoverUrl,
            onload: function (response) {
                if(response.status == 200) {
                    $('.box_albumart img').attr("src", steamCoverUrl);
                    $('#steamCoverDo').html("cover replaced! ");
                } else {
                    $('#steamCoverDo').html("no cover on steam! ");
                }
                /*var gameInfo = response.response[steamId].data;
                $('#mh_bad_shots').html($('#mh_good_screenshots').html());
                $('#mh_good_screenshots').html('');
                gameInfo.screenshots.forEach( function(screen, index) {
                    var scrUrl = screen.path_full.split("?")[0];
                    if (index >= 20) return;
                    add_screenshot_to_list(scrUrl);
                });*/
            }
        });
    });

    $('#steamScreenshotsDo').click(function () {
        sortable_screenshots();
        GM.xmlHttpRequest({
            method: "GET",
            url: "http://store.steampowered.com/api/appdetails?l=en&appids="
                 + steamId,
            responseType: "json",
            onload: function (response) {
                var gameInfo = response.response[steamId].data;
                $('#mh_bad_shots').html($('#mh_good_screenshots').html());
                $('#mh_good_screenshots').html('');
                gameInfo.screenshots.forEach( function(screen, index) {
                    var scrUrl = screen.path_full.split("?")[0];
                    if (index >= 20) return;
                    add_screenshot_to_list(scrUrl);
                });
            }
        });
    });
}

function hl_bad_images() {
    $('.box_albumart img:not([src*="ptpimg"])').each(function() {
        $(this).css({borderBottom: "6px dashed red"});
    });
    $('.screenshots img:not([src*="ptpimg"])').each(function() {
        $(this).css({borderBottom: "6px dashed red"});
    });
    $('#description img[src*="http"]').each(function() {
        $(this).css({borderBottom: "6px dashed red"});
    });
}


function add_rename_form() {
    $("#display_name").html($("#display_name").html()
        + ' <sup><a href="javascript:;" id="titleEdit">rename</a></sup>');
    $("#titleEdit").css({fontSize: "10px"});
    $('#titleEdit').click(function () {
        var game_name = $('#curlinkedgroup').prop('title')
            .replace(/ \([^)(]*\)$/, '');
        var group_id = $('.addtagsdiv input[name="groupid"]').val();
        $("#display_name").html(`
            <form action="torrents.php" method="post">
            <input type="hidden" name="action" value="rename">
            <input type="hidden" name="auth" value="`+ authkey + `">
            <input type="hidden" name="groupid" value="` + group_id + `">
            <input type="text" name="name" size="92" value="` + game_name + `">
            <input type="submit" value="Rename"></form>`
        );
    });
}

function add_srrdb() {
    $('tr[id^="torrent_').each(function () {
        var e = $(this);
        var torrentid = $(e).attr('id').replace(/^torrent_/, '');
        $(e).find('.linkbox:contains("View")')
            .append('<a href="#" id="add_nfo_fix_'+torrentid+'">(SRRDB)</a>');
        $('#add_nfo_fix_'+torrentid).click(function() {
            var rel_name = $("#files_"+torrentid+" .filelist_path")
                .html().replace(/^\/|\/$/g, '');
            GM.xmlHttpRequest({
                method: "GET",
                url: "https://www.srrdb.com/api/nfo/" + rel_name,
                responseType: "json",
                onload: function (response) {
                    response.response.nfolink.forEach(function (e) {
                        $("#history_"+torrentid).after('<a href="'+e+'">'
                                                       +e+'</a>');
                    });
                }
            });
            return false;
        });
    });
}
