// ==UserScript==
// @name        GGn easy add to common collections
// @namespace   https://gazellegames.net/torrents
// @description Add a group to often used collection from group page
// @include     https://gazellegames.net/torrents.php?id=*
// @include     https://gazellegames.net/torrents.php?page=*&id=*
// @version     1.2.6
// @grant       GM_xmlhttpRequest
// ==/UserScript==
/* globals authkey */

/******************* COLLECTIONS *************************
 format of every line: [collectionID, "Displayed Name"],
 to add a title, just use collectionID 0
 *********************************************************/
var collections = [
    [0   , "Commercial"              ],
    [152 , "Early Access"            ],
    [5148, "Out of Early Access"     ],
    [164 , "Crowdfunded"             ],
    [156 , "Free$"                   ],
    [3933, "Libre"                   ],
    [1763, "Removed from GOG"        ],
    [1536, "Removed from Steam"      ],

    [0   , "Engines"                 ],
    [263 , "Unity"                   ],
    [562 , "GameMaker"               ],
    [245 , "Unreal"                  ],
    [657 , "Flash"                   ],
    [789 , "FNA"                     ],
    [1880, "DosBox"                  ],
    [584 , "Ren'Py"                  ],

    [0   , "Features"                ],
    [551 , "Controller"              ],
    [961 , "Co-Op"                   ],
    [962 , "Local Co-Op"             ],
    [963 , "Local MP"                ],
    [476 , "Single Screen MP"        ],
    [77  , "LAN"                     ],

    [0   , "VR"                      ],
    [559 , "VR Support"              ],
    [683 , "VR Only"                 ],
    [968 , "OSVR"                    ],
    [1117, "Seated VR"               ],
    [1118, "Standing VR"             ],
    [1119, "Room Scale VR"           ],
    [1884, "Tracked Motion Controls" ],
    [738 , "Oculus Rift"             ],
    [1116, "Oculus Touch"            ],
    [739 , "HTC Vive"                ],
    [5679, "Valve Index"             ],

    [0   , "Mechanics"               ],
    [902 , "Procedural Generation"   ],
    [2380, "Permadeath"              ],
    [3813, "Turn-Based Combad"       ],

    [0   , "Themes"                  ],
    [856 , "Female Protagonist"      ],
    [586 , "Zombie"                  ],
    [3994, "Vampire"                 ],
    [3721, "Furry"                   ],
    [624 , "Political"               ],

    [0   , "Settings"                ],
    [673 , "WW2"                     ],
    [3025, "WW1"                     ],
    [6751, "Space"                   ],
    [585 , "Post-Apoc"               ],
    [3622, "Cyberpunk"               ],
    [3169, "Steampunk"               ],
    [5515, "Medieval"                ],

    [0   , "VN"                      ],
    [4502, "Slice of Life"           ],
    [1692, "Native English"          ],
    [62  , "English Translated"      ],
    [1792, "Visual Novels"           ],
    [5078, "Episodic Story"          ],
    [3034, "Kemonomimi"              ],
    [3031, "Catgirls"                ],
    [2862, "Monster Girls"           ],
    [3032, "Yuri"                    ],
    [3033, "Yaoi"                    ],
    [3035, "Otome"                   ],

    [0   , "Adult"                   ],
    [5129, "Rape"                    ],
    [1793, "Eroge"                   ],
    [1794, "Nukige"                  ],
    [3041, "Loli"                    ],
    [3185, "Shota"                   ],
    [4908, "Scat"                    ],
    [3039, "Futanari"                ],
    [5844, "Netorare"                ],
    [5845, "Netori"                  ],
    [5846, "Netorase"                ],
    [4138, "Uncensored"              ],

    [0   , "Other"                   ],
    [969 , "GGn Internals"           ],
];
/* **************************************************** */

var col_links = '<tr><td style="width: 0; font-weight: bold">Add to:</td><td>';

collections.forEach(function (e, i, v) {
    if (e[0] == 0) {
        col_links += '</td></tr><tr><td>    ' + e[1] + ":</td><td> ";
    } else {
        col_links += '[<a href="javascript:;" id="add_to_coll_'+e[0]+'">'
            +e[1]+'</a>] ';
    }
});
col_links += "</td></tr></table>";

var coltable = document.createElement('table');
coltable.id = "coltable";
coltable.innerHTML = '»»» <a href="javascript:;" id="addcolls">Add to collections</a>';
var el = document.querySelector(".description_div")
el.parentNode.insertBefore(coltable, el);

document.getElementById('addcolls').addEventListener('click', function () {
    coltable.innerHTML = col_links;
    collections.forEach(function (e, i, v) {
        if (e[0] != 0) {
            document.getElementById("add_to_coll_"+e[0]).onclick = function() {
                to_coll(e[0]);
            } ;
        }
    });
});

function to_coll(collId){
    var http = new XMLHttpRequest();
    var url = "collections.php";
    var params = "action=add_torrent&auth="+authkey+
        "&collageid="+collId+"&url="+window.location.href;
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            document.getElementById("add_to_coll_"+collId).outerHTML = "ADDED";
            return true;
        }
    };
    http.send(params);
    return true;
}

