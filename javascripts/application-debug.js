(function() {
    var baseUrl= findScriptBaseUrl();

    /** A function to escape strings for creating regular expressions.
     */
    function escapeForRegex(text)
    {
        var specialCharacters= ['/', '.', '*', '+', '?', '|',
                                '(', ')', '[', ']', '{', '}', '\\'];
        var _escapeRegex= new RegExp('(\\'+ specialCharacters.join("|\\") + ')', 'g');
        return text.replace(_escapeRegex, '\\$1');
    }


    function findScriptBaseUrl()
    {
        var regex= new RegExp(escapeForRegex('application')+'[^/]*\.js$', 'i');
        var scripts= document.getElementsByTagName("head")[0].getElementsByTagName("script");
        var i;
        var path;
        var s;
        var len= scripts.length;
    
        for (i=0; i<len; ++i)
        {
            s= scripts[i];
            if (s.src && s.src.match(regex))
            {
                path= s.src.replace(regex, '');
                break;
            }
        }
        
        return path;
    }
    
    function loadScript(script)
    {
        document.write( ['<script type="text/javascript" src="',
                         baseUrl, script, '"></script>'].join("") );
    }
    
    loadScript("init.js");
    loadScript("video/base.js");
    loadScript("video/timeline_control.js");
    loadScript("video/youtube.js");
    
})();
