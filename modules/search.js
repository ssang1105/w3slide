var fs = require('fs'),
	EventEmitter = require('events').EventEmitter,
    util = require('util');
var load = require('./load.js');
var search = function() {};
var ele;
var xele;
var e_sld={};
util.inherits(search, EventEmitter);

search.prototype.search_detail = function(_file, abc){
	var cnt = 0;
    var o_cnt = 0;
	var loadx = new load();
	var sld;
	
	fs.readdir(_file, function(err, files){
		if(err) throw err;
		files.forEach(function(file){
			sld = abc.sld;						
			cnt++;
			ele = loadx.load_xml(cnt, _file, 0);
			xele = loadx.load_xml(cnt, _file.split('_rels/').join(""), 1, ele, o_cnt);
			
			var temp = Object.keys(xele);
			for(var i=0; i<temp.length; i++){
				var ab = temp[i];
				var cd = xele[ab];
				sld = sld + cd[0];
                o_cnt++;
			}
			sld = sld + "</svg></div>";
            if(sld.indexOf("fade") != -1){
                o_cnt --;
            }else if(sld.indexOf("push") != -1){
                o_cnt--;
            }
			e_sld["sld" + cnt] = [sld, o_cnt];
			console.log(_file+file);
		});
	});
	return e_sld;
};

module.exports = search;