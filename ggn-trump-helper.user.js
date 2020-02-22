// ==UserScript==
// @name         GGn Trump Helper
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @match        https://gazellegames.net/torrents.php?id=*
// @require      https://code.jquery.com/jquery-3.1.0.min.js
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// ==/UserScript==
/* globals jQuery, $ */

function add_report_helper() {
    $('a[title="Report"]').each(function() {
        var torrent_id = $(this).attr("href").replace(/.*&id=/, '');
        console.log(torrent_id);
        var form = `<tr id="rp_helper"><td>
          <form action="/reportsv2.php?action=takereport" enctype="multipart/form-data" method="post" id="report_table">
          <input type="hidden" name="submit" value="true">
          <input type="hidden" name="torrentid" value="`+torrent_id+`">
          <input type="hidden" name="categoryid" value="1">
          <input type="hidden" name="type" value="trump">
          <input id="sitelink" type="hidden" name="sitelink" size="70" value="">
          <textarea id="extra" rows="5" cols="60" name="extra"/>
          <input type="submit" value="Submit report">
          </form><td></tr>`;
        $(this).after(
            ' | <a href="javascript:;" title="Trump" id="rp_'
            +torrent_id
            +'">TP');
        $('#rp_'+torrent_id).click(function (event) {
            $("#rp_helper").remove();
            $(this).closest("tr").after(form);
            convert_pls();
        });
    });
}

function convert_pls() {
    $('a[title="Permalink"]').each(function() {
        var url = $(this).attr("href");
        $(this).click(function (event) {
            event.preventDefault();
            $(this).toggleClass("rp_good");
            $('a[title="Permalink"]').css({color: ''});
            $('.rp_good').css({color: "red"});
            var urls = "";
            $('.rp_good').each(function() {
                urls += " https://gazellegames.net/" + $(this).attr("href");
            });
            $("#rp_helper #sitelink").val(urls);
        });
    });
}

(function() {
    'use strict';
    add_report_helper();
})();
