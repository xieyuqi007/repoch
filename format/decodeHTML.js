export default function decodeHTML(str) {
    if(typeof str !== 'string'){
        throw 'decodeHTML need a string as parameter';
    }
    return str.replace(/&quot;/g,'"').
        replace(/&lt;/g,'<').
        replace(/&gt;/g,'>').
        replace(/&#39;/g,'\'').
        replace(/&nbsp;/g,'\u00A0').
        replace(/&#32;/g,'\u0020').
        replace(/&amp;/g,'\&');
}

