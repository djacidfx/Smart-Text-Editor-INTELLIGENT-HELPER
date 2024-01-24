const {remote} = require('electron');
const {Menu, MenuItem} = remote;
//const {clipboard} = require('electron');
const menu = new Menu();
const {dialog} = require('electron').remote;
var fs = require('fs');

var quill;
var autoSmartTimerID = -1;

function escapeHtml(text) {
    var map = {
      '&': '%26',
      '"': '&quot;',
      "'": '%27;',
      " ": '%20;',
      "#": '%23;'
    };
  
    return text.replace(/[&#"']/g, function(m) { return map[m]; });
  }


function lookUpWord(_word)
{
    if (!_word || _word.trim().length < 2) return;
    console.log("Looking up: " + _word);

    // word definition
    $.get( "https://en.oxforddictionaries.com/definition/" + _word, function( data )
    {
        let defResponseHTML = $($.parseHTML(data));
        let el = defResponseHTML.find("section.gramb").first();
        $("#smart_def").html("<p>Word Definition for '"+_word+"':</p><br/>" + el.html());
        //let count = 0;
        // thesResponseHTML.find("section.gramb").first().find('li').each(function(){
        //     console.log($(this).find("span a").text());
        //     count++;
        //     if (count > 20) return false;
        // });
    });     

    // wikipedia
    $.get( "https://en.wikipedia.org/w/index.php?search=" + _word, function( data )
    {
        let wikiResponseHTML = $($.parseHTML(data));
        let resu = "<p>Wikipedia for '"+_word+"':</p><br/>";
        // wikiResponseHTML.find("li.mw-search-result").each(function(){
        //     resu = resu + "<li>" + $(this).find(".mw-search-result-heading a").attr("title") + "<br/>";
        //     resu = resu + "" + "https://en.wikipedia.org" + $(this).find(".mw-search-result-heading a").attr("href") + "</li>";
        // });
        //console.log(wikiResponseHTML.find(".mw-parser-output").html());
        let wi = wikiResponseHTML.find(".mw-parser-output").find("p:not(.mw-empty-elt)").first().text();
        if (wi.indexOf("may refer to") !== -1)
        {
            wikiResponseHTML.find("li").each(function(){
                resu = resu + "<li>" + $(this).text() + "</li>";
            });
        }
        resu = resu + wi;
        $("#smart_wiki").html(resu);
    });


    //thesaurus
    $.get( "https://www.thesaurus.com/browse/" + _word, function( data )
    {
        let thesResponseHTML = $($.parseHTML(data));
        let count = 0;
        let resu = "<p>Synonyms for '"+_word+"':</p><br/>";
        thesResponseHTML.find("section.synonyms-container").find('li').each(function(){
            resu = resu + "<span>"+$(this).find("span a").text()+"</span>";
            count++;
            if (count > 20) return false;
        });
        $("#smart_thes").html(resu);
    });
    
}


$( document ).ready(function()
{
    quill = new Quill('#quilleditor', {
        theme: 'snow'
      });

    quill.root.setAttribute('spellcheck', true);

    quill.focus();

    quill.on('editor-change', function(delta, oldDelta, source) {

        window.clearTimeout(autoSmartTimerID);
        autoSmartTimerID = window.setTimeout(function()
        {
            
            var range = quill.getSelection(true);
            console.log(range);
            if (range)
            {
                if (range.length == 0)
                {
                    if (quill.getText(range.index - 1, 1) == " ")
                    {
                        range.index = range.index - 1;
                    }

                    let is = range.index-40;
                    if (is < 0) is = 0;
                    let textBefore = quill.getText(is, 40);
                    let textAfter = quill.getText(range.index, 40);
                    //textBefore = textBefore.replace('\n', ' ');
                    let words = textBefore.split(" ");
                    let word = words[words.length - 1];
                    let afterWord = textAfter.split(" ")[0];
                    //word = word.replaceAll(".", "").replaceAll(",", "").replaceAll("!", "").replaceAll("?", "");
                    //afterWord = afterWord.replaceAll(".", "").replaceAll(",", "").replaceAll("!", "").replaceAll("?", "");
                    //console.log(word + afterWord);
                    //word = word.replaceAll(".", " ");
                    //afterWord = afterWord.replaceAll(".", " ");
                    let composite = word + afterWord;

                    composite = composite.replace(".", "");
                    composite = composite.trim();

                    if (composite.indexOf("\n") !== -1)
                    {
                        let lines = composite.split("\n");
                        composite = lines[lines.length - 1];

                        for (let i=(lines.length-1); i > 0; i--)
                        {
                            if (lines[i].trim().length > 0)
                            {
                                console.log("#"+i+": " +lines[i]);
                                composite = lines[i];
                                break;
                            }
                        }
                    }

                    lookUpWord(composite);
                }
                else
                {
                    let text = quill.getText(range.index, range.length);
                    //console.log('User has highlighted: ', text);
                    lookUpWord(text);
                }
            } 

        }, 1100);

    });


});

/*
// Build menu one item at a time, unlike
menu.append(new MenuItem ({
label: 'Smart Help',
click() { 
    smartSearch(); //getSelectionText()
}
}))

menu.append(new MenuItem({type: 'separator'}))
menu.append(new MenuItem({label: 'Test 2 Checkbox', type: 'checkbox', checked: true}))
menu.append(new MenuItem ({
label: 'Test 3',
click() {
    alert('item 3 clicked')
}
}))

// Prevent default action of right click in chromium. Replace with our menu.
window.addEventListener('contextmenu', (e) => {
e.preventDefault()
menu.popup(remote.getCurrentWindow())
}, false)

*/