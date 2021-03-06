var EventEmitter = require('events').EventEmitter,
    util = require('util'),
	fs = require('fs'),
	cjson = require('./cjson.js');
var xml2json = require('xml-to-json');
var parser = require('xmldom').DOMParser;

var load = function() { };
var xml;
var ele;

util.inherits(load, EventEmitter);

load.prototype.load_pxml = function(path){
	var fileData = fs.readFileSync(path, 'ascii');
	//var doc = new parser().parseFromString(fileData.substring(2, fileData.length));
	var doc = new parser().parseFromString(fileData, 'text/xml');
	ele = this.xml_json(doc);
	return ele;
};


load.prototype.load_xml = function(cnt, path, flag, rels, o_cnt) {
	//var parser = new xml2js.Parser();
	//for ( var i = 1 ;  i < cnt+1;  i++ ){
		if(flag == 0){
			//var xml = path+"slide"+i+".xml.rels";
			var xml = path+"slide"+cnt+".xml.rels";	
			var fileData = fs.readFileSync(xml, 'ascii');
		    var doc = new parser().parseFromString(fileData.substring(2, fileData.length));
			var ele = this.xml_json(doc);
			return ele;
		}
		else if (flag == 1){
			//var xml = path+"slide"+i+".xml";
			var xml = path+"slide"+cnt+".xml";
			var fileData = fs.readFileSync(xml, 'utf8');
            fileData = fileData.replace("EUC-KR","UTF-8");
            console.log(fileData);
		    var doc = new parser().parseFromString(fileData.substring(2, fileData.length));
			var ele = this.xml_json(doc, rels, path, o_cnt);
			return ele;
		}
			
		//var data = fs.readFileSync(xml, 'utf8');
		//data = (data.replace(/p:/gi, "")).replace(/a:/gi,"");
		//fs.writeFileSync('./slide'+i+'.xml', data, 'utf8');
		
		//fs.writeFileSync('./presentation.xml', data, 'utf8');
		//var xml = path+"presentation.xml";
		
			/*xml2json({											//���� ������ (slide.xml �Ǵ� slide.xml.rels)
				input: './slide'+i+'.xml',
				output: './slide'+i+'.json'
			}, function(err, result){
				if(err) throw err;
				else{
					console.log(result);
				}
			});*/

		
		//var fileData = fs.readFileSync('./presentation.xml', 'ascii');
		
	//}
};


load.prototype.xml_json = function(xml, rels, path, o_cnt){
	var tmp;
	//var data="";
	try {
		tmp = xml;
		console.log("dddddddddddddddddoooooooooo");

		var _cjson = new cjson();
		ele= _cjson.cjson_s(tmp, rels, path, o_cnt);
		console.log("hhhhhhhhhhhhhh");
	} 
	catch (e) {
		console.log("invalid XML");
	}
	console.log(ele);
	return ele;
};

module.exports = load;