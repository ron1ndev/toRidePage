
;(function($,window,document,undefined){
	
	/* plugin namespace, prefix, default selector(s) */
	
	var pluginNS="mPageScroll2id",
		pluginPfx="mPS2id",
		defaultSelector=".m_PageScroll2id,a[rel~='m_PageScroll2id'],.page-scroll-to-id,a[rel~='page-scroll-to-id'],._ps2id",
	
	/* default options */
	
		defaults={
			/* scroll animation speed in milliseconds: Integer */
			scrollSpeed:1000,
			/* auto-adjust animation speed (according to target element position and window scroll): Boolean */
			autoScrollSpeed:true,
			/* scroll animation easing when page is idle: String */
			scrollEasing:"easeInOutQuint",
			/* scroll animation easing while page is scrolling: String */
			scrollingEasing:"easeOutQuint",
			/* end of page "smooth scrolling" (auto-adjust the scroll-to position when bottom elements are too short): Boolean */
			pageEndSmoothScroll:true,
			/* 
			page layout defines scrolling direction: String 
			values: "vertical", "horizontal", "auto" 
			*/
			layout:"vertical",
			/* extra space in pixels for the target element position: Integer */
			offset:0,
			/* highlight the main/default selectors or insert a different set: Boolean, String */
			highlightSelector:false,
			/* class of the clicked element: String */
			clickedClass:pluginPfx+"-clicked",
			/* class of the current target element: String */
			targetClass:pluginPfx+"-target",
			/* class of the highlighted element: String */
			highlightClass:pluginPfx+"-highlight",
			/* force a single highlighted element each time: Boolean */
			forceSingleHighlight:false,
			/* keep element highlighted until next (one element always stays highlighted): boolean */
			keepHighlightUntilNext:false,
			/* highlight elements according to their target and next target position (useful when targets have zero dimensions). Non "auto" layouts only: boolean */
			highlightByNextTarget:false,
			/* disable plugin below [x,y] screen size: boolean, integer, array ([x,y]) */
			disablePluginBelow:false,
			/* enable/disable click events for all selectors */
			clickEvents:true,
			/* append hash to URL/address bar */
			appendHash:false,
			/* user callback functions: fn */
			onStart:function(){},
			onComplete:function(){},
			/* enable/disable the default selector: Boolean */
			defaultSelector:false,
			/* highlight elements now and in the future */
			live:true,
			/* set specific live selector(s): String */
			liveSelector:false,
			/* set specific selector(s) that will be excluded from being handled by the plugin: String */
			excludeSelectors:false,
			/* enable encodeURI for links (enable if your links have href values with UTF-8 encoding): boolean */
			encodeLinks:false,
			/* enable to run the script inside iframe */
			inIframe:false
		},
	
	/* vars, constants */
	
		selector,opt,_init,_trigger,_clicked,_target,_to,_axis,_offset,_dataOffset,_totalInstances=0,_liveTimer,_speed,
		specialChars=/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
	
	/* 
	---------------
	methods 
	---------------
	*/
	
		methods={
			
			/* plugin initialization method */
			
			init:function(options){
				
				/* extend options, store each option in jquery data */
				
				var options=$.extend(true,{},defaults,options);
				
				$(document).data(pluginPfx,options);
				opt=$(document).data(pluginPfx);
				
				/* check/set jquery (deprecated) selector property if not defined */
				if(!this.selector){
					var selectorClass="__"+pluginPfx;
					this.each(function(){
						var el=$(this);
						if(!el.hasClass(selectorClass)){
							el.addClass(selectorClass);
						}
					});
					this.selector="."+selectorClass;
				}
				
				/* live selector */
				
				if(opt.liveSelector) this.selector+=","+opt.liveSelector;
				
				/* set selector */
				
				selector=(!selector) ? this.selector : selector+","+this.selector;
				
				if(opt.defaultSelector){
					if(typeof $(selector)!=="object" || $(selector).length===0){
						selector=defaultSelector;
					}
				}
				
				/* plugin events */
				
				if(opt.clickEvents){
					$(document)
					
					.off("."+pluginPfx)
					
					.on("click."+pluginPfx,selector,function(e){
						if(functions._isDisabled.call(null)){
							functions._removeClasses.call(null);
							return;
						}
						var $this=$(this),
							href=$this.attr("href"),
							hrefProp=$this.prop("href").baseVal || $this.prop("href");
						if(opt.excludeSelectors && $this.is(opt.excludeSelectors)){ //excluded selectors
							return;
						}
						if(href && href.indexOf("#/")!==-1){
							return;
						}
						functions._reset.call(null);
						_dataOffset=$this.data("ps2id-offset") || 0;
						if(functions._isValid.call(null,href,hrefProp) && functions._findTarget.call(null,href)){
							e.preventDefault();
							_trigger="selector";
							_clicked=$this;
							functions._setClasses.call(null,true);
							functions._scrollTo.call(null);
						}
					});
				}
				
				$(window)
				
				.off("."+pluginPfx)
				
				.on("scroll."+pluginPfx+" resize."+pluginPfx,function(){
					if(functions._isDisabled.call(null)){
						functions._removeClasses.call(null);
						return;
					}
					var targets=$("._"+pluginPfx+"-t");
					targets.each(function(i){
						var t=$(this),id=t.attr("id"),
							h=functions._findHighlight.call(null,id);
						functions._setClasses.call(null,false,t,h);
						if(i==targets.length-1){functions._extendClasses.call(null);}
					});
				});
				
				/* plugin has initialized */
				
				_init=true;
				
				/* setup selectors, target elements, basic plugin classes etc. */
				
				functions._setup.call(null);
				
				/* 
				monitor for elements matching the current highlight selector and call plugin setup when found (now and in the future) 
				to manually enable/disable: $(document).data("mPS2id").live=boolean 
				*/
				
				functions._live.call(null);
			},
			
			/* scrollTo method */
			
			scrollTo:function(id,options){
				if(functions._isDisabled.call(null)){
					functions._removeClasses.call(null);
					return;
				}
				if(id && typeof id!=="undefined"){
					functions._isInit.call(null);
					var defaults={
							layout:opt.layout,
							offset:opt.offset,
							clicked:false
						},
						options=$.extend(true,{},defaults,options);
					functions._reset.call(null);
					_axis=options.layout;
					_offset=options.offset;
					id=(id.indexOf("#")!==-1) ? id : "#"+id;
					if(functions._isValid.call(null,id) && functions._findTarget.call(null,id)){
						_trigger="scrollTo";
						_clicked=options.clicked;
						if(_clicked){
							functions._setClasses.call(null,true);
						}
						functions._scrollTo.call(null);
					}
				}
			},
			
			/* destroy method */
			
			destroy:function(){
				$(window).off("."+pluginPfx);
				$(document).off("."+pluginPfx).removeData(pluginPfx);
				$("._"+pluginPfx+"-t").removeData(pluginPfx);
				functions._removeClasses.call(null,true);
			}
		},
	
	/* 
	---------------
	functions
	---------------
	*/
	
		functions={
			
			/* checks if screen size ([x,y]) is below the value(s) set in disablePluginBelow option */
			
			_isDisabled:function(){
				var e=window,a="inner",
					val=opt.disablePluginBelow instanceof Array ? [opt.disablePluginBelow[0] || 0,opt.disablePluginBelow[1] || 0] : [opt.disablePluginBelow || 0,0];
				if(!("innerWidth" in window )){
					a="client";
					e=document.documentElement || document.body;
				}
				return e[a+"Width"]<=val[0] || e[a+"Height"]<=val[1];
			},
			
			/* checks if href attribute is valid */
			
			_isValid:function(href,hrefProp){
				if(!href){
					return;
				}
				hrefProp=(!hrefProp) ? href : hrefProp;
				var str=(hrefProp.indexOf("#/")!==-1) ? hrefProp.split("#/")[0] : hrefProp.split("#")[0],
					wloc=!opt.inIframe && window.location !== window.parent.location ? window.parent.location : window.location,
					loc=wloc.toString().split("#")[0];
				return href!=="#" && href.indexOf("#")!==-1 && (str==="" || decodeURIComponent(str)===decodeURIComponent(loc));
			},
			
			/* setup selectors, target elements, basic plugin classes etc. */
			
			_setup:function(){
				var el=functions._highlightSelector(),i=1,tp=0;
				return $(el).each(function(){
					var $this=$(this),href=$this.attr("href"),hrefProp=$this.prop("href").baseVal || $this.prop("href");
					if(functions._isValid.call(null,href,hrefProp)){
						if(opt.excludeSelectors && $this.is(opt.excludeSelectors)){ //excluded selectors
							return;
						}
						var id=(href.indexOf("#/")!==-1) ? href.split("#/")[1] : href.substring(href.indexOf('#')+1), //we're not using str.split("#")[1] because we want only the first occurrence of # in case the id has # in its actual name 
							t=specialChars.test(id) ? $(document.getElementById(id)) : $("#"+id); //fix bug with special characters like %, ?, & etc. in selector 
						if(t.length>0){
							if(opt.highlightByNextTarget){
								if(t!==tp){
									if(!tp){t.data(pluginPfx,{tn:"0"});}else{tp.data(pluginPfx,{tn:t});}
									tp=t;
								}
							}
							if(!t.hasClass("_"+pluginPfx+"-t")){
								t.addClass("_"+pluginPfx+"-t");
							}
							t.data(pluginPfx,{i:i});
							if(!$this.hasClass("_"+pluginPfx+"-h")){
								$this.addClass("_"+pluginPfx+"-h");
							}
							var h=functions._findHighlight.call(null,id);
							functions._setClasses.call(null,false,t,h);
							_totalInstances=i;
							i++
							if(i==$(el).length){functions._extendClasses.call(null);}
						}
					}
				});
			},
			
			/* returns the highlight selector */
			
			_highlightSelector:function(){
				return (opt.highlightSelector && opt.highlightSelector!=="") ? opt.highlightSelector : selector;
			},
			
			/* finds the target element */
			
			_findTarget:function(str){
				var val=(str.indexOf("#/")!==-1) ? str.split("#/")[1] : str.substring(str.indexOf('#')+1), //we're not using str.split("#")[1] because we want only the first occurrence of # in case the id has # in its actual name 
					el=specialChars.test(val) ? $(document.getElementById(val)) : $("#"+val); //fix bug with special characters like %, ?, & etc. in selector 
				if(el.length<1 || el.css("position")==="fixed"){
					if(val==="top"){
						el=$("body");
					}else{
						return;
					}
				}
				_target=el;
				if(!_axis){
					_axis=opt.layout;
				}
				_offset=functions._setOffset.call(null);
				_to=[(el.offset().top-_offset[0]).toString(),(el.offset().left-_offset[1]).toString()]; 
				_to[0]=(_to[0]<0) ? 0 : _to[0];
				_to[1]=(_to[1]<0) ? 0 : _to[1];
				return _to;
			},
			
			/* sets the offset value (pixels, objects etc.) */
			
			_setOffset:function(){
				if(!_offset){
					_offset=(opt.offset) ? opt.offset : 0;
				}
				if(_dataOffset){
					_offset=_dataOffset;
				}
				var val,obj,y,x;
				switch(typeof _offset){
					case "object":
					case "string":
						val=[(_offset["y"]) ? _offset["y"] : _offset,(_offset["x"]) ? _offset["x"] : _offset];
						obj=[(val[0] instanceof jQuery) ? val[0] : $(val[0]),(val[1] instanceof jQuery) ? val[1] : $(val[1])];
						if(obj[0].length>0){ // js/jquery object
							y=obj[0].height();
							if(obj[0].css("position")==="fixed"){ // include position for fixed elements
								y+=obj[0][0].offsetTop;
							}
						}else if(!isNaN(parseFloat(val[0])) && isFinite(val[0])){ // numeric string
							y=parseInt(val[0]);
						}else{
							y=0; // non-existing value
						}
						if(obj[1].length>0){ // js/jquery object
							x=obj[1].width();
							if(obj[1].css("position")==="fixed"){ // include position for fixed elements
								x+=obj[1][0].offsetLeft;
							}
						}else if(!isNaN(parseFloat(val[1])) && isFinite(val[1])){ // numeric string
							x=parseInt(val[1]);
						}else{
							x=0; // non-existing value
						}
						break;
					case "function":
						val=_offset.call(null); // function (single value or array)
						if(val instanceof Array){
							y=val[0];
							x=val[1];
						}else{
							y=x=val;
						}
						break;
					default:
						y=x=parseInt(_offset); // number
				}
				return [y,x];
			},
			
			/* finds the element that should be highlighted */
			
			_findHighlight:function(id){
				var wLoc=!opt.inIframe && window.location !== window.parent.location ? window.parent.location : window.location,
					loc=wLoc.toString().split("#")[0],
					locPath=wLoc.pathname;
				if(loc.indexOf("'")!==-1) loc=loc.replace("'","\\'");
				if(locPath.indexOf("'")!==-1) locPath=locPath.replace("'","\\'");
				loc=decodeURIComponent(loc);
				locPath=decodeURIComponent(locPath);
				if(opt.encodeLinks){
					var locEnc=encodeURI(loc).toLowerCase(),locPathEnc=encodeURI(locPath).toLowerCase();
					return $("._"+pluginPfx+"-h[href='#"+id+"'],._"+pluginPfx+"-h[href='"+loc+"#"+id+"'],._"+pluginPfx+"-h[href='"+locPath+"#"+id+"'],._"+pluginPfx+"-h[href='#/"+id+"'],._"+pluginPfx+"-h[href='"+loc+"#/"+id+"'],._"+pluginPfx+"-h[href='"+locPath+"#/"+id+"'],._"+pluginPfx+"-h[href='"+locEnc+"#/"+id+"'],._"+pluginPfx+"-h[href='"+locEnc+"#"+id+"'],._"+pluginPfx+"-h[href='"+locPathEnc+"#/"+id+"'],._"+pluginPfx+"-h[href='"+locPathEnc+"#"+id+"']");
				}else{
					return $("._"+pluginPfx+"-h[href='#"+id+"'],._"+pluginPfx+"-h[href='"+loc+"#"+id+"'],._"+pluginPfx+"-h[href='"+locPath+"#"+id+"'],._"+pluginPfx+"-h[href='#/"+id+"'],._"+pluginPfx+"-h[href='"+loc+"#/"+id+"'],._"+pluginPfx+"-h[href='"+locPath+"#/"+id+"']");
				}
			},
			
			/* sets plugin classes */
			
			_setClasses:function(c,t,h){
				var cc=opt.clickedClass,tc=opt.targetClass,hc=opt.highlightClass;
				if(c && cc && cc!==""){
					$("."+cc).removeClass(cc);
					_clicked.addClass(cc);
				}else if(t && tc && tc!=="" && h && hc && hc!==""){
					if(functions._currentTarget.call(null,t)){
						t.addClass(tc);
						h.addClass(hc);
					}else{
						if(!opt.keepHighlightUntilNext || $("."+hc).length>1){
							t.removeClass(tc);
							h.removeClass(hc);
						}
					}
				}
			},
			
			/* extends plugin classes */
			
			_extendClasses:function(){
				var tc=opt.targetClass,hc=opt.highlightClass,
					$tc=$("."+tc),$hc=$("."+hc),ftc=tc+"-first",ltc=tc+"-last",fhc=hc+"-first",lhc=hc+"-last";
				$("._"+pluginPfx+"-t").removeClass(ftc+" "+ltc);
				$("._"+pluginPfx+"-h").removeClass(fhc+" "+lhc);
				if(!opt.forceSingleHighlight){
					$tc.slice(0,1).addClass(ftc).end().slice(-1).addClass(ltc);
					$hc.slice(0,1).addClass(fhc).end().slice(-1).addClass(lhc);
				}else{
					if(opt.keepHighlightUntilNext && $tc.length>1){
						$tc.slice(0,1).removeClass(tc); $hc.slice(0,1).removeClass(hc);
					}else{
						$tc.slice(1).removeClass(tc); $hc.slice(1).removeClass(hc);
					}
				}
			},
			
			/* removes plugin classes */
			
			_removeClasses:function(destroy){
				$("."+opt.clickedClass).removeClass(opt.clickedClass);
				$("."+opt.targetClass).removeClass(opt.targetClass+" "+opt.targetClass+"-first "+opt.targetClass+"-last");
				$("."+opt.highlightClass).removeClass(opt.highlightClass+" "+opt.highlightClass+"-first "+opt.highlightClass+"-last");
				if(destroy){
					$("._"+pluginPfx+"-t").removeClass("_"+pluginPfx+"-t");
					$("._"+pluginPfx+"-h").removeClass("_"+pluginPfx+"-h");
				}
			},
			
			/* checks if target element is in viewport */
			
			_currentTarget:function(t){
				if(!t.data(pluginPfx)) return; //handle Uncaught TypeError (undefined data)
				var o=opt["target_"+t.data(pluginPfx).i],
					dataTarget=t.data("ps2id-target"),
					rect=dataTarget && $(dataTarget)[0] ? $(dataTarget)[0].getBoundingClientRect() : t[0].getBoundingClientRect();
				if(typeof o!=="undefined"){
					var y=t.offset().top,x=t.offset().left,
						from=(o.from) ? o.from+y : y,to=(o.to) ? o.to+y : y,
						fromX=(o.fromX) ? o.fromX+x : x,toX=(o.toX) ? o.toX+x : x;
					return(
						rect.top >= to && rect.top <= from && 
						rect.left >= toX && rect.left <= fromX
					);
				}else{
					var wh=$(window).height(),ww=$(window).width(),
						th=dataTarget ? $(dataTarget).height() : t.height(),tw=dataTarget ? $(dataTarget).width() : t.width(),
						base=1+(th/wh),
						top=base,bottom=(th<wh) ? base*(wh/th) : base,
						baseX=1+(tw/ww),
						left=baseX,right=(tw<ww) ? baseX*(ww/tw) : baseX,
						val=[rect.top <= wh/top,rect.bottom >= wh/bottom,rect.left <= ww/left,rect.right >= ww/right];
					if(opt.highlightByNextTarget){
						var tn=t.data(pluginPfx).tn;
						if(tn){
							var rectn=tn[0].getBoundingClientRect();
							if(opt.layout==="vertical"){
								val=[rect.top <= wh/2,rectn.top > wh/2,1,1];
							}else if(opt.layout==="horizontal"){
								val=[1,1,rect.left <= ww/2,rectn.left > ww/2];
							}
						}
					}
					return(val[0] && val[1] && val[2] && val[3]);
				}
			},
			
			/* scrolls the page */
			
			_scrollTo:function(){
				_speed=functions._scrollSpeed.call(null);
				_to=(opt.pageEndSmoothScroll) ? functions._pageEndSmoothScroll.call(null) : _to;
				var _scrollable=$("html,body"),
					speed=(opt.autoScrollSpeed) ? functions._autoScrollSpeed.call(null) : _speed,
					easing=(_scrollable.is(":animated")) ? opt.scrollingEasing : opt.scrollEasing,
					_t=$(window).scrollTop(),_l=$(window).scrollLeft();
				switch(_axis){
					case "horizontal":
						if(_l!=_to[1]){
							functions._callbacks.call(null,"onStart");
							_scrollable.stop().animate({scrollLeft:_to[1]},speed,easing).promise().then(function(){
								functions._callbacks.call(null,"onComplete");
							});
						}
						break;
					case "auto":
						if(_t!=_to[0] || _l!=_to[1]){
							functions._callbacks.call(null,"onStart");
							if(navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)){ // mobile fix
								var left;
								_scrollable.stop().animate({pageYOffset:_to[0],pageXOffset:_to[1]},{
								    duration:speed,
								    easing:easing,
								    step:function(now,fx){
								        if(fx.prop=='pageXOffset'){
								            left=now;
								        }else if(fx.prop=='pageYOffset'){
								            window.scrollTo(left,now);
								        }
								    }
								}).promise().then(function(){
									functions._callbacks.call(null,"onComplete");
								});
							}else{
								_scrollable.stop().animate({scrollTop:_to[0],scrollLeft:_to[1]},speed,easing).promise().then(function(){
									functions._callbacks.call(null,"onComplete");
								});
							}
						}
						break;
					default:
						if(_t!=_to[0]){
							functions._callbacks.call(null,"onStart");
							_scrollable.stop().animate({scrollTop:_to[0]},speed,easing).promise().then(function(){
								functions._callbacks.call(null,"onComplete");
							});
						}
				}
			},
			
			/* sets end of page "smooth scrolling" position */
			
			_pageEndSmoothScroll:function(){
				var _dh=$(document).height(),_dw=$(document).width(),
					_wh=$(window).height(),_ww=$(window).width();
				return [((_dh-_to[0])<_wh) ? _dh-_wh : _to[0],((_dw-_to[1])<_ww) ? _dw-_ww : _to[1]];
			},
			
			/* sets animation speed (link-specific speed via ps2id-speed-VALUE class on link or link's parent) */
			
			_scrollSpeed:function(){
				var speed=opt.scrollSpeed;
				if(_clicked && _clicked.length){
					_clicked.add(_clicked.parent()).each(function(){
						var $this=$(this);
						if($this.attr("class")){
							var clickedClasses=$this.attr("class").split(" ");
							for(var index in clickedClasses){
								if(String(clickedClasses[index]).match(/^ps2id-speed-\d+$/)){
									speed=clickedClasses[index].split("ps2id-speed-")[1];
									break;
								}
							}
						}
					});
				}
				return parseInt(speed);
			},
			
			/* sets the auto-adjusted animation speed */
			
			_autoScrollSpeed:function(){
				var _t=$(window).scrollTop(),_l=$(window).scrollLeft(),
					_h=$(document).height(),_w=$(document).width(),
					val=[
						_speed+((_speed*(Math.floor((Math.abs(_to[0]-_t)/_h)*100)))/100),
						_speed+((_speed*(Math.floor((Math.abs(_to[1]-_l)/_w)*100)))/100)
					];
				return Math.max.apply(Math,val);
			},
			
			/* user callback functions */
			
			_callbacks:function(c){
				if(!opt){
					return;
				}
				this[pluginPfx]={
					trigger:_trigger,clicked:_clicked,target:_target,scrollTo:{y:_to[0],x:_to[1]}
				};
				switch(c){
					case "onStart":
						//append hash to URL/address bar
						if(opt.appendHash && window.history && window.history.pushState && _clicked && _clicked.length){
							var hval=_clicked.attr("href"),h="#"+(hval.substring(hval.indexOf('#')+1)); //we're not using hval.split("#")[1] because we want only the first occurrence of # in case the id has # in its actual name 
							if(h!==window.location.hash) history.pushState("","",h);
						}
						opt.onStart.call(null,this[pluginPfx]);
						break;
					case "onComplete":
						opt.onComplete.call(null,this[pluginPfx]);
						break;
				}
			},
			
			/* resets/clears vars and constants */
			
			_reset:function(){
				_axis=_offset=_dataOffset=false;
			},
			
			/* checks if plugin has initialized */
			
			_isInit:function(){
				if(!_init){
					methods.init.apply(this);
				}
			},
			
			/* live fn */
			
			_live:function(){
				_liveTimer=setTimeout(function(){
					if(opt.live){
						if($(functions._highlightSelector()).length!==_totalInstances){
							functions._setup.call(null);
						}
					}else{
						if(_liveTimer){clearTimeout(_liveTimer);}
					}
					functions._live.call(null);
				},1000);
			},
			
			/* extends jquery with custom easings (as jquery ui) */
			
			_easing:function(){
				$.easing.easeInQuad=$.easing.easeInQuad || function(x){
					return x*x;
				};
				$.easing.easeOutQuad=$.easing.easeOutQuad || function(x){
					return 1-(1-x)*(1-x);
				};
				$.easing.easeInOutQuad=$.easing.easeInOutQuad || function(x){
					return x<0.5 ? 2*x*x : 1-Math.pow(-2*x+2,2)/2;
				};
				$.easing.easeInCubic=$.easing.easeInCubic || function(x){
					return x*x*x;
				};
				$.easing.easeOutCubic=$.easing.easeOutCubic || function(x){
					return 1-Math.pow(1-x,3);
				};
				$.easing.easeInOutCubic=$.easing.easeInOutCubic || function(x){
					return x<0.5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2;
				};
				$.easing.easeInQuart=$.easing.easeInQuart || function(x){
					return x*x*x*x;
				};
				$.easing.easeOutQuart=$.easing.easeOutQuart || function(x){
					return 1-Math.pow(1-x,4);
				};
				$.easing.easeInOutQuart=$.easing.easeInOutQuart || function(x){
					return x<0.5 ? 8*x*x*x*x : 1-Math.pow(-2*x+2,4)/2;
				};
				$.easing.easeInQuint=$.easing.easeInQuint || function(x){
					return x*x*x*x*x;
				};
				$.easing.easeOutQuint=$.easing.easeOutQuint || function(x){
					return 1-Math.pow(1-x,5);
				};
				$.easing.easeInOutQuint=$.easing.easeInOutQuint || function(x){
					return x<0.5 ? 16*x*x*x*x*x : 1-Math.pow(-2*x+2,5)/2;
				};
				$.easing.easeInExpo=$.easing.easeInExpo || function(x){
					return x===0 ? 0 : Math.pow(2,10*x-10);
				};
				$.easing.easeOutExpo=$.easing.easeOutExpo || function(x){
					return x===1 ? 1 : 1-Math.pow(2,-10*x);
				};
				$.easing.easeInOutExpo=$.easing.easeInOutExpo || function(x){
					return x===0 ? 0 : x===1 ? 1 : x<0.5 ? Math.pow(2,20*x-10)/2 : (2-Math.pow(2,-20*x+10))/2;
				};
				$.easing.easeInSine=$.easing.easeInSine || function(x){
					return 1-Math.cos(x*Math.PI/2);
				};
				$.easing.easeOutSine=$.easing.easeOutSine || function(x){
					return Math.sin(x*Math.PI/2);
				};
				$.easing.easeInOutSine=$.easing.easeInOutSine || function(x){
					return -(Math.cos(Math.PI*x)-1)/2;
				};
				$.easing.easeInCirc=$.easing.easeInCirc || function(x){
					return 1-Math.sqrt(1-Math.pow(x,2));
				};
				$.easing.easeOutCirc=$.easing.easeOutCirc || function(x){
					return Math.sqrt(1-Math.pow(x-1,2));
				};
				$.easing.easeInOutCirc=$.easing.easeInOutCirc || function(x){
					return x<0.5 ? (1-Math.sqrt(1-Math.pow(2*x,2)))/2 : (Math.sqrt(1-Math.pow(-2*x+2,2))+1)/2;
				};
				$.easing.easeInElastic=$.easing.easeInElastic || function(x){
					return x===0 ? 0 : x===1 ? 1 : -Math.pow(2,10*x-10)*Math.sin((x*10-10.75)*((2*Math.PI)/3));
				};
				$.easing.easeOutElastic=$.easing.easeOutElastic || function(x){
					return x===0 ? 0 : x===1 ? 1 : Math.pow(2,-10*x)*Math.sin((x*10-0.75)*((2*Math.PI)/3))+1;
				};
				$.easing.easeInOutElastic=$.easing.easeInOutElastic || function(x){
					return x===0 ? 0 : x===1 ? 1 : x<0.5 ? -(Math.pow(2,20*x-10)*Math.sin((20*x-11.125)*((2*Math.PI)/4.5)))/2 : Math.pow(2,-20*x+10)*Math.sin((20*x-11.125)*((2*Math.PI)/4.5))/2+1;
				};
				$.easing.easeInBack=$.easing.easeInBack || function(x){
					return (1.70158+1)*x*x*x-1.70158*x*x;
				};
				$.easing.easeOutBack=$.easing.easeOutBack || function(x){
					return 1+(1.70158+1)*Math.pow(x-1,3)+1.70158*Math.pow(x-1,2);
				};
				$.easing.easeInOutBack=$.easing.easeInOutBack || function(x){
					return x<0.5 ? (Math.pow(2*x,2)*(((1.70158*1.525)+1)*2*x-(1.70158*1.525)))/2 : (Math.pow(2*x-2,2)*(((1.70158*1.525)+1)*(x*2-2)+(1.70158*1.525))+2)/2;
				};
				$.easing.easeInBounce=$.easing.easeInBounce || function(x){
					return 1-__bounceOut(1-x);
				};
				$.easing.easeOutBounce=$.easing.easeOutBounce || __bounceOut;
				$.easing.easeInOutBounce=$.easing.easeInOutBounce || function(x){
					return x<0.5 ? (1-__bounceOut(1-2*x))/2 : (1+__bounceOut(2*x-1))/2;
				};
				function __bounceOut(x){
					var n1=7.5625,d1=2.75;
					if(x<1/d1){
						return n1*x*x;
					}else if(x<2/d1){
						return n1*(x-=(1.5/d1))*x+.75;
					}else if(x<2.5/d1){
						return n1*(x-=(2.25/d1))*x+.9375;
					}else{
						return n1*(x-=(2.625/d1))*x+.984375;
					}
				}
			}
		}
		
	/* 
	---------------
	plugin setup 
	---------------
	*/
	
	/* extend jquery with custom easings */
	
	functions._easing.call();
	
	/* plugin constructor functions */
	
	$.fn[pluginNS]=function(method){
		if(methods[method]){
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method==="object" || !method){
			return methods.init.apply(this,arguments);
		}else{
			$.error("Method "+method+" does not exist");
		}
	};
	$[pluginNS]=function(method){
		if(methods[method]){
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method==="object" || !method){
			return methods.init.apply(this,arguments);
		}else{
			$.error("Method "+method+" does not exist");
		}
	};
	
	/* 
	allow setting plugin default options. 
	example: $.plugin_name.defaults.option_name="option_value"; 
	*/
	
	$[pluginNS].defaults=defaults;
	
})(jQuery,window,document);
    (function($){
        $(window).on("load",function(){
            $("a[rel='m_PageScroll2id']").mPageScroll2id();
        });
    })(jQuery);


    const link = document.querySelectorAll('.header__item');
    const menuBurg = document.querySelector('.header__menu');
    const burgerr = document.querySelector('.header__burger ');
    
    link.forEach(item=>{
        item.addEventListener('click',(e)=>{
            menuBurg.classList.remove('menu-active');
            burgerr.classList.remove('menu-active');
        })
    });







    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var isMobile = { Android: function () { return navigator.userAgent.match(/Android/i); }, BlackBerry: function () { return navigator.userAgent.match(/BlackBerry/i); }, iOS: function () { return navigator.userAgent.match(/iPhone|iPad|iPod/i); }, Opera: function () { return navigator.userAgent.match(/Opera Mini/i); }, Windows: function () { return navigator.userAgent.match(/IEMobile/i); }, any: function () { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); } };
    function isIE() {
        ua = navigator.userAgent;
        var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
        return is_ie;
    }
    if (isIE()) {
        document.querySelector('html').classList.add('ie');
    }
    if (isMobile.any()) {
        document.querySelector('html').classList.add('_touch');
    }
    
    function testWebP(callback) {
        var webP = new Image();
        webP.onload = webP.onerror = function () {
            callback(webP.height == 2);
        };
        webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    }
    testWebP(function (support) {
        if (support === true) {
            document.querySelector('html').classList.add('_webp');
        } else {
            document.querySelector('html').classList.add('_no-webp');
        }
    });
    
    function ibg() {
        if (isIE()) {
            let ibg = document.querySelectorAll("._ibg");
            for (var i = 0; i < ibg.length; i++) {
                if (ibg[i].querySelector('img') && ibg[i].querySelector('img').getAttribute('src') != null) {
                    ibg[i].style.backgroundImage = 'url(' + ibg[i].querySelector('img').getAttribute('src') + ')';
                }
            }
        }
    }
    ibg();
    
    window.addEventListener("load", function () {
        if (document.querySelector('.wrapper')) {
            setTimeout(function () {
                document.querySelector('.wrapper').classList.add('_loaded');
            }, 0);
        }
    });
    
    let unlock = true;
    
    //=================
    //ActionsOnHash
    if (location.hash) {
        const hsh = location.hash.replace('#', '');
        if (document.querySelector('.popup_' + hsh)) {
            popup_open(hsh);
        } else if (document.querySelector('div.' + hsh)) {
            _goto(document.querySelector('.' + hsh), 500, '');
        }
    }
    //=================
    //Menu
    let iconMenu = document.querySelector(".icon-menu");
    if (iconMenu != null) {
        let delay = 500;
        let menuBody = document.querySelector(".menu__body");
        iconMenu.addEventListener("click", function (e) {
            if (unlock) {
                body_lock(delay);
                iconMenu.classList.toggle("_active");
                menuBody.classList.toggle("_active");
            }
        });
    };
    function menu_close() {
        let iconMenu = document.querySelector(".icon-menu");
        let menuBody = document.querySelector(".menu__body");
        iconMenu.classList.remove("_active");
        menuBody.classList.remove("_active");
    }
    //=================
    //BodyLock
    function body_lock(delay) {
        let body = document.querySelector("body");
        if (body.classList.contains('_lock')) {
            body_lock_remove(delay);
        } else {
            body_lock_add(delay);
        }
    }
    function body_lock_remove(delay) {
        let body = document.querySelector("body");
        if (unlock) {
            let lock_padding = document.querySelectorAll("._lp");
            setTimeout(() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = '0px';
                }
                body.style.paddingRight = '0px';
                body.classList.remove("_lock");
            }, delay);
    
            unlock = false;
            setTimeout(function () {
                unlock = true;
            }, delay);
        }
    }
    function body_lock_add(delay) {
        let body = document.querySelector("body");
        if (unlock) {
            let lock_padding = document.querySelectorAll("._lp");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
            }
            body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
            body.classList.add("_lock");
    
            unlock = false;
            setTimeout(function () {
                unlock = true;
            }, delay);
        }
    }
    //=================
    // LettersAnimation
    let title = document.querySelectorAll('._letter-animation');
    if (title) {
        for (let index = 0; index < title.length; index++) {
            let el = title[index];
            let txt = el.innerHTML;
            let txt_words = txt.replace('  ', ' ').split(' ');
            let new_title = '';
            for (let index = 0; index < txt_words.length; index++) {
                let txt_word = txt_words[index];
                let len = txt_word.length;
                new_title = new_title + '<p>';
                for (let index = 0; index < len; index++) {
                    let it = txt_word.substr(index, 1);
                    if (it == ' ') {
                        it = '&nbsp;';
                    }
                    new_title = new_title + '<span>' + it + '</span>';
                }
                el.innerHTML = new_title;
                new_title = new_title + '&nbsp;</p>';
            }
        }
    }
    //=================
    //Tabs
    let tabs = document.querySelectorAll("._tabs");
    for (let index = 0; index < tabs.length; index++) {
        let tab = tabs[index];
        let tabs_items = tab.querySelectorAll("._tabs-item");
        let tabs_blocks = tab.querySelectorAll("._tabs-block");
        for (let index = 0; index < tabs_items.length; index++) {
            let tabs_item = tabs_items[index];
            tabs_item.addEventListener("click", function (e) {
                for (let index = 0; index < tabs_items.length; index++) {
                    let tabs_item = tabs_items[index];
                    tabs_item.classList.remove('_active');
                    tabs_blocks[index].classList.remove('_active');
                }
                tabs_item.classList.add('_active');
                tabs_blocks[index].classList.add('_active');
                e.preventDefault();
            });
        }
    }
    //=================
    //Spollers
    let spollers = document.querySelectorAll("._spoller");
    let spollersGo = true;
    if (spollers.length > 0) {
    
        function spollerCLick(e) {
            const spoller = e.target.classList.contains('_spoller') ? e.target : e.target.closest('._spoller');
            if (spollersGo) {
                spollersGo = false;
    
                if (spoller.closest('._spollers').classList.contains('_one')) {
                    let curent_spollers = spoller.closest('._spollers').querySelectorAll('._spoller');
                    for (let i = 0; i < curent_spollers.length; i++) {
                        let el = curent_spollers[i];
                        if (el != spoller) {
                            el.classList.remove('_active');
                            _slideUp(el.nextElementSibling);
                        }
                    }
                }
                console.log(spoller.nextElementSibling);
                spoller.classList.toggle('_active');
                _slideToggle(spoller.nextElementSibling);
    
                setTimeout(function () {
                    spollersGo = true;
                }, 500);
            }
        }
        function spollersInit() {
            for (let index = 0; index < spollers.length; index++) {
                const spoller = spollers[index];
                let spollerMax = spoller.getAttribute('data-max');
    
                if (spollerMax && window.innerWidth > spollerMax) {
                    if (spoller.classList.contains('_init')) {
                        spoller.classList.remove('_active');
                        spoller.classList.remove('_init');
                        spoller.nextElementSibling.style.cssText = '';
                        spoller.removeEventListener("click", spollerCLick);
                    }
                } else if (!spoller.classList.contains('_init')) {
                    spoller.classList.add('_init');
                    spoller.addEventListener("click", spollerCLick);
                }
            }
        }
        function spollersShowActive() {
            for (let index = 0; index < spollers.length; index++) {
                const spoller = spollers[index];
                if (spoller.classList.contains('_active')) {
                    _slideToggle(spoller.nextElementSibling);
                }
            }
        }
        window.addEventListener("resize", spollersInit);
    
        setTimeout(function () {
            spollersShowActive();
            spollersInit();
        }, 0);
    }
    //=================
    //Gallery
    let gallery = document.querySelectorAll('._gallery');
    if (gallery) {
        gallery_init();
    }
    function gallery_init() {
        for (let index = 0; index < gallery.length; index++) {
            const el = gallery[index];
            lightGallery(el, {
                counter: false,
                selector: 'a',
                download: false
            });
        }
    }
    //=================
    //SearchInList
    function search_in_list(input) {
        let ul = input.parentNode.querySelector('ul')
        let li = ul.querySelectorAll('li');
        let filter = input.value.toUpperCase();
    
        for (i = 0; i < li.length; i++) {
            let el = li[i];
            let item = el;
            txtValue = item.textContent || item.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                el.style.display = "";
            } else {
                el.style.display = "none";
            }
        }
    }
    //=================
    //DigiFormat
    function digi(str) {
        var r = str.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ");
        return r;
    }
    //=================
    //DiGiAnimate
    function digi_animate(digi_animate) {
        if (digi_animate.length > 0) {
            for (let index = 0; index < digi_animate.length; index++) {
                const el = digi_animate[index];
                const el_to = parseInt(el.innerHTML.replace(' ', ''));
                if (!el.classList.contains('_done')) {
                    digi_animate_value(el, 0, el_to, 1500);
                }
            }
        }
    }
    function digi_animate_value(el, start, end, duration) {
        var obj = el;
        var range = end - start;
        // no timer shorter than 50ms (not really visible any way)
        var minTimer = 50;
        // calc step time to show all interediate values
        var stepTime = Math.abs(Math.floor(duration / range));
    
        // never go below minTimer
        stepTime = Math.max(stepTime, minTimer);
    
        // get current time and calculate desired end time
        var startTime = new Date().getTime();
        var endTime = startTime + duration;
        var timer;
    
        function run() {
            var now = new Date().getTime();
            var remaining = Math.max((endTime - now) / duration, 0);
            var value = Math.round(end - (remaining * range));
            obj.innerHTML = digi(value);
            if (value == end) {
                clearInterval(timer);
            }
        }
    
        timer = setInterval(run, stepTime);
        run();
    
        el.classList.add('_done');
    }
    //=================
    //Popups
    let popup_link = document.querySelectorAll('._popup-link');
    let popups = document.querySelectorAll('.popup');
    for (let index = 0; index < popup_link.length; index++) {
        const el = popup_link[index];
        el.addEventListener('click', function (e) {
            if (unlock) {
                let item = el.getAttribute('href').replace('#', '');
                let video = el.getAttribute('data-video');
                popup_open(item, video);
            }
            e.preventDefault();
        })
    }
    for (let index = 0; index < popups.length; index++) {
        const popup = popups[index];
        popup.addEventListener("click", function (e) {
            if (!e.target.closest('.popup__body')) {
                popup_close(e.target.closest('.popup'));
            }
        });
    }
    function popup_open(item, video = '') {
        let activePopup = document.querySelectorAll('.popup._active');
        if (activePopup.length > 0) {
            popup_close('', false);
        }
        let curent_popup = document.querySelector('.popup_' + item);
        if (curent_popup && unlock) {
            if (video != '' && video != null) {
                let popup_video = document.querySelector('.popup_video');
                popup_video.querySelector('.popup__video').innerHTML = '<iframe src="https://www.youtube.com/embed/' + video + '?autoplay=1"  allow="autoplay; encrypted-media" allowfullscreen></iframe>';
            }
            if (!document.querySelector('.menu__body._active')) {
                body_lock_add(500);
            }
            curent_popup.classList.add('_active');
            history.pushState('', '', '#' + item);
        }
    }
    function popup_close(item, bodyUnlock = true) {
        if (unlock) {
            if (!item) {
                for (let index = 0; index < popups.length; index++) {
                    const popup = popups[index];
                    let video = popup.querySelector('.popup__video');
                    if (video) {
                        video.innerHTML = '';
                    }
                    popup.classList.remove('_active');
                }
            } else {
                let video = item.querySelector('.popup__video');
                if (video) {
                    video.innerHTML = '';
                }
                item.classList.remove('_active');
            }
            if (!document.querySelector('.menu__body._active') && bodyUnlock) {
                body_lock_remove(500);
            }
            history.pushState('', '', window.location.href.split('#')[0]);
        }
    }
    let popup_close_icon = document.querySelectorAll('.popup__close,._popup-close');
    if (popup_close_icon) {
        for (let index = 0; index < popup_close_icon.length; index++) {
            const el = popup_close_icon[index];
            el.addEventListener('click', function () {
                popup_close(el.closest('.popup'));
            })
        }
    }
    document.addEventListener('keydown', function (e) {
        if (e.code === 'Escape') {
            popup_close();
        }
    });
    
    //=================
    //SlideToggle
    let _slideUp = (target, duration = 500) => {
        target.style.transitionProperty = 'height, margin, padding';
        target.style.transitionDuration = duration + 'ms';
        target.style.height = target.offsetHeight + 'px';
        target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        window.setTimeout(() => {
            target.style.display = 'none';
            target.style.removeProperty('height');
            target.style.removeProperty('padding-top');
            target.style.removeProperty('padding-bottom');
            target.style.removeProperty('margin-top');
            target.style.removeProperty('margin-bottom');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
        }, duration);
    }
    let _slideDown = (target, duration = 500) => {
        target.style.removeProperty('display');
        let display = window.getComputedStyle(target).display;
        if (display === 'none')
            display = 'block';
    
        target.style.display = display;
        let height = target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        target.offsetHeight;
        target.style.transitionProperty = "height, margin, padding";
        target.style.transitionDuration = duration + 'ms';
        target.style.height = height + 'px';
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        window.setTimeout(() => {
            target.style.removeProperty('height');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
        }, duration);
    }
    let _slideToggle = (target, duration = 500) => {
        if (!target.classList.contains('_slide')) {
            target.classList.add('_slide');
            if (window.getComputedStyle(target).display === 'none') {
                return _slideDown(target, duration);
            } else {
                return _slideUp(target, duration);
            }
        }
    }
    //========================================
    //Wrap
    function _wrap(el, wrapper) {
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
    }
    //========================================
    //RemoveClasses
    function _removeClasses(el, class_name) {
        for (var i = 0; i < el.length; i++) {
            el[i].classList.remove(class_name);
        }
    }
    //========================================
    //IsHidden
    function _is_hidden(el) {
        return (el.offsetParent === null)
    }
    // ShowMore Beta ========================
    let moreBlocks = document.querySelectorAll('._more-block');
    if (moreBlocks.length > 0) {
        let wrapper = document.querySelector('.wrapper');
        for (let index = 0; index < moreBlocks.length; index++) {
            const moreBlock = moreBlocks[index];
            let items = moreBlock.querySelectorAll('._more-item');
            if (items.length > 0) {
                let itemsMore = moreBlock.querySelector('._more-link');
                let itemsContent = moreBlock.querySelector('._more-content');
                let itemsView = itemsContent.getAttribute('data-view');
                if (getComputedStyle(itemsContent).getPropertyValue("transition-duration") === '0s') {
                    itemsContent.style.cssText = "transition-duration: 1ms";
                }
                itemsMore.addEventListener("click", function (e) {
                    if (itemsMore.classList.contains('_active')) {
                        setSize();
                    } else {
                        setSize('start');
                    }
                    itemsMore.classList.toggle('_active');
                    e.preventDefault();
                });
    
                let isScrollStart;
                function setSize(type) {
                    let resultHeight;
                    let itemsContentHeight = 0;
                    let itemsContentStartHeight = 0;
    
                    for (let index = 0; index < items.length; index++) {
                        if (index < itemsView) {
                            itemsContentHeight += items[index].offsetHeight;
                        }
                        itemsContentStartHeight += items[index].offsetHeight;
                    }
                    resultHeight = (type === 'start') ? itemsContentStartHeight : itemsContentHeight;
                    isScrollStart = window.innerWidth - wrapper.offsetWidth;
                    itemsContent.style.height = `${resultHeight}px`;
                }
    
                itemsContent.addEventListener("transitionend", updateSize, false);
    
                function updateSize() {
                    let isScrollEnd = window.innerWidth - wrapper.offsetWidth;
                    if (isScrollStart === 0 && isScrollEnd > 0 || isScrollStart > 0 && isScrollEnd === 0) {
                        if (itemsMore.classList.contains('_active')) {
                            setSize('start');
                        } else {
                            setSize();
                        }
                    }
                }
                window.addEventListener("resize", function (e) {
                    if (!itemsMore.classList.contains('_active')) {
                        setSize();
                    } else {
                        setSize('start');
                    }
                });
                setSize();
            }
        }
    }
    //==RATING======================================
    const ratings = document.querySelectorAll('.rating');
    if (ratings.length > 0) {
        initRatings();
    }
    // Основная функция
    function initRatings() {
        let ratingActive, ratingValue;
        // "Бегаем" по всем рейтингам на странице
        for (let index = 0; index < ratings.length; index++) {
            const rating = ratings[index];
            initRating(rating);
        }
    
        // Инициализируем конкретный рейтинг
        function initRating(rating) {
            initRatingVars(rating);
    
            setRatingActiveWidth();
    
            if (rating.classList.contains('rating_set')) {
                setRating(rating);
            }
        }
    
        // Инициализайция переменных
        function initRatingVars(rating) {
            ratingActive = rating.querySelector('.rating__active');
            ratingValue = rating.querySelector('.rating__value');
        }
        // Изменяем ширину активных звезд
        function setRatingActiveWidth(index = ratingValue.innerHTML) {
            const ratingActiveWidth = index / 0.05;
            ratingActive.style.width = `${ratingActiveWidth}%`;
        }
        // Возможность указать оценку 
        function setRating(rating) {
            const ratingItems = rating.querySelectorAll('.rating__item');
            for (let index = 0; index < ratingItems.length; index++) {
                const ratingItem = ratingItems[index];
                ratingItem.addEventListener("mouseenter", function (e) {
                    // Обновление переменных
                    initRatingVars(rating);
                    // Обновление активных звезд
                    setRatingActiveWidth(ratingItem.value);
                });
                ratingItem.addEventListener("mouseleave", function (e) {
                    // Обновление активных звезд
                    setRatingActiveWidth();
                });
                ratingItem.addEventListener("click", function (e) {
                    // Обновление переменных
                    initRatingVars(rating);
    
                    if (rating.dataset.ajax) {
                        // "Отправить" на сервер
                        setRatingValue(ratingItem.value, rating);
                    } else {
                        // Отобразить указанную оцнку
                        ratingValue.innerHTML = index + 1;
                        setRatingActiveWidth();
                    }
                });
            }
        }
    
        async function setRatingValue(value, rating) {
            if (!rating.classList.contains('rating_sending')) {
                rating.classList.add('rating_sending');
    
                // Отправика данных (value) на сервер
                let response = await fetch('rating.json', {
                    method: 'GET',
    
                    //body: JSON.stringify({
                    //	userRating: value
                    //}),
                    //headers: {
                    //	'content-type': 'application/json'
                    //}
    
                });
                if (response.ok) {
                    const result = await response.json();
    
                    // Получаем новый рейтинг
                    const newRating = result.newRating;
    
                    // Вывод нового среднего результата
                    ratingValue.innerHTML = newRating;
    
                    // Обновление активных звезд
                    setRatingActiveWidth();
    
                    rating.classList.remove('rating_sending');
                } else {
                    alert("Ошибка");
    
                    rating.classList.remove('rating_sending');
                }
            }
        }
    }
    //========================================
    //Animate
    function animate({ timing, draw, duration }) {
        let start = performance.now();
        requestAnimationFrame(function animate(time) {
            // timeFraction изменяется от 0 до 1
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;
    
            // вычисление текущего состояния анимации
            let progress = timing(timeFraction);
    
            draw(progress); // отрисовать её
    
            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            }
    
        });
    }
    function makeEaseOut(timing) {
        return function (timeFraction) {
            return 1 - timing(1 - timeFraction);
        }
    }
    function makeEaseInOut(timing) {
        return function (timeFraction) {
            if (timeFraction < .5)
                return timing(2 * timeFraction) / 2;
            else
                return (2 - timing(2 * (1 - timeFraction))) / 2;
        }
    }
    function quad(timeFraction) {
        return Math.pow(timeFraction, 2)
    }
    function circ(timeFraction) {
        return 1 - Math.sin(Math.acos(timeFraction));
    }
    /*
    animate({
        duration: 1000,
        timing: makeEaseOut(quad),
        draw(progress) {
            window.scroll(0, start_position + 400 * progress);
        }
    });*/
    
    //Полифилы
    (function () {
        // проверяем поддержку
        if (!Element.prototype.closest) {
            // реализуем
            Element.prototype.closest = function (css) {
                var node = this;
                while (node) {
                    if (node.matches(css)) return node;
                    else node = node.parentElement;
                }
                return null;
            };
        }
    })();
    (function () {
        // проверяем поддержку
        if (!Element.prototype.matches) {
            // определяем свойство
            Element.prototype.matches = Element.prototype.matchesSelector ||
                Element.prototype.webkitMatchesSelector ||
                Element.prototype.mozMatchesSelector ||
                Element.prototype.msMatchesSelector;
        }
    })();
    //let btn = document.querySelectorAll('button[type="submit"],input[type="submit"]');
    let forms = document.querySelectorAll('form');
    if (forms.length > 0) {
        for (let index = 0; index < forms.length; index++) {
            const el = forms[index];
            el.addEventListener('submit', form_submit);
        }
    }
    async function form_submit(e) {
        let btn = e.target;
        let form = btn.closest('form');
        let error = form_validate(form);
        if (error == 0) {
            let formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
            let formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'GET';
            const message = form.getAttribute('data-message');
            const ajax = form.getAttribute('data-ajax');
            const test = form.getAttribute('data-test');
    
            //SendForm
            if (ajax) {
                e.preventDefault();
                let formData = new FormData(form);
                form.classList.add('_sending');
                let response = await fetch(formAction, {
                    method: formMethod,
                    body: formData
                });
                if (response.ok) {
                    let result = await response.json();
                    form.classList.remove('_sending');
                    if (message) {
                        popup_open(message + '-message');
                    }
                    form_clean(form);
                } else {
                    alert("Ошибка");
                    form.classList.remove('_sending');
                }
            }
            // If test
            if (test) {
                e.preventDefault();
                popup_open(message + '-message');
                form_clean(form);
            }
        } else {
            let form_error = form.querySelectorAll('._error');
            if (form_error && form.classList.contains('_goto-error')) {
                _goto(form_error[0], 1000, 50);
            }
            e.preventDefault();
        }
    }
    function form_validate(form) {
        let error = 0;
        let form_req = form.querySelectorAll('._req');
        if (form_req.length > 0) {
            for (let index = 0; index < form_req.length; index++) {
                const el = form_req[index];
                if (!_is_hidden(el)) {
                    error += form_validate_input(el);
                }
            }
        }
        return error;
    }
    function form_validate_input(input) {
        let error = 0;
        let input_g_value = input.getAttribute('data-value');
    
        if (input.getAttribute("name") == "email" || input.classList.contains("_email")) {
            if (input.value != input_g_value) {
                let em = input.value.replace(" ", "");
                input.value = em;
            }
            if (email_test(input) || input.value == input_g_value) {
                form_add_error(input);
                error++;
            } else {
                form_remove_error(input);
            }
        } else if (input.getAttribute("type") == "checkbox" && input.checked == false) {
            form_add_error(input);
            error++;
        } else {
            if (input.value == '' || input.value == input_g_value) {
                form_add_error(input);
                error++;
            } else {
                form_remove_error(input);
            }
        }
        return error;
    }
    function form_add_error(input) {
        input.classList.add('_error');
        input.parentElement.classList.add('_error');
    
        let input_error = input.parentElement.querySelector('.form__error');
        if (input_error) {
            input.parentElement.removeChild(input_error);
        }
        let input_error_text = input.getAttribute('data-error');
        if (input_error_text && input_error_text != '') {
            input.parentElement.insertAdjacentHTML('beforeend', '<div class="form__error">' + input_error_text + '</div>');
        }
    }
    function form_remove_error(input) {
        input.classList.remove('_error');
        input.parentElement.classList.remove('_error');
    
        let input_error = input.parentElement.querySelector('.form__error');
        if (input_error) {
            input.parentElement.removeChild(input_error);
        }
    }
    function form_clean(form) {
        let inputs = form.querySelectorAll('input,textarea');
        for (let index = 0; index < inputs.length; index++) {
            const el = inputs[index];
            el.parentElement.classList.remove('_focus');
            el.classList.remove('_focus');
            el.value = el.getAttribute('data-value');
        }
        let checkboxes = form.querySelectorAll('.checkbox__input');
        if (checkboxes.length > 0) {
            for (let index = 0; index < checkboxes.length; index++) {
                const checkbox = checkboxes[index];
                checkbox.checked = false;
            }
        }
        let selects = form.querySelectorAll('select');
        if (selects.length > 0) {
            for (let index = 0; index < selects.length; index++) {
                const select = selects[index];
                const select_default_value = select.getAttribute('data-default');
                select.value = select_default_value;
                select_item(select);
            }
        }
    }
    
    let viewPass = document.querySelectorAll('.form__viewpass');
    for (let index = 0; index < viewPass.length; index++) {
        const element = viewPass[index];
        element.addEventListener("click", function (e) {
            if (element.classList.contains('_active')) {
                element.parentElement.querySelector('input').setAttribute("type", "password");
            } else {
                element.parentElement.querySelector('input').setAttribute("type", "text");
            }
            element.classList.toggle('_active');
        });
    }
    
    //Select
    let selects = document.getElementsByTagName('select');
    if (selects.length > 0) {
        selects_init();
    }
    function selects_init() {
        for (let index = 0; index < selects.length; index++) {
            const select = selects[index];
            select_init(select);
        }
        //select_callback();
        document.addEventListener('click', function (e) {
            selects_close(e);
        });
        document.addEventListener('keydown', function (e) {
            if (e.code === 'Escape') {
                selects_close(e);
            }
        });
    }
    function selects_close(e) {
        const selects = document.querySelectorAll('.select');
        if (!e.target.closest('.select') && !e.target.classList.contains('_option')) {
            for (let index = 0; index < selects.length; index++) {
                const select = selects[index];
                const select_body_options = select.querySelector('.select__options');
                select.classList.remove('_active');
                _slideUp(select_body_options, 100);
            }
        }
    }
    function select_init(select) {
        const select_parent = select.parentElement;
        const select_modifikator = select.getAttribute('class');
        const select_selected_option = select.querySelector('option:checked');
        select.setAttribute('data-default', select_selected_option.value);
        select.style.display = 'none';
    
        select_parent.insertAdjacentHTML('beforeend', '<div class="select select_' + select_modifikator + '"></div>');
    
        let new_select = select.parentElement.querySelector('.select');
        new_select.appendChild(select);
        select_item(select);
    }
    function select_item(select) {
        const select_parent = select.parentElement;
        const select_items = select_parent.querySelector('.select__item');
        const select_options = select.querySelectorAll('option');
        const select_selected_option = select.querySelector('option:checked');
        const select_selected_text = select_selected_option.text;
        const select_type = select.getAttribute('data-type');
    
        if (select_items) {
            select_items.remove();
        }
    
        let select_type_content = '';
        if (select_type == 'input') {
            select_type_content = '<div class="select__value icon-select-arrow"><input autocomplete="off" type="text" name="form[]" value="' + select_selected_text + '" data-error="Ошибка" data-value="' + select_selected_text + '" class="select__input"></div>';
        } else {
            select_type_content = '<div class="select__value icon-select-arrow"><span>' + select_selected_text + '</span></div>';
        }
    
        select_parent.insertAdjacentHTML('beforeend',
            '<div class="select__item">' +
            '<div class="select__title">' + select_type_content + '</div>' +
            '<div class="select__options">' + select_get_options(select_options) + '</div>' +
            '</div></div>');
    
        select_actions(select, select_parent);
    }
    function select_actions(original, select) {
        const select_item = select.querySelector('.select__item');
        const selectTitle = select.querySelector('.select__title');
        const select_body_options = select.querySelector('.select__options');
        const select_options = select.querySelectorAll('.select__option');
        const select_type = original.getAttribute('data-type');
        const select_input = select.querySelector('.select__input');
    
        selectTitle.addEventListener('click', function (e) {
            selectItemActions();
        });
    
        function selectMultiItems() {
            let selectedOptions = select.querySelectorAll('.select__option');
            let originalOptions = original.querySelectorAll('option');
            let selectedOptionsText = [];
            for (let index = 0; index < selectedOptions.length; index++) {
                const selectedOption = selectedOptions[index];
                originalOptions[index].removeAttribute('selected');
                if (selectedOption.classList.contains('_selected')) {
                    const selectOptionText = selectedOption.innerHTML;
                    selectedOptionsText.push(selectOptionText);
                    originalOptions[index].setAttribute('selected', 'selected');
                }
            }
            select.querySelector('.select__value').innerHTML = '<span>' + selectedOptionsText + '</span>';
        }
        function selectItemActions(type) {
            if (!type) {
                let selects = document.querySelectorAll('.select');
                for (let index = 0; index < selects.length; index++) {
                    const select = selects[index];
                    const select_body_options = select.querySelector('.select__options');
                    if (select != select_item.closest('.select')) {
                        select.classList.remove('_active');
                        _slideUp(select_body_options, 100);
                    }
                }
                _slideToggle(select_body_options, 100);
                select.classList.toggle('_active');
            }
        }
        for (let index = 0; index < select_options.length; index++) {
            const select_option = select_options[index];
            const select_option_value = select_option.getAttribute('data-value');
            const select_option_text = select_option.innerHTML;
    
            if (select_type == 'input') {
                select_input.addEventListener('keyup', select_search);
            } else {
                if (select_option.getAttribute('data-value') == original.value && !original.hasAttribute('multiple')) {
                    select_option.style.display = 'none';
                }
            }
            select_option.addEventListener('click', function () {
                for (let index = 0; index < select_options.length; index++) {
                    const el = select_options[index];
                    el.style.display = 'block';
                }
                if (select_type == 'input') {
                    select_input.value = select_option_text;
                    original.value = select_option_value;
                } else {
                    if (original.hasAttribute('multiple')) {
                        select_option.classList.toggle('_selected');
                        selectMultiItems();
                    } else {
                        select.querySelector('.select__value').innerHTML = '<span>' + select_option_text + '</span>';
                        original.value = select_option_value;
                        select_option.style.display = 'none';
                    }
                }
                let type;
                if (original.hasAttribute('multiple')) {
                    type = 'multiple';
                }
                selectItemActions(type);
            });
        }
    }
    function select_get_options(select_options) {
        if (select_options) {
            let select_options_content = '';
            for (let index = 0; index < select_options.length; index++) {
                const select_option = select_options[index];
                const select_option_value = select_option.value;
                if (select_option_value != '') {
                    const select_option_text = select_option.innerHTML;
                    select_options_content = select_options_content + '<div data-value="' + select_option_value + '" class="select__option">' + select_option_text + '</div>';
                }
            }
            return select_options_content;
        }
    }
    function select_search(e) {
        let select_block = e.target.closest('.select ').querySelector('.select__options');
        let select_options = e.target.closest('.select ').querySelectorAll('.select__option');
        let select_search_text = e.target.value.toUpperCase();
    
        for (let i = 0; i < select_options.length; i++) {
            let select_option = select_options[i];
            let select_txt_value = select_option.textContent || select_option.innerText;
            if (select_txt_value.toUpperCase().indexOf(select_search_text) > -1) {
                select_option.style.display = "";
            } else {
                select_option.style.display = "none";
            }
        }
    }
    function selects_update_all() {
        let selects = document.querySelectorAll('select');
        if (selects) {
            for (let index = 0; index < selects.length; index++) {
                const select = selects[index];
                select_item(select);
            }
        }
    }
    
    //Placeholers
    let inputs = document.querySelectorAll('input[data-value],textarea[data-value]');
    inputs_init(inputs);
    
    function inputs_init(inputs) {
        if (inputs.length > 0) {
            for (let index = 0; index < inputs.length; index++) {
                const input = inputs[index];
                const input_g_value = input.getAttribute('data-value');
                input_placeholder_add(input);
                if (input.value != '' && input.value != input_g_value) {
                    input_focus_add(input);
                }
                input.addEventListener('focus', function (e) {
                    if (input.value == input_g_value) {
                        input_focus_add(input);
                        input.value = '';
                    }
                    if (input.getAttribute('data-type') === "pass" && !input.parentElement.querySelector('.form__viewpass').classList.contains('_active')) {
                        input.setAttribute('type', 'password');
                    }
                    if (input.classList.contains('_date')) {
                        /*
                        input.classList.add('_mask');
                        Inputmask("99.99.9999", {
                            //"placeholder": '',
                            clearIncomplete: true,
                            clearMaskOnLostFocus: true,
                            onincomplete: function () {
                                input_clear_mask(input, input_g_value);
                            }
                        }).mask(input);
                        */
                    }
                    if (input.classList.contains('_phone')) {
                        //'+7(999) 999 9999'
                        //'+38(999) 999 9999'
                        //'+375(99)999-99-99'
                        input.classList.add('_mask');
                        Inputmask("+375 (99) 9999999", {
                            //"placeholder": '',
                            clearIncomplete: true,
                            clearMaskOnLostFocus: true,
                            onincomplete: function () {
                                input_clear_mask(input, input_g_value);
                            }
                        }).mask(input);
                    }
                    if (input.classList.contains('_digital')) {
                        input.classList.add('_mask');
                        Inputmask("9{1,}", {
                            "placeholder": '',
                            clearIncomplete: true,
                            clearMaskOnLostFocus: true,
                            onincomplete: function () {
                                input_clear_mask(input, input_g_value);
                            }
                        }).mask(input);
                    }
                    form_remove_error(input);
                });
                input.addEventListener('blur', function (e) {
                    if (input.value == '') {
                        input.value = input_g_value;
                        input_focus_remove(input);
                        if (input.classList.contains('_mask')) {
                            input_clear_mask(input, input_g_value);
                        }
                        if (input.getAttribute('data-type') === "pass") {
                            input.setAttribute('type', 'text');
                        }
                    }
                });
                if (input.classList.contains('_date')) {
                    const calendarItem = datepicker(input, {
                        customDays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
                        customMonths: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
                        overlayButton: 'Применить',
                        overlayPlaceholder: 'Год (4 цифры)',
                        startDay: 1,
                        formatter: (input, date, instance) => {
                            const value = date.toLocaleDateString()
                            input.value = value
                        },
                        onSelect: function (input, instance, date) {
                            input_focus_add(input.el);
                        }
                    });
                    const dataFrom = input.getAttribute('data-from');
                    const dataTo = input.getAttribute('data-to');
                    if (dataFrom) {
                        calendarItem.setMin(new Date(dataFrom));
                    }
                    if (dataTo) {
                        calendarItem.setMax(new Date(dataTo));
                    }
                }
            }
        }
    }
    function input_placeholder_add(input) {
        const input_g_value = input.getAttribute('data-value');
        if (input.value == '' && input_g_value != '') {
            input.value = input_g_value;
        }
    }
    function input_focus_add(input) {
        input.classList.add('_focus');
        input.parentElement.classList.add('_focus');
    }
    function input_focus_remove(input) {
        input.classList.remove('_focus');
        input.parentElement.classList.remove('_focus');
    }
    function input_clear_mask(input, input_g_value) {
        input.inputmask.remove();
        input.value = input_g_value;
        input_focus_remove(input);
    }
    
    //QUANTITY
    let quantityButtons = document.querySelectorAll('.quantity__button');
    if (quantityButtons.length > 0) {
        for (let index = 0; index < quantityButtons.length; index++) {
            const quantityButton = quantityButtons[index];
            quantityButton.addEventListener("click", function (e) {
                let value = parseInt(quantityButton.closest('.quantity').querySelector('input').value);
                if (quantityButton.classList.contains('quantity__button_plus')) {
                    value++;
                } else {
                    value = value - 1;
                    if (value < 1) {
                        value = 1
                    }
                }
                quantityButton.closest('.quantity').querySelector('input').value = value;
            });
        }
    }
    
    //RANGE
    const priceSlider = document.querySelector('.price-filter__slider');
    if (priceSlider) {
    
        let textFrom = priceSlider.getAttribute('data-from');
        let textTo = priceSlider.getAttribute('data-to');
    
        noUiSlider.create(priceSlider, {
            start: [0, 200000],
            connect: true,
            tooltips: [wNumb({ decimals: 0, prefix: textFrom + ' ' }), wNumb({ decimals: 0, prefix: textTo + ' ' })],
            range: {
                'min': [0],
                'max': [200000]
            }
        });
    
        /*
        const priceStart = document.getElementById('price-start');
        const priceEnd = document.getElementById('price-end');
        priceStart.addEventListener('change', setPriceValues);
        priceEnd.addEventListener('change', setPriceValues);
        */
    
        function setPriceValues() {
            let priceStartValue;
            let priceEndValue;
            if (priceStart.value != '') {
                priceStartValue = priceStart.value;
            }
            if (priceEnd.value != '') {
                priceEndValue = priceEnd.value;
            }
            priceSlider.noUiSlider.set([priceStartValue, priceEndValue]);
        }
    }
    // Бургер
    // document.querySelector(".header__burger").onclick = function () {
    //     document.querySelector(".header__burger").classList.toggle("menu-active");
    //     document.querySelector(".header__menu").classList.toggle("menu-active");
    //     document.querySelector("body").classList.toggle("_lock");
    // };
    
    const burger = document.querySelector(".header__burger");
    const menu = document.querySelector(".header__menu");
    const body = document.querySelector("body");
    
    burger.addEventListener('click', function () {
        burger.classList.toggle("menu-active");
        menu.classList.toggle("menu-active");
        body.classList.toggle("_lock");
    
    });
    
    
    window.onscroll = function () {
        let header = document.querySelector("header")
        if (window.pageYOffset > innerHeight) {
            header.classList.add("menu__bg")
        } else {
            header.classList.remove("menu__bg")
        }
    
    }
    
    
    
    
    
    
    swiper = new Swiper('.a', {
    
        // Стрелки
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        // Навигация
        // Буллеты, текущее положение, прогресс бар
        pagination: {
            el: '.swiper-pagination',
            // Булеты
    
            clickable: true,
            // Динамические булеты
            dynamicBullets: false,
            // Тип булетов 
    
            // type: "fraction",
            // type: "bullets",
            // type: "progressbar",
        },
        // Сколл бар
        /*
        scrollbar: {
            el: '.swiper-scrollbar',
            // возможно перетаскивание скрола
            draggble: true,
        },
        */
        // Включение
        simulateTouch: false,
        // Чувствительность спайпа
        touchRatio: 1,
        // Угол срабатывания спайпа
        touchAngle: 45,
        // Курсор перетаскивания
        grabCursor: false,
        // Переключение при клике на слайд
        slideToClickedSlide: false,
        // Отключения переключения слайдов на телефоне
        allowTouchMove: false,
    
        // Управление клавиатурой
        keyboard: {
            // Влючение
            enabled: false,
            // Включение
            // только когда сдайдер в пределах вьюпорта
            onlyInViewport: true,
            // Включение
            // Управление клавишами
            // pageUp, pageDown
            pageUpDown: true,
        },
    
        // Управление колесом мыши
        /*
        mousewheel: {
            // Чувствительность колеса мыши
            sensitiviti: 1,
            // Класс объекта на котором будет срабатывать прокрута мышью
            eventsTarget: ".swiper-container",
        },*/
        // Автовысота
        autoHeight: false,
        // Количество слайдов для показала
        slidesPerView: 1,
        // Отключение слайдера если слайдов меньше чем нужно
        watchOverflow: false,
        // Отступ между сдайдами
        spaceBetween: 0,
        // Количество пролистоваемых слайдеров
        slidesPerGroup: 1,
        // Активный слайд по центру
        centeredSlides: false,
        // Стартовый слайд
        initialSlide: 0,
        // Мультирядность
        slidesPerColumn: 1,
        // Бесконечный слайдер
        loop: true,
        // Кол-вл дублирующих слайдов
        // loopedSlides:0,
        // Свободный режим
        freeMode: true,
    
        // Автопрокрутка
        autoplay: {
            // Пауза между прокруткой
            delay: 4000,
            // Закончить на последнем слайде
            stopOnLastSlide: false,
            // Отключить после ручного переключения
            disableOnInteraction: false,
        },
        // Скорость
        speed: 1400,
    
        // Вертикальный слайдер
        // direction: "vertical",
    
        // Эффекты перелючения слайдов
        // Листание
        effect: "slide",
        // переворот
        effect: "flip",
        // Исчезание
        effect: "fade",
        // Дополнение к fade
        fadeEffect: {
            // Параллельная смена прозрачности
            crossFade: false,
        },
        // Допольнение к flip
        flipEffect: {
            // тень
            slideShadows: true,
            // показ только активного слайда
            limitRotation: false,
        },
    
        // Брейк поинты АДАПТИВ
    
        breakpoints: {
            320: {
                slidesPerView: 1,
            },
            480: {
                slidesPerView: 1,
            },
            992: {
                slidesPerView: 1,
            },
    
        },
        // миниатюры превью 
        // Cоединение двух слайдеров
        /*
        thumbs: {
            swiper: {
                el: ".b",
                slidesPerView: 3,
            }
        },
    */
    });
    // Второй слайдер
    // const swiperr = new Swiper('.b', {
    //     watchOverflow: true,
    //     slidesPerView: 3,
    // });
    
    swiper = new Swiper('.moto1', {
        slidesPerView: 1,
        simulateTouch: false,
        effect: "fade",
        fadeEffect: {
            // Параллельная смена прозрачности
            crossFade: true,
        },
        thumbs: {
            swiper: {
                el: ".moto2",
                slidesPerView: 4,
            }
        },
    })
    
    swiper = new Swiper('.moto2', {
        slidesPerView: 4,
        watchOverflow: true,
    })
    /*!
     * parallax.js v1.5.0 (http://pixelcog.github.io/parallax.js/)
     * @copyright 2016 PixelCog, Inc.
     * @license MIT (https://github.com/pixelcog/parallax.js/blob/master/LICENSE)
     */
    !function(t,i,e,s){function o(i,e){var h=this;"object"==typeof e&&(delete e.refresh,delete e.render,t.extend(this,e)),this.$element=t(i),!this.imageSrc&&this.$element.is("img")&&(this.imageSrc=this.$element.attr("src"));var r=(this.position+"").toLowerCase().match(/\S+/g)||[];if(r.length<1&&r.push("center"),1==r.length&&r.push(r[0]),"top"!=r[0]&&"bottom"!=r[0]&&"left"!=r[1]&&"right"!=r[1]||(r=[r[1],r[0]]),this.positionX!==s&&(r[0]=this.positionX.toLowerCase()),this.positionY!==s&&(r[1]=this.positionY.toLowerCase()),h.positionX=r[0],h.positionY=r[1],"left"!=this.positionX&&"right"!=this.positionX&&(isNaN(parseInt(this.positionX))?this.positionX="center":this.positionX=parseInt(this.positionX)),"top"!=this.positionY&&"bottom"!=this.positionY&&(isNaN(parseInt(this.positionY))?this.positionY="center":this.positionY=parseInt(this.positionY)),this.position=this.positionX+(isNaN(this.positionX)?"":"px")+" "+this.positionY+(isNaN(this.positionY)?"":"px"),navigator.userAgent.match(/(iPod|iPhone|iPad)/))return this.imageSrc&&this.iosFix&&!this.$element.is("img")&&this.$element.css({backgroundImage:"url("+this.imageSrc+")",backgroundSize:"cover",backgroundPosition:this.position}),this;if(navigator.userAgent.match(/(Android)/))return this.imageSrc&&this.androidFix&&!this.$element.is("img")&&this.$element.css({backgroundImage:"url("+this.imageSrc+")",backgroundSize:"cover",backgroundPosition:this.position}),this;this.$mirror=t("<div />").prependTo(this.mirrorContainer);var a=this.$element.find(">.parallax-slider"),n=!1;0==a.length?this.$slider=t("<img />").prependTo(this.$mirror):(this.$slider=a.prependTo(this.$mirror),n=!0),this.$mirror.addClass("parallax-mirror").css({visibility:"hidden",zIndex:this.zIndex,position:"fixed",top:0,left:0,overflow:"hidden"}),this.$slider.addClass("parallax-slider").one("load",function(){h.naturalHeight&&h.naturalWidth||(h.naturalHeight=this.naturalHeight||this.height||1,h.naturalWidth=this.naturalWidth||this.width||1),h.aspectRatio=h.naturalWidth/h.naturalHeight,o.isSetup||o.setup(),o.sliders.push(h),o.isFresh=!1,o.requestRender()}),n||(this.$slider[0].src=this.imageSrc),(this.naturalHeight&&this.naturalWidth||this.$slider[0].complete||a.length>0)&&this.$slider.trigger("load")}!function(){for(var t=0,e=["ms","moz","webkit","o"],s=0;s<e.length&&!i.requestAnimationFrame;++s)i.requestAnimationFrame=i[e[s]+"RequestAnimationFrame"],i.cancelAnimationFrame=i[e[s]+"CancelAnimationFrame"]||i[e[s]+"CancelRequestAnimationFrame"];i.requestAnimationFrame||(i.requestAnimationFrame=function(e){var s=(new Date).getTime(),o=Math.max(0,16-(s-t)),h=i.setTimeout(function(){e(s+o)},o);return t=s+o,h}),i.cancelAnimationFrame||(i.cancelAnimationFrame=function(t){clearTimeout(t)})}(),t.extend(o.prototype,{speed:.2,bleed:0,zIndex:-100,iosFix:!0,androidFix:!0,position:"center",overScrollFix:!1,mirrorContainer:"body",refresh:function(){this.boxWidth=this.$element.outerWidth(),this.boxHeight=this.$element.outerHeight()+2*this.bleed,this.boxOffsetTop=this.$element.offset().top-this.bleed,this.boxOffsetLeft=this.$element.offset().left,this.boxOffsetBottom=this.boxOffsetTop+this.boxHeight;var t,i=o.winHeight,e=o.docHeight,s=Math.min(this.boxOffsetTop,e-i),h=Math.max(this.boxOffsetTop+this.boxHeight-i,0),r=this.boxHeight+(s-h)*(1-this.speed)|0,a=(this.boxOffsetTop-s)*(1-this.speed)|0;r*this.aspectRatio>=this.boxWidth?(this.imageWidth=r*this.aspectRatio|0,this.imageHeight=r,this.offsetBaseTop=a,t=this.imageWidth-this.boxWidth,"left"==this.positionX?this.offsetLeft=0:"right"==this.positionX?this.offsetLeft=-t:isNaN(this.positionX)?this.offsetLeft=-t/2|0:this.offsetLeft=Math.max(this.positionX,-t)):(this.imageWidth=this.boxWidth,this.imageHeight=this.boxWidth/this.aspectRatio|0,this.offsetLeft=0,t=this.imageHeight-r,"top"==this.positionY?this.offsetBaseTop=a:"bottom"==this.positionY?this.offsetBaseTop=a-t:isNaN(this.positionY)?this.offsetBaseTop=a-t/2|0:this.offsetBaseTop=a+Math.max(this.positionY,-t))},render:function(){var t=o.scrollTop,i=o.scrollLeft,e=this.overScrollFix?o.overScroll:0,s=t+o.winHeight;this.boxOffsetBottom>t&&this.boxOffsetTop<=s?(this.visibility="visible",this.mirrorTop=this.boxOffsetTop-t,this.mirrorLeft=this.boxOffsetLeft-i,this.offsetTop=this.offsetBaseTop-this.mirrorTop*(1-this.speed)):this.visibility="hidden",this.$mirror.css({transform:"translate3d("+this.mirrorLeft+"px, "+(this.mirrorTop-e)+"px, 0px)",visibility:this.visibility,height:this.boxHeight,width:this.boxWidth}),this.$slider.css({transform:"translate3d("+this.offsetLeft+"px, "+this.offsetTop+"px, 0px)",position:"absolute",height:this.imageHeight,width:this.imageWidth,maxWidth:"none"})}}),t.extend(o,{scrollTop:0,scrollLeft:0,winHeight:0,winWidth:0,docHeight:1<<30,docWidth:1<<30,sliders:[],isReady:!1,isFresh:!1,isBusy:!1,setup:function(){function s(){if(p==i.pageYOffset)return i.requestAnimationFrame(s),!1;p=i.pageYOffset,h.render(),i.requestAnimationFrame(s)}if(!this.isReady){var h=this,r=t(e),a=t(i),n=function(){o.winHeight=a.height(),o.winWidth=a.width(),o.docHeight=r.height(),o.docWidth=r.width()},l=function(){var t=a.scrollTop(),i=o.docHeight-o.winHeight,e=o.docWidth-o.winWidth;o.scrollTop=Math.max(0,Math.min(i,t)),o.scrollLeft=Math.max(0,Math.min(e,a.scrollLeft())),o.overScroll=Math.max(t-i,Math.min(t,0))};a.on("resize.px.parallax load.px.parallax",function(){n(),h.refresh(),o.isFresh=!1,o.requestRender()}).on("scroll.px.parallax load.px.parallax",function(){l(),o.requestRender()}),n(),l(),this.isReady=!0;var p=-1;s()}},configure:function(i){"object"==typeof i&&(delete i.refresh,delete i.render,t.extend(this.prototype,i))},refresh:function(){t.each(this.sliders,function(){this.refresh()}),this.isFresh=!0},render:function(){this.isFresh||this.refresh(),t.each(this.sliders,function(){this.render()})},requestRender:function(){var t=this;t.render(),t.isBusy=!1},destroy:function(e){var s,h=t(e).data("px.parallax");for(h.$mirror.remove(),s=0;s<this.sliders.length;s+=1)this.sliders[s]==h&&this.sliders.splice(s,1);t(e).data("px.parallax",!1),0===this.sliders.length&&(t(i).off("scroll.px.parallax resize.px.parallax load.px.parallax"),this.isReady=!1,o.isSetup=!1)}});var h=t.fn.parallax;t.fn.parallax=function(s){return this.each(function(){var h=t(this),r="object"==typeof s&&s;this==i||this==e||h.is("body")?o.configure(r):h.data("px.parallax")?"object"==typeof s&&t.extend(h.data("px.parallax"),r):(r=t.extend({},h.data(),r),h.data("px.parallax",new o(this,r))),"string"==typeof s&&("destroy"==s?o.destroy(this):o[s]())})},t.fn.parallax.Constructor=o,t.fn.parallax.noConflict=function(){return t.fn.parallax=h,this},t(function(){t('[data-parallax="scroll"]').parallax()})}(jQuery,window,document);
    /*! WOW wow.js - v1.3.0 - 2016-10-04
    * https://wowjs.uk
    * Copyright (c) 2016 Thomas Grainger; Licensed MIT */!function(a,b){if("function"==typeof define&&define.amd)define(["module","exports"],b);else if("undefined"!=typeof exports)b(module,exports);else{var c={exports:{}};b(c,c.exports),a.WOW=c.exports}}(this,function(a,b){"use strict";function c(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function d(a,b){return b.indexOf(a)>=0}function e(a,b){for(var c in b)if(null==a[c]){var d=b[c];a[c]=d}return a}function f(a){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(a)}function g(a){var b=arguments.length<=1||void 0===arguments[1]?!1:arguments[1],c=arguments.length<=2||void 0===arguments[2]?!1:arguments[2],d=arguments.length<=3||void 0===arguments[3]?null:arguments[3],e=void 0;return null!=document.createEvent?(e=document.createEvent("CustomEvent"),e.initCustomEvent(a,b,c,d)):null!=document.createEventObject?(e=document.createEventObject(),e.eventType=a):e.eventName=a,e}function h(a,b){null!=a.dispatchEvent?a.dispatchEvent(b):b in(null!=a)?a[b]():"on"+b in(null!=a)&&a["on"+b]()}function i(a,b,c){null!=a.addEventListener?a.addEventListener(b,c,!1):null!=a.attachEvent?a.attachEvent("on"+b,c):a[b]=c}function j(a,b,c){null!=a.removeEventListener?a.removeEventListener(b,c,!1):null!=a.detachEvent?a.detachEvent("on"+b,c):delete a[b]}function k(){return"innerHeight"in window?window.innerHeight:document.documentElement.clientHeight}Object.defineProperty(b,"__esModule",{value:!0});var l,m,n=function(){function a(a,b){for(var c=0;c<b.length;c++){var d=b[c];d.enumerable=d.enumerable||!1,d.configurable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(a,d.key,d)}}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),o=window.WeakMap||window.MozWeakMap||function(){function a(){c(this,a),this.keys=[],this.values=[]}return n(a,[{key:"get",value:function(a){for(var b=0;b<this.keys.length;b++){var c=this.keys[b];if(c===a)return this.values[b]}}},{key:"set",value:function(a,b){for(var c=0;c<this.keys.length;c++){var d=this.keys[c];if(d===a)return this.values[c]=b,this}return this.keys.push(a),this.values.push(b),this}}]),a}(),p=window.MutationObserver||window.WebkitMutationObserver||window.MozMutationObserver||(m=l=function(){function a(){c(this,a),"undefined"!=typeof console&&null!==console&&(console.warn("MutationObserver is not supported by your browser."),console.warn("WOW.js cannot detect dom mutations, please call .sync() after loading new content."))}return n(a,[{key:"observe",value:function(){}}]),a}(),l.notSupported=!0,m),q=window.getComputedStyle||function(a){var b=/(\-([a-z]){1})/g;return{getPropertyValue:function(c){"float"===c&&(c="styleFloat"),b.test(c)&&c.replace(b,function(a,b){return b.toUpperCase()});var d=a.currentStyle;return(null!=d?d[c]:void 0)||null}}},r=function(){function a(){var b=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];c(this,a),this.defaults={boxClass:"wow",animateClass:"animated",offset:0,mobile:!0,live:!0,callback:null,scrollContainer:null,resetAnimation:!0},this.animate=function(){return"requestAnimationFrame"in window?function(a){return window.requestAnimationFrame(a)}:function(a){return a()}}(),this.vendors=["moz","webkit"],this.start=this.start.bind(this),this.resetAnimation=this.resetAnimation.bind(this),this.scrollHandler=this.scrollHandler.bind(this),this.scrollCallback=this.scrollCallback.bind(this),this.scrolled=!0,this.config=e(b,this.defaults),null!=b.scrollContainer&&(this.config.scrollContainer=document.querySelector(b.scrollContainer)),this.animationNameCache=new o,this.wowEvent=g(this.config.boxClass)}return n(a,[{key:"init",value:function(){this.element=window.document.documentElement,d(document.readyState,["interactive","complete"])?this.start():i(document,"DOMContentLoaded",this.start),this.finished=[]}},{key:"start",value:function(){var a=this;if(this.stopped=!1,this.boxes=[].slice.call(this.element.querySelectorAll("."+this.config.boxClass)),this.all=this.boxes.slice(0),this.boxes.length)if(this.disabled())this.resetStyle();else for(var b=0;b<this.boxes.length;b++){var c=this.boxes[b];this.applyStyle(c,!0)}if(this.disabled()||(i(this.config.scrollContainer||window,"scroll",this.scrollHandler),i(window,"resize",this.scrollHandler),this.interval=setInterval(this.scrollCallback,50)),this.config.live){var d=new p(function(b){for(var c=0;c<b.length;c++)for(var d=b[c],e=0;e<d.addedNodes.length;e++){var f=d.addedNodes[e];a.doSync(f)}});d.observe(document.body,{childList:!0,subtree:!0})}}},{key:"stop",value:function(){this.stopped=!0,j(this.config.scrollContainer||window,"scroll",this.scrollHandler),j(window,"resize",this.scrollHandler),null!=this.interval&&clearInterval(this.interval)}},{key:"sync",value:function(){p.notSupported&&this.doSync(this.element)}},{key:"doSync",value:function(a){if("undefined"!=typeof a&&null!==a||(a=this.element),1===a.nodeType){a=a.parentNode||a;for(var b=a.querySelectorAll("."+this.config.boxClass),c=0;c<b.length;c++){var e=b[c];d(e,this.all)||(this.boxes.push(e),this.all.push(e),this.stopped||this.disabled()?this.resetStyle():this.applyStyle(e,!0),this.scrolled=!0)}}}},{key:"show",value:function(a){return this.applyStyle(a),a.className=a.className+" "+this.config.animateClass,null!=this.config.callback&&this.config.callback(a),h(a,this.wowEvent),this.config.resetAnimation&&(i(a,"animationend",this.resetAnimation),i(a,"oanimationend",this.resetAnimation),i(a,"webkitAnimationEnd",this.resetAnimation),i(a,"MSAnimationEnd",this.resetAnimation)),a}},{key:"applyStyle",value:function(a,b){var c=this,d=a.getAttribute("data-wow-duration"),e=a.getAttribute("data-wow-delay"),f=a.getAttribute("data-wow-iteration");return this.animate(function(){return c.customStyle(a,b,d,e,f)})}},{key:"resetStyle",value:function(){for(var a=0;a<this.boxes.length;a++){var b=this.boxes[a];b.style.visibility="visible"}}},{key:"resetAnimation",value:function(a){if(a.type.toLowerCase().indexOf("animationend")>=0){var b=a.target||a.srcElement;b.className=b.className.replace(this.config.animateClass,"").trim()}}},{key:"customStyle",value:function(a,b,c,d,e){return b&&this.cacheAnimationName(a),a.style.visibility=b?"hidden":"visible",c&&this.vendorSet(a.style,{animationDuration:c}),d&&this.vendorSet(a.style,{animationDelay:d}),e&&this.vendorSet(a.style,{animationIterationCount:e}),this.vendorSet(a.style,{animationName:b?"none":this.cachedAnimationName(a)}),a}},{key:"vendorSet",value:function(a,b){for(var c in b)if(b.hasOwnProperty(c)){var d=b[c];a[""+c]=d;for(var e=0;e<this.vendors.length;e++){var f=this.vendors[e];a[""+f+c.charAt(0).toUpperCase()+c.substr(1)]=d}}}},{key:"vendorCSS",value:function(a,b){for(var c=q(a),d=c.getPropertyCSSValue(b),e=0;e<this.vendors.length;e++){var f=this.vendors[e];d=d||c.getPropertyCSSValue("-"+f+"-"+b)}return d}},{key:"animationName",value:function(a){var b=void 0;try{b=this.vendorCSS(a,"animation-name").cssText}catch(c){b=q(a).getPropertyValue("animation-name")}return"none"===b?"":b}},{key:"cacheAnimationName",value:function(a){return this.animationNameCache.set(a,this.animationName(a))}},{key:"cachedAnimationName",value:function(a){return this.animationNameCache.get(a)}},{key:"scrollHandler",value:function(){this.scrolled=!0}},{key:"scrollCallback",value:function(){if(this.scrolled){this.scrolled=!1;for(var a=[],b=0;b<this.boxes.length;b++){var c=this.boxes[b];if(c){if(this.isVisible(c)){this.show(c);continue}a.push(c)}}this.boxes=a,this.boxes.length||this.config.live||this.stop()}}},{key:"offsetTop",value:function(a){for(;void 0===a.offsetTop;)a=a.parentNode;for(var b=a.offsetTop;a.offsetParent;)a=a.offsetParent,b+=a.offsetTop;return b}},{key:"isVisible",value:function(a){var b=a.getAttribute("data-wow-offset")||this.config.offset,c=this.config.scrollContainer&&this.config.scrollContainer.scrollTop||window.pageYOffset,d=c+Math.min(this.element.clientHeight,k())-b,e=this.offsetTop(a),f=e+a.clientHeight;return d>=e&&f>=c}},{key:"disabled",value:function(){return!this.config.mobile&&f(navigator.userAgent)}}]),a}();b["default"]=r,a.exports=b["default"]});
    new WOW(
        {
            offset: 400, // - Определяет расстояние между нижней частью видового окна браузера и верхней частью скрытого поля. когда пользователь прокручивает страницу и достигает этого расстояния, скрытое поле открывается.
            boxClass: 'wow', // default - Имя класса, которое показывает скрытое поле при прокрутке пользователем.
            animateClass: 'animated', // default - Имя класса, запускающего CSS-анимацию (’анимированный’ по умолчанию для библиотеки animate.css)
            mobile: false, // default - Включение/выключение wow.js на мобильных устройствах.
            live: true // default -постоянно проверяйте наличие новых элементов WOW на странице.
        }
    ).init();
    
    // Дополнительные настройки
    // data-wow-duration: Изменение длительности анимации(.2s)
    // data-wow-delay: Задержка перед началом анимации(.2s)
    // data-wow-offset: Расстояние до начала анимации (связанное с нижней частью браузера)(2)
    // data-wow-iteration: Количество повторений анимации(2)
    
    // Чтобы анимация работала добавьте сlass "wow"  к анимированому элементу
    
    
    