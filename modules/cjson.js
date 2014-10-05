function cjson(config) {
	'use strict';
	
	this.config = config || {};
	this.initConfigDefaults();

	this.DOMNodeTypes = {
		ELEMENT_NODE 	   : 1,
		TEXT_NODE    	   : 3,
		CDATA_SECTION_NODE : 4,
		COMMENT_NODE	   : 8,
		DOCUMENT_NODE 	   : 9
	};
	this.file;
	this.cm = 359833.3;
	this.px = 28.346;
	this.ele = {};
	this.rels;
	this.sldcnt = 0;
	this.cnt = 0;
	this.rect_cnt = 0;
	this.ellipse_cnt = 0;
	this.arrow_cnt = 0;
	this.rarrow_cnt = 0;
	this.larrow_cnt = 0;
	this.pic_cnt = 0;
    this.txt_cnt = 0;
    this.object_cnt = 0;
	this.abcd = new Object;
	this.result = new Object;
};
module.exports = cjson;

cjson.prototype.initConfigDefaults = function() {
	if(this.config.escapeMode === undefined) {
		this.config.escapeMode = true;
	}
	this.config.attributePrefix = this.config.attributePrefix || "";
	this.config.arrayAccessForm = this.config.arrayAccessForm || "none";
	this.config.emptyNodeForm = this.config.emptyNodeForm || "text";
	if(this.config.enableToStringFunc === undefined) {
		this.config.enableToStringFunc = true; 
	}
	this.config.arrayAccessFormPaths = this.config.arrayAccessFormPaths || []; 
	if(this.config.skipEmptyTextNodesForObj === undefined) {
		this.config.skipEmptyTextNodesForObj = true;
	}
};
	
cjson.prototype.getNodeLocalName = function( node ) {
	var nodeLocalName = node.nodeName;			
	return nodeLocalName;
};
	
cjson.prototype.toArrayAccessForm = function(obj, childName, path) {
	switch(config.arrayAccessForm) {
	case "property":
		if(!(obj[childName] instanceof Array))
			obj[childName+"_asArray"] = [obj[childName]];
		else
			obj[childName+"_asArray"] = obj[childName];
		break;		
	/*case "none":
		break;*/
	}
	
	if(!(obj[childName] instanceof Array) && config.arrayAccessFormPaths.length > 0) {
		var idx = 0;
		for(; idx < this.config.arrayAccessFormPaths.length; idx++) {
			var arrayPath = this.config.arrayAccessFormPaths[idx];
			if( typeof arrayPath === "string" ) {
				if(arrayPath == path)
					break;
			}
			else
			if( arrayPath instanceof RegExp) {
				if(arrayPath.test(path))
					break;
			}				
			else
			if( typeof arrayPath === "function") {
				if(arrayPath(obj, childName, path))
					break;
			}
		}
		if(idx!=config.arrayAccessFormPaths.length) {
			obj[childName] = [obj[childName]];
		}
	}
};

cjson.prototype.getAttr = function(node){
	// Attributes
	for(var aidx=0; aidx <node.attributes.length; aidx++) {
		var attr = node.attributes.item(aidx); // [aidx];
		this.result.__cnt++;
		if(attr.name == "r:id"){
			this.result["r"+attr.localName] = attr.value;
		} else if(attr.name == "r:embed"){
			this.result["r"+attr.localName] = attr.value;
		} else if(attr.name == "r:link"){
			this.result["r"+attr.localName] = attr.value;
		} else
			this.result[this.config.attributePrefix+attr.name]=attr.value;
	}
	return this.result;
};

cjson.prototype.parseDOMChildren = function( node, path ) {
	if(node == undefined){
		return this.ele;
	}
	else if(node.nodeType == this.DOMNodeTypes.DOCUMENT_NODE) {
		
		var nodeChildren = node.childNodes;
		// Alternative for firstElementChild which is not supported in some environments
		for(var cidx=0; cidx <nodeChildren.length; cidx++) {
			var child = nodeChildren.item(cidx);
			if(child.nodeType == this.DOMNodeTypes.ELEMENT_NODE) {
				var childName = this.getNodeLocalName(child);
				this.result[childName] = this.parseDOMChildren(child, childName);
			}
		}
		//return this.result;
		return this.ele;
	}
	else if(node.nodeType == this.DOMNodeTypes.ELEMENT_NODE) {
		
		this.result.__cnt=0;
		
		var nodeChildren = node.childNodes;
		if(node.attributes.length == 0 && nodeChildren.length==0){
			var attr = "";
			this.result.__cnt++;
			this.result[this.config.attributePrefix+""] = "";
		}
		
		// Children nodes
		for(var cidx=0; cidx <nodeChildren.length; cidx++) {
			var child = nodeChildren.item(cidx); // nodeChildren[cidx];
			var childName = this.getNodeLocalName(child);

			if(childName == "p:sldIdLst"){
				this.sldcnt = child.firstChild.attributes.length;
			}
			if(childName == "p:cSld"){
				this.parseDOMChildren(child.childNodes[0]);
			}
			if(childName == "p:sp"){
				this.parseDOMChildren(child);
			}
			if(childName == "p:spPr"){
				this.parseDOMChildren(child);
			}
			if(childName == "a:xfrm"){
				this.parseDOMChildren(child);
			}
			
			if(childName == "a:solidFill"){
				this.parseDOMChildren(child);
			}
			if(childName == "a:ln"){
				if(child.childNodes[0].nodeName == "a:tailEnd"){
					this.parseDOMChildren(child);
				}
			}
			if(childName == "p:blipFill"){
				this.parseDOMChildren(child);
			}
			if(childName == "mc:AlternateContent"){
				this.parseDOMChildren(child);
			}
			if(childName == "mc:Choice"){
				this.parseDOMChildren(child);
			}
            if(childName == "p:txBody"){
                var txt = "";
                for(var i=0; i<child.childNodes.length; i++){
                    if(child.childNodes[i].nodeName == "a:p"){
                        for(var j=0; j<child.childNodes[i].childNodes.length; j++){
                            if(child.childNodes[i].childNodes[j].nodeName == "a:r"){
                                for(var k=0; k<child.childNodes[i].childNodes[j].childNodes.length; k++){
                                    if(child.childNodes[i].childNodes[j].childNodes[k].nodeName == "a:t"){
                                        console.log(child.childNodes[i].childNodes[j].childNodes[k].childNodes[0].data);
                                        txt = txt + child.childNodes[i].childNodes[j].childNodes[k].childNodes[0].data;
                                    }else
                                        continue;
                                }
                            }else;
                        }
                    }else;
                }
                this.abcd = this.result;
                var c = JSON.stringify(this.abcd);
                var tmp = JSON.stringify(this.ele);
                if(tmp.indexOf ((this.abcd.x/this.cm)*this.px )!= -1)
                    continue;
                this.object_cnt++;
                this.txt_cnt++;
                var obj = new Object;
                obj = JSON.parse(c);
                this.ele["txt"+this.txt_cnt] = [
                    '<text class="text'+this.txt_cnt+'" id="object'+this.object_cnt+'" x="'+(obj.x/this.cm)*this.px+'" y="'+(obj.y/this.cm)*this.px+'" >'+txt+'</text>'
                ]
                this.abcd="";
            }
			if(childName == "p:fade"){
				this.abcd = this.getAttr(child);
				var c = JSON.stringify(this.abcd);
				var obj = new Object;
				obj = JSON.parse(c);
				this.ele["animation"]  = [ "fade", obj.spd ];
			}
			if(childName == "p:transition"){
				if(child.childNodes[0].nodeName == "p:push"){
					this.abcd = this.getAttr(child);
					this.abcd = this.getAttr(child.childNodes[0]);
					var c = JSON.stringify(this.abcd);
					var obj = new Object;
					obj = JSON.parse(c);
					if(c.indexOf("dir") != -1){
						this.ele["animation"]  = [ "push_l", obj.spd ];
					}else{
						this.ele["animation"] = [ 	"push_r",	 obj.spd ];
						
					}
				}
			}

			if(child.attributes.length != 0){
				this.abcd = this.getAttr(child);
				var c = JSON.stringify(this.abcd);
				
				if(childName == "p:sldSz"){
					var obj = new Object;
					obj = JSON.parse(c);
					//obj.__cnt = result.__cnt;
					this.ele = {
						"sld" : '<div id="canvas" class="canvas"style="display: block; cursor: default"><svg id="slideSVG" overflow="visible" x="0" viewbox="0 0 '+(obj.cx/this.cm)*this.px + ' ' + (obj.cy/this.cm)*this.px + '" xlinkns="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">',
						"sldcnt" : this.sldcnt
					}
				}
				if(node.localName == "Relationships"){
					this.cnt++;

					var obj = new Object;
					obj = JSON.parse(c);
					
					//this.ele["rels"+this.cnt] = { "Id" : obj.Id, "Type" : obj.Type, "Target" : obj.Target};
					this.ele["rels"+this.cnt] = [ obj.Id,  obj.Type,  obj.Target];

				}
				
				if(childName == "a:prstGeom"){
					if(c.indexOf("print") != -1){
						var tmp = JSON.stringify(this.ele);
						if(tmp.indexOf( (this.abcd.x/this.cm)*this.px ) != -1)
							continue;
						var temp = Object.keys(this.rels);
						var f_dir;
                        this.object_cnt++;
						this.pic_cnt++;
						var obj = new Object;
						obj = JSON.parse(c);
						for(var i=0; i<temp.length; i++){
							var f_tmp1;
							var f_tmp2;
							var ab = temp[i];
							var cd = this.rels[ab];
							for(var j=0; j<3; j++){
								if(this.abcd.rembed == cd[i]){
									f_tmp1 = this.file;
									f_tmp2 = cd[j+2].split('../').join("");
									f_dir = f_tmp1 + f_tmp2;
									break;
								}
							}
						}
						this.ele["image"+this.pic_cnt] = [
							'<image class="drawnObject" id="object'+this.object_cnt+'" x="'+(obj.x/this.cm)*this.px+'" y="'+(obj.y/this.cm)*this.px+'" width="'+(obj.cx/this.cm)*this.px+'" height="'+(obj.cy/this.cm)*this.px+'" xlink:href="'+f_dir+'"/>'
						]
						this.abcd="";
					}
					else{
                        if(node.nextSibling.childNodes[0].attributes[0].name == "wrap"){
                            this.parseDOMChildren(child);
                        }
                        else{
                            if(child.nextSibling == null){
                                if(child.attributes[0].nodeValue == "rect"){
                                    var tmp = JSON.stringify(this.ele);
                                    if(tmp.indexOf ((this.abcd.x/this.cm)*this.px )!= -1)
                                        continue;
                                    this.rect_cnt++;
                                    this.object_cnt++;
                                    var obj = new Object;
                                    obj = JSON.parse(c);
                                    this.ele["rect"+this.rect_cnt] = [
                                         '<rect class="drawnObject" id="object'+this.object_cnt+'" fill="#5b9bd5" x="'+(obj.x/this.cm)*this.px+'" y="'+(obj.y/this.cm)*this.px+'" width="'+(obj.cx/this.cm)*this.px+'" height="'+(obj.cy/this.cm)*this.px+'" fill-opacity="1" stroke-opacity="1" stroke-width="1" stroke="#41719c"></rect>'
                                    ]
                                    this.abcd="";
                                }else if(child.attributes[0].nodeValue == "ellipse"){
                                    var tmp = JSON.stringify(this.ele);
                                    if(tmp.indexOf( (((this.cx/this.cm)*this.px)/2) + ((this.x/this.cm)*this.px) ) != -1)
                                        continue;
                                    this.object_cnt++;
                                    this.ellipse_cnt++;
                                    var obj = new Object;
                                    obj = JSON.parse(c);
                                    var cx = (((obj.cx/this.cm)*this.px)/2) + ((obj.x/this.cm)*this.px);
                                    var cy = (((obj.cy/this.cm)*this.px)/2)+((obj.y/this.cm)*this.px);
                                    this.ele["ellipse"+this.ellipse_cnt] = [
                                        '<ellipse class="drawnObject" id="object'+this.object_cnt+'" fill="#5b9bd5" cx="'+cx+'" cy="'+cy+'" rx="'+(((obj.cx/this.cm)*this.px)/2)+'" ry="'+(((obj.cy/this.cm)*this.px)/2)+'" fill-opacity="1" stroke-opacity="1" stroke-width="1" stroke="#41719c"></ellipse>'
                                    ]
                                    this.abcd="";
                                }else if(child.attributes[0].nodeValue == "rightArrow"){
                                    var tmp = JSON.stringify(this.ele);
                                    if(tmp.indexOf ((this.abcd.x/this.cm)*this.px )!= -1)
                                        continue;
                                    this.rarrow_cnt++;
                                    this.object_cnt++;
                                    var obj = new Object;
                                    obj = JSON.parse(c);
                                    var x = (obj.x/this.cm)*this.px;
                                    var y = (obj.y/this.cm)*this.px;
                                    var cx = (obj.cx/this.cm)*this.px;
                                    var cy = (obj.cy/this.cm)*this.px;
                                    var pot1_x = x, pot1_y = y + cy/4;
                                    var pot2_x = x, pot2_y = y + cy - cy/4;
                                    var pot3_x = x + cx - cy/2, pot3_y = y + cy - cy/4;
                                    var pot4_x = x + cx - cy/2, pot4_y = y + cy;
                                    var pot5_x = x + cx, pot5_y = y + cy/2;
                                    var pot6_x = x + cx - cy/2, pot6_y = y;
                                    var pot7_x = x + cx - cy/2, pot7_y = y + cy/4;
                                    this.ele["rarrow"+this.rarrow_cnt] = [
                                        '<path class="drawnObject" id="object'+this.object_cnt+'" fill="#5b9bd5" stroke="#5b9bd5" d="M'+pot1_x+','+pot1_y+' L'+pot2_x+','+pot2_y+' '+pot3_x+','+pot3_y+' '+pot4_x+','+pot4_y+' '+pot5_x+','+pot5_y+' '+pot6_x+','+pot6_y+' '+pot7_x+','+pot7_y+'" ></path>'
                                    ]
                                    this.abcd="";
                                }else if(child.attributes[0].nodeValue == "leftArrow"){
                                    var tmp = JSON.stringify(this.ele);
                                    if(tmp.indexOf ((this.abcd.x/this.cm)*this.px )!= -1)
                                        continue;
                                    this.rarrow_cnt++;
                                    this.object_cnt++;
                                    var obj = new Object;
                                    obj = JSON.parse(c);
                                    var x = (obj.x/this.cm)*this.px;
                                    var y = (obj.y/this.cm)*this.px;
                                    var cx = (obj.cx/this.cm)*this.px;
                                    var cy = (obj.cy/this.cm)*this.px;
                                    var pot1_x = x, pot1_y = y + cy/2;
                                    var pot2_x = x+cy/2, pot2_y = y + cy;
                                    var pot3_x = x + cy/2, pot3_y = y + cy - cy/4;
                                    var pot4_x = x + cx, pot4_y = y + cy - cy/4;
                                    var pot5_x = x + cx, pot5_y = y + cy/4;
                                    var pot6_x = x + cy/2, pot6_y = y + cy/4;
                                    var pot7_x = x + cy/2, pot7_y = y;
                                    this.ele["larrow"+this.larrow_cnt] = [
                                        '<path class="drawnObject" id="object'+this.object_cnt+'" fill="#5b9bd5" stroke="#5b9bd5" d="M'+pot1_x+','+pot1_y+' L'+pot2_x+','+pot2_y+' '+pot3_x+','+pot3_y+' '+pot4_x+','+pot4_y+' '+pot5_x+','+pot5_y+' '+pot6_x+','+pot6_y+' '+pot7_x+','+pot7_y+'" ></path>'
                                    ]
                                    this.abcd="";
                                }
                            }else {
                                if(child.nextSibling.nodeName == "a:noFill"){
                                    if(child.attributes[0].nodeValue == "rect"){
                                        var tmp = JSON.stringify(this.ele);
                                        if(tmp.indexOf((this.abcd.x/this.cm)*this.px ) != -1)
                                            continue;
                                        this.object_cnt++;
                                        this.rect_cnt++;
                                        var obj = new Object;
                                        obj = JSON.parse(c);
                                        this.ele["rect"+this.rect_cnt] = [
                                            '<rect class="drawnObject" id="object'+this.object_cnt+'" fill="none" x="'+(obj.x/this.cm)*this.px+'" y="'+(obj.y/this.cm)*this.px+'" width="'+(obj.cx/this.cm)*this.px+'" height="'+(obj.cy/this.cm)*this.px+'" fill-opacity="1" stroke-opacity="1" stroke-width="1" stroke="#41719c"></rect>'
                                        ]
                                        this.abcd="";
                                    }else if(child.attributes[0].nodeValue == "ellipse"){
                                        var tmp = JSON.stringify(this.ele);
                                        if(tmp.indexOf( (((this.cx/this.cm)*this.px)/2) + ((this.x/this.cm)*this.px) ) != -1)
                                            continue;
                                        this.object_cnt++;
                                        this.ellipse_cnt++;
                                        var obj = new Object;
                                        obj = JSON.parse(c);
                                        var cx = (((obj.cx/this.cm)*this.px)/2) + ((obj.x/this.cm)*this.px);
                                        var cy = (((obj.cy/this.cm)*this.px)/2)+((obj.y/this.cm)*this.px);
                                        this.ele["ellipse"+this.ellipse_cnt] = [
                                            '<ellipse class="drawnObject" id="object'+this.object_cnt+'" fill="none" cx="'+cx+'" cy="'+cy+'" rx="'+(((obj.cx/this.cm)*this.px)/2)+'" ry="'+(((obj.cy/this.cm)*this.px)/2)+'" fill-opacity="1" stroke-opacity="1" stroke-width="1" stroke="#41719c"></ellipse>'
                                        ]
                                        this.abcd="";
                                    }
                                }
                                else{
                                    continue;
                                }
                            }
                        }
					}
				}
				if(childName == "a:srgbClr"){
					if(child.parentNode.parentNode.nodeName != "a:ln"){
						this.abcd["valF"] = this.abcd.val;
						if(node.nextSibling == null){
							if(c.indexOf("rect") != -1){
								var tmp = JSON.stringify(this.ele);
								if(tmp.indexOf((this.abcd.x/this.cm)*this.px )!= -1)
									continue;
                                this.object_cnt++;
								this.rect_cnt++;
								var obj = new Object;
								obj = JSON.parse(c);
								this.ele["rect"+this.rect_cnt] = [
									'<rect class="drawnObject" id="object'+this.object_cnt+'" fill="#'+obj.val+'" x="'+(obj.x/this.cm)*this.px+'" y="'+(obj.y/this.cm)*this.px+'" width="'+(obj.cx/this.cm)*this.px+'" height="'+(obj.cy/this.cm)*this.px+'" fill-opacity="1" stroke-opacity="1" stroke-width="1" stroke="#41719c"></rect>'
								]
								this.abcd="";
							}else if(c.indexOf("ellipse") != -1){
								var tmp = JSON.stringify(this.ele);
								if(tmp.indexOf( (((this.cx/this.cm)*this.px)/2) + ((this.x/this.cm)*this.px) ) != -1)
									continue;
                                this.object_cnt++;
								this.ellipse_cnt++;
								var obj = new Object;
								obj = JSON.parse(c);
								var cx = (((obj.cx/this.cm)*this.px)/2) + ((obj.x/this.cm)*this.px);
								var cy = (((obj.cy/this.cm)*this.px)/2)+((obj.y/this.cm)*this.px);
								this.ele["ellipse"+this.ellipse_cnt] = [
									'<ellipse class="drawnObject" id="object'+this.object_cnt+'" fill="#'+obj.val+'" cx="'+cx+'" cy="'+cy+'" rx="'+((obj.cx/this.cm)*this.px/2)+'" ry="'+(((obj.cy/this.cm)*this.px)/2)+'" fill-opacity="1" stroke-opacity="1" stroke-width="1" stroke="#41719c"></ellipse>'
								]
								this.abcd="";
							}
						}
					}else{
						if(c.indexOf("rect") != -1){
							var tmp = JSON.stringify(this.ele);
							if(tmp.indexOf((this.abcd.x/this.cm)*this.px )!= -1)
								continue;
							this.rect_cnt++;
                            this.object_cnt++;
							var obj = new Object;
							obj = JSON.parse(c);
							if(obj.valF == undefined){
								this.ele["rect"+this.rect_cnt] = [
									'<rect class="drawnObject" id="object'+this.object_cnt+'" fill="#5b9bd5"  x="'+(obj.x/this.cm)*this.px+'" y="'+(obj.y/this.cm)*this.px+'"  width="'+(obj.cx/this.cm)*this.px+'" height="'+(obj.cy/this.cm)*this.px+'" fill-opacity="1" stroke-opacity="1" stroke-width="'+(obj.w/this.cm)*this.px+'" stroke="#'+obj.val+'"></rect>'
								]
								this.abcd="";
							}else{
								this.ele["rect"+this.rect_cnt] = [
									'<rect class="drawnObject" id="object'+this.object_cnt+'" fill="#'+obj.valF+'"  x="'+(obj.x/this.cm)*this.px+'" y="'+(obj.y/this.cm)*this.px+'" width="'+(obj.cx/this.cm)*this.px+'" height="'+(obj.cy/this.cm)*this.px+'" fill-opacity="1" stroke-opacity="1" stroke-width="'+(obj.w/this.cm)*this.px+'" stroke="#'+obj.val+'"></rect>'
								]
								this.abcd="";
							}
						}else if(c.indexOf("ellipse") != -1){
							var tmp = JSON.stringify(this.ele);
							if(tmp.indexOf( (((this.cx/this.cm)*this.px)/2) + ((this.x/this.cm)*this.px) ) != -1)
								continue;
                            this.object_cnt++;
							this.ellipse_cnt++;
							var obj = new Object;
							obj = JSON.parse(c);
							var cx = (((obj.cx/this.cm)*this.px)/2) + ((obj.x/this.cm)*this.px);
							var cy = (((obj.cy/this.cm)*this.px)/2)+((obj.y/this.cm)*this.px);
							if(obj.valF == undefined){
								this.ele["ellipse"+this.ellipse_cnt] = [
									'<ellipse class="drawnObject" id="object'+this.object_cnt+'" fill="#5b9bd5" cx="'+cx+'" cy="'+cy+'" rx="'+(((obj.cx/this.cm)*this.px)/2)+'" ry="'+(((obj.cy/this.cm)*this.px)/2)+'" fill-opacity="1" stroke-opacity="1" stroke-width="'+(obj.w/this.cm)*this.px+'" stroke="#"+obj.val+""></ellipse>'
								]
								this.abcd="";
							}else{
								this.ele["ellipse"+this.ellipse_cnt] = [
									'<ellipse class="drawnObject" id="object'+this.object_cnt+'"  fill="#'+obj.valF+'" cx="'+cx+'" cy="'+cy+'" rx="'+(((obj.cx/this.cm)*this.px)/2)+'" ry="'+(((obj.cy/this.cm)*this.px)/2)+'" fill-opacity="1" stroke-opacity="1" stroke-width="'+(obj.w/this.cm)*this.px+'" stroke="#"+obj.val+""></ellipse>'
								]
								this.abcd="";
							}
						}
					}
				}
				if(childName=="a:tailEnd"){
					if(this.abcd.type == "arrow" || this.abcd.type == "triangle"){
						var tmp = JSON.stringify(this.ele);
						if(tmp.indexOf( (( this.abcd.x/this.cm+this.abcd.cx/this.cm)*this.px)) != -1)
							continue;
						this.arrow_cnt++;
                        this.object_cnt++;
						var obj = new Object;
						obj = JSON.parse(c);
						if(c.indexOf("flipH") != -1){
							var start_x = ((obj.x/this.cm+obj.cx/this.cm)*this.px);
							var start_y = ((obj.y)/this.cm)*this.px;
							var end_x = ((obj.x)/this.cm)*this.px;
							var end_y = ((obj.y/this.cm+obj.cy/this.cm)*this.px);
							this.ele["arrow"+this.arrow_cnt] = [
								'<path class="drawnObject" id="object'+this.object_cnt+'" fill="#5b9bd5" stroke="#5b9bd5" d="M'+start_x+','+start_y+' L'+end_x+','+end_y+' M'+end_x+','+end_y+' L'+(end_x+4)+','+(end_y-8)+' '+(end_x+10)+','+(end_y-1)+'" ></path>'
							]
						}else if(c.indexOf("flipV") != -1){
							var start_x = ((obj.x)/this.cm)*this.px;
							var start_y = ((obj.y/this.cm+obj.cy/this.cm)*this.px);
							var end_x = ((obj.x/this.cm+obj.cx/this.cm)*this.px);
							var end_y = ((obj.y)/this.cm)*this.px;
							this.ele["arrow"+this.arrow_cnt] = [
								'<path class="drawnObject" id="object'+this.object_cnt+'" fill="#5b9bd5" stroke="#5b9bd5" d="M'+start_x+','+start_y+' L'+end_x+','+end_y+' M'+end_x+','+end_y+' L'+(end_x-4)+','+(end_y+8)+' '+(end_x-10)+','+(end_y+1)+'" ></path>'
							]
						}
					}
				}
			}
			else{}
		}
        if(node.nodeName == "a:t"){
            ;
        }else{
            this.parseDOMChildren(child);
        }
	}
	return this.ele;	
};

cjson.prototype.cjson_s = function (xmlDoc, rels, path, o_cnt) {
	this.file = path;
	this.rels = rels;
    this.object_cnt = o_cnt;
	return this.parseDOMChildren ( xmlDoc );
};