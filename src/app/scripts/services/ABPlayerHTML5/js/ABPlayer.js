define("ABPlayer", function(){
  /**
   * Binary Search Stubs for JS Arrays
   * @license MIT
   * @author Jim Chen
   */
  var BinArray = (function(){
    var BinArray = {};
    BinArray.bsearch = function(arr, what, how){
      if(arr.length === 0) {
        return 0;
      }
      if(how(what,arr[0]) < 0) {
        return 0;
      }
      if(how(what,arr[arr.length - 1]) >=0) {
        return arr.length;
      }
      var low =0;
      var i = 0;
      var count = 0;
      var high = arr.length - 1;
      while(low<=high){
        i = Math.floor((high + low + 1)/2);
        count++;
        if(how(what,arr[i-1])>=0 && how(what,arr[i])<0){
          return i;
        }
        if(how(what,arr[i-1])<0){
          high = i-1;
        }else if(how(what,arr[i])>=0){
          low = i;
        }else {
          console.error('Program Error');
        }
        if(count > 1500) { console.error('Too many run cycles.'); }
      }
      return -1; // Never actually run
    };
    BinArray.binsert = function(arr, what, how){
      var index = BinArray.bsearch(arr,what,how);
      arr.splice(index,0,what);
      return index;
    };
    return BinArray;
  })();

  var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
  };

  var CommentSpaceAllocator = (function () {
    function CommentSpaceAllocator(width, height) {
      if (typeof width === "undefined") { width = 0; }
      if (typeof height === "undefined") { height = 0; }
      this._pools = [
        []
      ];
      this.avoid = 1;
      this._width = width;
      this._height = height;
    }
    CommentSpaceAllocator.prototype.willCollide = function (existing, check) {
      return existing.stime + existing.ttl >= check.stime + check.ttl / 2;
    };

    CommentSpaceAllocator.prototype.pathCheck = function (y, comment, pool) {
      var bottom = y + comment.height;
      var right = comment.right;
      for (var i = 0; i < pool.length; i++) {
        if (pool[i].y > bottom || pool[i].bottom < y) {
          continue;
        } else if (pool[i].right < comment.x || pool[i].x > right) {
          if (this.willCollide(pool[i], comment)) {
            return false;
          } else {
            continue;
          }
        } else {
          return false;
        }
      }
      return true;
    };

    CommentSpaceAllocator.prototype.assign = function (comment, cindex) {
      while (this._pools.length <= cindex) {
        this._pools.push([]);
      }
      var pool = this._pools[cindex];
      if (pool.length === 0) {
        comment.cindex = cindex;
        return 0;
      } else if (this.pathCheck(0, comment, pool)) {
        comment.cindex = cindex;
        return 0;
      }
      var y = 0;
      for (var k = 0; k < pool.length; k++) {
        y = pool[k].bottom + this.avoid;
        if (y + comment.height > this._height) {
          break;
        }
        if (this.pathCheck(y, comment, pool)) {
          comment.cindex = cindex;
          return y;
        }
      }

      return this.assign(comment, cindex + 1);
    };

    CommentSpaceAllocator.prototype.add = function (comment) {
      if (comment.height > this._height) {
        comment.cindex = -2;
        comment.y = 0;
      } else {
        comment.y = this.assign(comment, 0);
        BinArray.binsert(this._pools[comment.cindex], comment, function (a, b) {
          if (a.bottom < b.bottom) {
            return -1;
          } else if (a.bottom > b.bottom) {
            return 1;
          } else {
            return 0;
          }
        });
      }
    };

    CommentSpaceAllocator.prototype.remove = function (comment) {
      if (comment.cindex < 0) {
        return;
      }
      if (comment.cindex >= this._pools.length) {
        throw new Error("cindex out of bounds");
      }
      var index = this._pools[comment.cindex].indexOf(comment);
      if (index < 0)
        return;
      this._pools[comment.cindex].splice(index, 1);
    };

    CommentSpaceAllocator.prototype.setBounds = function (width, height) {
      this._width = width;
      this._height = height;
    };
    return CommentSpaceAllocator;
  })();

  var AnchorCommentSpaceAllocator = (function (_super) {
    __extends(AnchorCommentSpaceAllocator, _super);
    function AnchorCommentSpaceAllocator() {
      _super.apply(this, arguments);
    }
    AnchorCommentSpaceAllocator.prototype.add = function (comment) {
      _super.prototype.add.call(this, comment);
      comment.x = (this._width - comment.width) / 2;
    };

    AnchorCommentSpaceAllocator.prototype.willCollide = function (a, b) {
      return true;
    };

    AnchorCommentSpaceAllocator.prototype.pathCheck = function (y, comment, pool) {
      var bottom = y + comment.height;
      for (var i = 0; i < pool.length; i++) {
        if (pool[i].y > bottom || pool[i].bottom < y) {
          continue;
        } else {
          return false;
        }
      }
      return true;
    };
    return AnchorCommentSpaceAllocator;
  })(CommentSpaceAllocator);

  var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
  };
  var CoreComment = (function () {
    function CoreComment(parent, init) {
      if (typeof init === "undefined") { init = {}; }
      this.mode = 1;
      this.stime = 0;
      this.text = "";
      this.ttl = 4000;
      this.dur = 4000;
      this.cindex = -1;
      this.motion = [];
      this.movable = true;
      this._alphaMotion = null;
      this.absolute = true;
      this.align = 0;
      this._alpha = 1;
      this._size = 25;
      this._color = 0xffffff;
      this._border = false;
      this._shadow = true;
      this._font = "";
      if (!parent) {
        throw new Error("Comment not bound to comment manager.");
      } else {
        this.parent = parent;
      }
      if (init.hasOwnProperty("stime")) {
        this.stime = init["stime"];
      }
      if (init.hasOwnProperty("mode")) {
        this.mode = init["mode"];
      } else {
        this.mode = 1;
      }
      if (init.hasOwnProperty("dur")) {
        this.dur = init["dur"];
        this.ttl = this.dur;
      }
      this.dur *= this.parent.options.global.scale;
      this.ttl *= this.parent.options.global.scale;
      if (init.hasOwnProperty("text")) {
        this.text = init["text"];
      }
      if (init.hasOwnProperty("motion")) {
        this._motionStart = [];
        this._motionEnd = [];
        this.motion = init["motion"];
        var head = 0;
        for (var i = 0; i < init["motion"].length; i++) {
          this._motionStart.push(head);
          var maxDur = 0;
          for (var k in init["motion"][i]) {
            var m = init["motion"][i][k];
            maxDur = Math.max(m.dur, maxDur);
            if (m.easing === null || m.easing === undefined) {
              init["motion"][i][k]["easing"] = CoreComment.LINEAR;
            }
          }
          head += maxDur;
          this._motionEnd.push(head);
        }
        this._curMotion = 0;
      }
      if (init.hasOwnProperty("color")) {
        this._color = init["color"];
      }
      if (init.hasOwnProperty("size")) {
        this._size = init["size"];
      }
      if (init.hasOwnProperty("border")) {
        this._border = init["border"];
      }
      if (init.hasOwnProperty("opacity")) {
        this._alpha = init["opacity"];
      }
      if (init.hasOwnProperty("alpha")) {
        this._alphaMotion = init["alpha"];
      }
      if (init.hasOwnProperty("font")) {
        this._font = init["font"];
      }
      if (init.hasOwnProperty("x")) {
        this._x = init["x"];
      }
      if (init.hasOwnProperty("y")) {
        this._y = init["y"];
      }
      if (init.hasOwnProperty("shadow")) {
        this._shadow = init["shadow"];
      }
      if (init.hasOwnProperty("position")) {
        if (init["position"] === "relative") {
          this.absolute = false;
          if (this.mode < 7) {
            console.warn("Using relative position for CSA comment.");
          }
        }
      }
    }
    CoreComment.prototype.init = function (recycle) {
      if (typeof recycle === "undefined") { recycle = null; }
      if (recycle !== null) {
        this.dom = recycle.dom;
      } else {
        this.dom = document.createElement("div");
      }
      this.dom.className = this.parent.options.global.className;
      this.dom.appendChild(document.createTextNode(this.text));
      this.dom.textContent = this.text;
      this.dom.innerText = this.text;
      this.size = this._size;
      if (this._color != 0xffffff) {
        this.color = this._color;
      }
      this.shadow = this._shadow;
      if (this._border) {
        this.border = this._border;
      }
      if (this._font !== "") {
        this.font = this._font;
      }
      if (this._x !== undefined) {
        this.x = this._x;
      }
      if (this._y !== undefined) {
        this.y = this._y;
      }
      if (this._alpha !== 1 || this.parent.options.global.opacity < 1) {
        this.alpha = this._alpha;
      }
      if (this.motion.length > 0) {
        this.animate();
      }
    };

    Object.defineProperty(CoreComment.prototype, "x", {
      get: function () {
        if (this._x === null || this._x === undefined) {
          if (this.align % 2 === 0) {
            this._x = this.dom.offsetLeft;
          } else {
            this._x = this.parent.width - this.dom.offsetLeft - this.width;
          }
        }
        if (!this.absolute) {
          return this._x / this.parent.width;
        }
        return this._x;
      },
      set: function (x) {
        this._x = x;
        if (!this.absolute) {
          this._x *= this.parent.width;
        }
        if (this.align % 2 === 0) {
          this.dom.style.left = this._x + "px";
        } else {
          this.dom.style.right = this._x + "px";
        }
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "y", {
      get: function () {
        if (this._y === null || this._y === undefined) {
          if (this.align < 2) {
            this._y = this.dom.offsetTop;
          } else {
            this._y = this.parent.height - this.dom.offsetTop - this.height;
          }
        }
        if (!this.absolute) {
          return this._y / this.parent.height;
        }
        return this._y;
      },
      set: function (y) {
        this._y = y;
        if (!this.absolute) {
          this._y *= this.parent.height;
        }
        if (this.align < 2) {
          this.dom.style.top = this._y + "px";
        } else {
          this.dom.style.bottom = this._y + "px";
        }
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "bottom", {
      get: function () {
        return this.y + this.height;
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "right", {
      get: function () {
        return this.x + this.width;
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "width", {
      get: function () {
        if (this._width === null || this._width === undefined) {
          this._width = this.dom.offsetWidth;
        }
        return this._width;
      },
      set: function (w) {
        this._width = w;
        this.dom.style.width = this._width + "px";
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "height", {
      get: function () {
        if (this._height === null || this._height === undefined) {
          this._height = this.dom.offsetHeight;
        }
        return this._height;
      },
      set: function (h) {
        this._height = h;
        this.dom.style.height = this._height + "px";
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "size", {
      get: function () {
        return this._size;
      },
      set: function (s) {
        this._size = s;
        this.dom.style.fontSize = this._size + "px";
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "color", {
      get: function () {
        return this._color;
      },
      set: function (c) {
        this._color = c;
        var color = c.toString(16);
        color = color.length >= 6 ? color : new Array(6 - color.length + 1).join("0") + color;
        this.dom.style.color = "#" + color;
        if (this._color === 0) {
          this.dom.className = this.parent.options.global.className + " rshadow";
        }
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "alpha", {
      get: function () {
        return this._alpha;
      },
      set: function (a) {
        this._alpha = a;
        this.dom.style.opacity = Math.min(this._alpha, this.parent.options.global.opacity) + "";
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "border", {
      get: function () {
        return this._border;
      },
      set: function (b) {
        this._border = b;
        if (this._border) {
          this.dom.style.border = "1px solid #00ffff";
        } else {
          this.dom.style.border = "none";
        }
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "shadow", {
      get: function () {
        return this._shadow;
      },
      set: function (s) {
        this._shadow = s;
        if (!this._shadow) {
          this.dom.className = this.parent.options.global.className + " noshadow";
        }
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(CoreComment.prototype, "font", {
      get: function () {
        return this._font;
      },
      set: function (f) {
        this._font = f;
        if (this._font.length > 0) {
          this.dom.style.fontFamily = this._font;
        } else {
          this.dom.style.fontFamily = "";
        }
      },
      enumerable: true,
      configurable: true
    });











    CoreComment.prototype.time = function (time) {
      this.ttl -= time;
      if (this.ttl < 0) {
        this.ttl = 0;
      }
      if (this.movable) {
        this.update();
      }
      if (this.ttl <= 0) {
        this.finish();
      }
    };

    CoreComment.prototype.update = function () {
      this.animate();
    };

    CoreComment.prototype.invalidate = function () {
      this._x = null;
      this._y = null;
      this._width = null;
      this._height = null;
    };

    CoreComment.prototype._execMotion = function (currentMotion, time) {
      for (var prop in currentMotion) {
        if (currentMotion.hasOwnProperty(prop)) {
          var m = currentMotion[prop];
          this[prop] = m.easing(Math.min(Math.max(time - m.delay, 0), m.dur), m.from, m.to - m.from, m.dur);
        }
      }
    };

    CoreComment.prototype.animate = function () {
      if (this._alphaMotion) {
        this.alpha = (this.dur - this.ttl) * (this._alphaMotion["to"] - this._alphaMotion["from"]) / this.dur + this._alphaMotion["from"];
      }
      if (this.motion.length === 0) {
        return;
      }
      var ttl = Math.max(this.ttl, 0);
      var time = (this.dur - ttl) - this._motionStart[this._curMotion];
      this._execMotion(this.motion[this._curMotion], time);
      if (this.dur - ttl > this._motionEnd[this._curMotion]) {
        this._curMotion++;
        if (this._curMotion >= this.motion.length) {
          this._curMotion = this.motion.length - 1;
        }
        return;
      }
    };

    CoreComment.prototype.finish = function () {
      this.parent.finish(this);
    };

    CoreComment.prototype.toString = function () {
      return ["[", this.stime, "|", this.ttl, "/", this.dur, "]", "(", this.mode, ")", this.text].join("");
    };
    CoreComment.LINEAR = function (t, b, c, d) {
      return t * c / d + b;
    };
    return CoreComment;
  })();

  var ScrollComment = (function (_super) {
    __extends(ScrollComment, _super);
    function ScrollComment(parent, data) {
      _super.call(this, parent, data);
      this.dur *= this.parent.options.scroll.scale;
      this.ttl *= this.parent.options.scroll.scale;
    }
    Object.defineProperty(ScrollComment.prototype, "alpha", {
      set: function (a) {
        this._alpha = a;
        this.dom.style.opacity = Math.min(Math.min(this._alpha, this.parent.options.global.opacity), this.parent.options.scroll.opacity) + "";
      },
      enumerable: true,
      configurable: true
    });

    ScrollComment.prototype.init = function (recycle) {
      if (typeof recycle === "undefined") { recycle = null; }
      _super.prototype.init.call(this, recycle);
      this.x = this.parent.width;
      if (this.parent.options.scroll.opacity < 1) {
        this.alpha = this._alpha;
      }
      this.absolute = true;
    };

    ScrollComment.prototype.update = function () {
      this.x = (this.ttl / this.dur) * (this.parent.width + this.width) - this.width;
    };
    return ScrollComment;
  })(CoreComment);

  /** 
   * Comment Filters Module Simplified (only supports modifiers & types)
   * @license MIT
   * @author Jim Chen
   */
  function CommentFilter(){
    this.modifiers = [];
    this.runtime = null;
    this.allowTypes = {
      "1":true,
      "4":true,
      "5":true,
      "6":true,
      "7":true,
      "8":true,
      "17":true
    };
    this.doModify = function(cmt){
      for(var k=0;k<this.modifiers.length;k++){
        cmt = this.modifiers[k](cmt);
      }
      return cmt;
    };
    this.beforeSend = function(cmt){
      return cmt;
    }
    this.doValidate = function(cmtData){
      if(!this.allowTypes[cmtData.mode])
        return false;
      return true;
    };
    this.addRule = function(rule){

    };
    this.addModifier = function(f){
      this.modifiers.push(f);
    };
    this.runtimeFilter = function(cmt){
      if(this.runtime == null)
        return cmt;
      return this.runtime(cmt);
    };
    this.setRuntimeFilter = function(f){
      this.runtime = f;
    }
  }

  /*!
   * Comment Core Library CommentManager
   * @license MIT
   * @author Jim Chen
   * 
   * Copyright (c) 2014 Jim Chen
   */
  var CommentManager = (function() {
    var getRotMatrix = function(yrot, zrot) {
      // Courtesy of @StarBrilliant, re-adapted to look better
      var DEG2RAD = Math.PI/180;
      var yr = yrot * DEG2RAD;
      var zr = zrot * DEG2RAD;
      var COS = Math.cos;
      var SIN = Math.sin;
      var matrix = [
        COS(yr) * COS(zr)    , COS(yr) * SIN(zr)     , SIN(yr)  , 0,
        (-SIN(zr))           , COS(zr)               , 0        , 0,
        (-SIN(yr) * COS(zr)) , (-SIN(yr) * SIN(zr))  , COS(yr)  , 0,
          0                    , 0                     , 0        , 1
      ];
      // CSS does not recognize scientific notation (e.g. 1e-6), truncating it.
      for(var i = 0; i < matrix.length;i++){
        if(Math.abs(matrix[i]) < 0.000001){
          matrix[i] = 0;
        }
      }
      return "matrix3d(" + matrix.join(",") + ")";
    };

    function CommentManager(stageObject){
      var __timer = 0;
      this._listeners = {};
      this.stage = stageObject;
      this.options = {
        global:{
          opacity:1,
          scale:1,
          className:"cmt"
        },
        scroll:{
          opacity:1,
          scale:1
        },
        limit: 0
      };
      this.timeline = [];
      this.runline = [];
      this.position = 0;
      this.limiter = 0;
      this.filter = null;
      this.csa = {
        scroll: new CommentSpaceAllocator(0,0),
        top:new AnchorCommentSpaceAllocator(0,0),
        bottom:new AnchorCommentSpaceAllocator(0,0),
        reverse:new CommentSpaceAllocator(0,0),
        scrollbtm:new CommentSpaceAllocator(0,0)
      };
      /** Precompute the offset width **/
      this.width = this.stage.offsetWidth;
      this.height = this.stage.offsetHeight;
      this.startTimer = function(){
        if(__timer > 0)
          return;
        var lastTPos = new Date().getTime();
        var cmMgr = this;
        __timer = window.setInterval(function(){
          var elapsed = new Date().getTime() - lastTPos;
          lastTPos = new Date().getTime();
          cmMgr.onTimerEvent(elapsed,cmMgr);
        },10);
      };
      this.stopTimer = function(){
        window.clearInterval(__timer);
        __timer = 0;
      };
    }

    /** Public **/
    CommentManager.prototype.stop = function(){
      this.stopTimer();
    };

    CommentManager.prototype.start = function(){
      this.startTimer();
    };

    CommentManager.prototype.seek = function(time){
      this.position = BinArray.bsearch(this.timeline, time, function(a,b){
        if(a < b.stime) return -1
        else if(a > b.stime) return 1;
        else return 0;
      });
    };

    CommentManager.prototype.validate = function(cmt){
      if(cmt == null)
        return false;
      return this.filter.doValidate(cmt);
    };

    CommentManager.prototype.load = function(a){
      this.timeline = a;
      this.timeline.sort(function(a,b){
        if(a.stime > b.stime) return 2;
        else if(a.stime < b.stime) return -2;
        else{
          if(a.date > b.date) return 1;
          else if(a.date < b.date) return -1;
          else if(a.dbid != null && b.dbid != null){
            if(a.dbid > b.dbid) return 1;
            else if(a.dbid < b.dbid) return -1;
            return 0;
          }else
            return 0;
        }
      });
      this.dispatchEvent("load");
    };

    CommentManager.prototype.insert = function(c){
      var index = BinArray.binsert(this.timeline, c, function(a,b){
        if(a.stime > b.stime) return 2;
        else if(a.stime < b.stime) return -2;
        else{
          if(a.date > b.date) return 1;
          else if(a.date < b.date) return -1;
          else if(a.dbid != null && b.dbid != null){
            if(a.dbid > b.dbid) return 1;
            else if(a.dbid < b.dbid) return -1;
            return 0;
          }else
            return 0;
        }
      });
      if(index <= this.position){
        this.position++;
      }
      this.dispatchEvent("insert");
    };

    CommentManager.prototype.clear = function(){
      while(this.runline.length > 0){
        this.runline[0].finish();
      }
      this.dispatchEvent("clear");
    };

    CommentManager.prototype.setBounds = function(){
      this.width = this.stage.offsetWidth;
      this.height= this.stage.offsetHeight;
      this.dispatchEvent("resize");
      for(var comAlloc in this.csa){
        this.csa[comAlloc].setBounds(this.width,this.height);
      }
      // Update 3d perspective
      this.stage.style.perspective = this.width * Math.tan(40 * Math.PI/180) / 2 + "px";
      this.stage.style.webkitPerspective = this.width * Math.tan(40 * Math.PI/180) / 2 + "px";
    };
    CommentManager.prototype.init = function(){
      this.setBounds();
      if(this.filter == null)
        this.filter = new CommentFilter(); //Only create a filter if none exist
    };
    CommentManager.prototype.time = function(time){
      time = time - 1;
      if(this.position >= this.timeline.length || Math.abs(this.lastPos - time) >= 2000){
        this.seek(time);
        this.lastPos = time;
        if(this.timeline.length <= this.position)
          return;
      }else{
        this.lastPos = time;
      }
      for(;this.position < this.timeline.length;this.position++){
        if(this.options.limit > 0 && this.runline.length > this.limiter) break;
        if(this.validate(this.timeline[this.position]) && this.timeline[this.position]['stime']<=time){
          this.send(this.timeline[this.position]);
        }else{
          break;
        }
      }
    };
    CommentManager.prototype.rescale = function(){

    };
    CommentManager.prototype.send = function(data){
      if(data.mode === 8){
        console.log(data);
        if(this.scripting){
          console.log(this.scripting.eval(data.code));
        }
        return;
      }
      if(this.filter != null){
        data = this.filter.doModify(data);
        if(data == null) return;
      }
      if(data.mode === 1 || data.mode === 2 || data.mode === 6){
        var cmt = new ScrollComment(this, data);
      }else{
        var cmt = new CoreComment(this, data);
      }
      switch(cmt.mode){
        case 1:cmt.align = 0;break;
        case 2:cmt.align = 2;break;
        case 4:cmt.align = 2;break;
        case 5:cmt.align = 0;break;
        case 6:cmt.align = 1;break;
      }
      cmt.init();
      this.stage.appendChild(cmt.dom);
      switch(cmt.mode){
        default:
        case 1:{this.csa.scroll.add(cmt);}break;
        case 2:{this.csa.scrollbtm.add(cmt);}break;
        case 4:{this.csa.bottom.add(cmt);}break;
        case 5:{this.csa.top.add(cmt);}break;
        case 6:{this.csa.reverse.add(cmt);}break;
        case 17:
        case 7:{
          if(data.rY !== 0 || data.rZ !== 0){
            /** TODO: revise when browser manufacturers make up their mind on Transform APIs **/
            cmt.dom.style.transform = getRotMatrix(data.rY, data.rZ);
            cmt.dom.style.webkitTransform = getRotMatrix(data.rY, data.rZ);
            cmt.dom.style.OTransform = getRotMatrix(data.rY, data.rZ);
            cmt.dom.style.MozTransform = getRotMatrix(data.rY, data.rZ);
            cmt.dom.style.MSTransform = getRotMatrix(data.rY, data.rZ);
          }
        }break;
      }
      cmt.y = cmt.y;
      this.dispatchEvent("enterComment", cmt);
      this.runline.push(cmt);
    };
    CommentManager.prototype.sendComment = function(data){
      console.log("CommentManager.sendComment is deprecated. Please use send instead");
      this.send(data); // Wrapper for Backwards Compatible APIs
    };
    CommentManager.prototype.finish = function(cmt){
      this.dispatchEvent("exitComment", cmt);
      this.stage.removeChild(cmt.dom);
      var index = this.runline.indexOf(cmt);
      if(index >= 0){
        this.runline.splice(index, 1);
      }
      switch(cmt.mode){
        default:
        case 1:{this.csa.scroll.remove(cmt);}break;
        case 2:{this.csa.scrollbtm.remove(cmt);}break;
        case 4:{this.csa.bottom.remove(cmt);}break;
        case 5:{this.csa.top.remove(cmt);}break;
        case 6:{this.csa.reverse.remove(cmt);}break;
        case 7:break;
      }
    };
    CommentManager.prototype.addEventListener = function(event, listener){
      if(typeof this._listeners[event] !== "undefined"){
        this._listeners[event].push(listener);
      }else{
        this._listeners[event] = [listener];
      }
    };
    CommentManager.prototype.dispatchEvent = function(event, data){
      if(typeof this._listeners[event] !== "undefined"){
        for(var i = 0; i < this._listeners[event].length; i++){
          try{
            this._listeners[event][i](data);
          }catch(e){
            console.err(e.stack);
          }
        }
      }
    };
    /** Static Functions **/
    CommentManager.prototype.onTimerEvent = function(timePassed,cmObj){
      for(var i= 0;i < cmObj.runline.length; i++){
        var cmt = cmObj.runline[i];
        if(cmt.hold){
          continue;
        }
        cmt.time(timePassed);
      }
    };
    return CommentManager;
  })();

  /** 
   * AcFun Format Parser
   * @license MIT License
   * An alternative format comment parser
   */
  function AcfunParser(jsond){
    var list = [];
    try{
      var jsondt = JSON.parse(jsond);
    }catch(e){
      console.log('Error: Could not parse json list!');
      return [];
    }
    for(var i=0;i<jsondt.length;i++){
      //Read each comment and generate a correct comment object
      var data = {};
      var xc = jsondt[i]['c'].split(',');
      if(xc.length > 0){
        data.stime = parseFloat(xc[0]) * 1000;
        data.color = parseInt(xc[1])
          data.mode = parseInt(xc[2]);
        data.size = parseInt(xc[3]);
        data.hash = xc[4];
        data.date = parseInt(xc[5]);
        data.position = "absolute";
        if(data.mode != 7){
          data.text = jsondt[i].m.replace(/(\/n|\\n|\n|\r\n|\\r)/g,"\n");
          data.text = data.text.replace(/\r/g,"\n");
          data.text = data.text.replace(/\s/g,"\u00a0");
        }else{
          data.text = jsondt[i].m;
        }
        if(data.mode == 7){
          //High level positioned dm
          try{
            var x = JSON.parse(data.text);
          }catch(e){
            console.log('[Err] Error parsing internal data for comment');
            console.log('[Dbg] ' + data.text);
            continue;
          }
          data.position = "relative";
          data.text = x.n; /*.replace(/\r/g,"\n");*/
          data.text = data.text.replace(/\ /g,"\u00a0");
          if(x.a != null){
            data.opacity = x.a;
          }else{
            data.opacity = 1;
          }
          if(x.p != null){
            data.x = x.p.x / 1000; // relative position
            data.y = x.p.y / 1000;
          }else{
            data.x = 0;
            data.y = 0;
          }
          data.shadow = x.b;
          data.dur = 4000;
          if(x.l != null)
            data.moveDelay = x.l * 1000;
          if(x.z != null && x.z.length > 0){
            data.movable = true;
            data.motion = [];
            var moveDuration = 0;
            var last = {x:data.x, y:data.y, alpha:data.opacity, color:data.color};
            for(var m = 0; m < x.z.length; m++){
              var dur = x.z[m].l != null ? (x.z[m].l * 1000) : 500;
              moveDuration += dur;
              var motion = {
                x:{from:last.x, to:x.z[m].x/1000, dur: dur, delay: 0},
                y:{from:last.y, to:x.z[m].y/1000, dur: dur, delay: 0}
              };
              last.x = motion.x.to;
              last.y = motion.y.to;
              if(x.z[m].t !== last.alpha){
                motion.alpha = {from:last.alpha, to:x.z[m].t, dur: dur, delay: 0};
                last.alpha = motion.alpha.to;
              }
              if(x.z[m].c != null && x.z[m].c !== last.color){
                motion.color = {from:last.color, to:x.z[m].c, dur: dur, delay: 0};
                last.color = motion.color.to;
              }
              data.motion.push(motion);
            }
            data.dur = moveDuration + (data.moveDelay ? data.moveDelay : 0);
          }
          if(x.r != null && x.k != null){
            data.rX = x.r;
            data.rY = x.k;
          }

        }
        list.push(data);
      }
    }
    return list;
  }

  /** 
   * Bilibili Format Parser
   * @license MIT License
   * Takes in an XMLDoc/LooseXMLDoc and parses that into a Generic Comment List
   **/
  function BilibiliParser(xmlDoc, text, warn){  
    function format(string){
      // Format the comment text to be JSON Valid.
      return string.replace(/\t/,"\\t");  
    }

    if(xmlDoc !== null){
      var elems = xmlDoc.getElementsByTagName('d');
    }else{
      if(!document || !document.createElement){
        // Maybe we are in a restricted context? Bail.
        return [];
      }
      if(warn){
        if(!confirm("XML Parse Error. \n Allow tag soup parsing?\n[WARNING: This is unsafe.]")){
          return [];
        }
      }else{
        // TODO: Make this safer in the future
        text = text.replace(new RegExp("</([^d])","g"), "</disabled $1");
        text = text.replace(new RegExp("</(\S{2,})","g"), "</disabled $1");
        text = text.replace(new RegExp("<([^d/]\W*?)","g"), "<disabled $1");
        text = text.replace(new RegExp("<([^/ ]{2,}\W*?)","g"), "<disabled $1");
      }
      var tmp = document.createElement("div");
      tmp.innerHTML = text;
      var elems = tmp.getElementsByTagName('d');
    }

    var tlist = [];
    for(var i=0;i < elems.length;i++){
      if(elems[i].getAttribute('p') != null){
        var opt = elems[i].getAttribute('p').split(',');
        if(!elems[i].childNodes[0])
          continue;
        var text = elems[i].childNodes[0].nodeValue;
        var obj = {};
        obj.stime = Math.round(parseFloat(opt[0])*1000);
        obj.size = parseInt(opt[2]);
        obj.color = parseInt(opt[3]);
        obj.mode = parseInt(opt[1]);
        obj.date = parseInt(opt[4]);
        obj.pool = parseInt(opt[5]);
        obj.position = "absolute";
        if(opt[7] != null)
          obj.dbid = parseInt(opt[7]);
        obj.hash = opt[6];
        obj.border = false;
        if(obj.mode < 7){
          obj.text = text.replace(/(\/n|\\n|\n|\r\n)/g, "\n");
        }else{
          if(obj.mode == 7){
            try{
              adv = JSON.parse(format(text));
              obj.shadow = true;
              obj.x = parseFloat(adv[0]);
              obj.y = parseFloat(adv[1]);
              if(Math.floor(obj.x) < obj.x || Math.floor(obj.y) < obj.y){
                obj.position = "relative";
              }
              obj.text = adv[4].replace(/(\/n|\\n|\n|\r\n)/g, "\n");
              obj.rZ = 0;
              obj.rY = 0;
              if(adv.length >= 7){
                obj.rZ = parseInt(adv[5], 10);
                obj.rY = parseInt(adv[6], 10);
              }
              obj.motion = [];
              obj.movable = false;
              if(adv.length >= 11){
                obj.movable = true;
                var singleStepDur = 500;
                var motion = {
                  x:{from: obj.x, to:parseFloat(adv[7]), dur:singleStepDur, delay:0},
                  y:{from: obj.y, to:parseFloat(adv[8]), dur:singleStepDur, delay:0},
                };
                if(adv[9] !== ''){
                  singleStepDur = parseInt(adv[9], 10);
                  motion.x.dur = singleStepDur;
                  motion.y.dur = singleStepDur;
                }
                if(adv[10] !== ''){
                  motion.x.delay = parseInt(adv[10], 10);
                  motion.y.delay = parseInt(adv[10], 10);
                }
                if(adv.length > 11){
                  obj.shadow = adv[11];
                  if(obj.shadow === "true"){
                    obj.shadow = true;
                  }
                  if(obj.shadow === "false"){
                    obj.shadow = false;
                  }
                  if(adv[12] != null){
                    obj.font = adv[12];
                  }
                  if(adv.length > 14){
                    // Support for Bilibili Advanced Paths
                    if(obj.position === "relative"){
                      console.log("Cannot mix relative and absolute positioning");
                      obj.position = "absolute";
                    }
                    var path = adv[14];
                    var lastPoint = {x:motion.x.from, y:motion.y.from};
                    var pathMotion = [];
                    var regex = new RegExp("([a-zA-Z])\\s*(\\d+)[, ](\\d+)","g");
                    var counts = path.split(/[a-zA-Z]/).length - 1;
                    var m = regex.exec(path);
                    while(m !== null){
                      switch(m[1]){
                        case "M":{
                          lastPoint.x = parseInt(m[2],10);
                          lastPoint.y = parseInt(m[3],10);
                        }break;
                        case "L":{
                          pathMotion.push({
                            "x":{"from":lastPoint.x, "to":parseInt(m[2],10), "dur": singleStepDur / counts, "delay": 0},
                            "y":{"from":lastPoint.y, "to":parseInt(m[3],10), "dur": singleStepDur / counts, "delay": 0}
                          });
                          lastPoint.x = parseInt(m[2],10);
                          lastPoint.y = parseInt(m[3],10);
                        }break;
                      }
                      m = regex.exec(path);
                    }
                    motion = null;
                    obj.motion = pathMotion;
                  }
                }
                if(motion !== null){
                  obj.motion.push(motion);
                }
              }
              obj.dur = 2500;
              if(adv[3] < 12){
                obj.dur = adv[3] * 1000;
              }
              var tmp = adv[2].split('-');
              if(tmp != null && tmp.length>1){
                var alphaFrom = parseFloat(tmp[0]);
                var alphaTo = parseFloat(tmp[1]);
                obj.opacity = alphaFrom;
                if(alphaFrom !== alphaTo){
                  obj.alpha = {from:alphaFrom, to:alphaTo}
                }
              }
            }catch(e){
              console.log('[Err] Error occurred in JSON parsing');
              console.log('[Dbg] ' + text);
            }
          }else if(obj.mode == 8){
            obj.code = text; //Code comments are special
          }
        }
        if(obj.text != null)
          obj.text = obj.text.replace(/\u25a0/g,"\u2588");
        tlist.push(obj);
      }
    }
    return tlist;
  }
  var ABP = {
    "version":"0.8.0.1-sMod_bili"
  };

  (function(){
    "use strict";
    if(!ABP) return;
    //var $ = function (e) { return document.getElementById(e); };
    var _ = function (type, props, children, callback) {
      var elem = null;
      if (type === "text") {
        return document.createTextNode(props);
      } else {
        elem = document.createElement(type);
      }
      for(var n in props){
        if(n === "style"){
          for(var x in props.style){
            elem.style[x] = props.style[x];
          }
        }else if(n === "className"){
          elem.className = props[n];
        }else if (n === "html") {
          elem.innerHTML = props[n];
        } else if (n === "tooltip") {
          elem.tooltip = props[n];
          addClass( elem.tooltip, "ABP-Tooltip");
          elem.addEventListener("mouseover", function(e){
            document.body.appendChild(elem.tooltip);
            var pr=document.documentElement.getBoundingClientRect();
            var er=elem.getBoundingClientRect();
            var tr=elem.tooltip.getBoundingClientRect();
            if (er.bottom+5+tr.height<document.documentElement.clientHeight) {
              elem.tooltip.style.left=(er.left-pr.left+er.width/2-tr.width/2)+"px";
              elem.tooltip.style.top=(er.bottom-pr.top+2)+"px";
            } else {
              elem.tooltip.style.left=(er.left-pr.left+er.width+2)+"px";
              elem.tooltip.style.top=(er.top-pr.top+er.height/2-tr.height/2)+"px";
            }
            var tr=elem.tooltip.getBoundingClientRect();
            if (tr.right>document.documentElement.clientWidth) {
              elem.tooltip.style.left=(er.left-pr.left-tr.width-2)+"px";
            } else if (tr.left<0) {
              elem.tooltip.style.left=(er.left-pr.left+er.width+2)+"px";
            }
            if (typeof elem.updatetooltip !== "undefined" && elem.updatetooltip) elem.updatetooltip(e);
          });
          elem.addEventListener("mousemove", function(e){
            if (typeof elem.updatetooltip !== "undefined" && elem.updatetooltip) elem.updatetooltip(e);
          });
          elem.addEventListener("mouseout", function(){
            document.body.removeChild(elem.tooltip);
          });
        } else if (n === "updatetooltip") {
          elem.updatetooltip = props[n];
        }else {
          elem.setAttribute(n, props[n]);
        }
      }
      if (children) {
        for(var i = 0; i < children.length; i++){
          if(children[i] != null)
            elem.appendChild(children[i]);
        }
      }
      if (callback && typeof callback === "function") {
        callback(elem);
      }
      return elem;
    };
    var addClass = function(elem, className){
      if(elem == null) return;
      var oldClass = elem.className.split(" ");
      if(oldClass.indexOf(className) < 0){
        oldClass.push(className);
      }
      elem.className = oldClass.join(" ");
    };
    var hasClass = function(elem, className){
      if(elem == null) return false;
      var oldClass = elem.className.split(" ");
      return oldClass.indexOf(className) >= 0;
    };
    var removeClass = function(elem, className){
      if(elem == null) return;
      var oldClass = elem.className.split(" ");
      if(oldClass.indexOf(className) >= 0){
        oldClass.splice(oldClass.indexOf(className),1);
      }
      elem.className = oldClass.join(" ");
    };
    var buildFromDefaults = function (n, d){
      var r = {};
      for(var i in d){
        if(n && typeof n[i] !== "undefined")
          r[i] = n[i];
        else
          r[i] = d[i];
      }
      return r;
    }
    var makeEvent= function(eventname) {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent(eventname, false, false);
      return evt;
    };
    var makebar = function(elem, updatetooltip) {
      var  mainbar = _("div", {
        "className": "dark"
      });
      var secondarybar = _("div", {
        "className": "load"
      });
      var _bar;
      if (typeof updatetooltip !== "undefined") {
        _bar = _("div", {
          "className": "bar",
          "tooltip":_("div",{}),
          "updatetooltip":updatetooltip,
        },[secondarybar,mainbar ]);
      } else {
        _bar = _("div", {
          "className": "bar"
        },[secondarybar,mainbar ]);
      }
      elem.appendChild(_bar);
      elem.bar = _bar;
      var _main,_secondary;
      elem.progress = {
        get main() {
          return _main;
        },
        set main(x) {
          if (typeof x !== "number" || x<0 || x>100) return;
          _main = x;
          mainbar.style.width = x + "%";
        },
          get secondary() {
            return _secondary;
          },
          set secondary(x) {
            if (typeof x !== "number" || x<0 || x>100) return;
            _secondary = x;
            secondarybar.style.width = x + "%";
          },
      };
      elem.progress.main = 0;
      elem.progress.secondary = 0;
      elem.dragging = false;
      var dragrate;
      _bar.addEventListener("mousedown", function(e){
        elem.dragging = true;
        var pos = e.clientX-this.getBoundingClientRect().left;
        if (pos>=0 && pos<=this.offsetWidth) dragrate=pos*100/this.offsetWidth;
        elem.progress.main = dragrate;
        elem.dispatchEvent(new Event("startdrag"));
      });
      document.addEventListener("mouseup", function(e){
        if (elem.dragging) {
          elem.dragging = false;
          elem.dispatchEvent(new Event("stopdrag"));
        }
      });
      _bar.addEventListener("mouseup", function(e){
        elem.dragging=false;
        var pos = e.clientX-this.getBoundingClientRect().left;
        if (pos>=0 && pos<=this.offsetWidth) dragrate=pos*100/this.offsetWidth;
        elem.progress.main = dragrate;
        elem.dispatchEvent(new Event("stopdrag"));
      });
      _bar.addEventListener("mousemove", function(e){
        if(elem.dragging) {
          var pos = e.clientX-this.getBoundingClientRect().left;
          if (pos>=0 && pos<=this.offsetWidth) {
            dragrate=pos*100/this.offsetWidth;
            elem.progress.main = dragrate;
            elem.dispatchEvent(makeEvent("ondrag"));
          }
        }
      });
      return elem;
    };


    var convTime = function(t) {
      var sec=parseInt(t);
      var min=parseInt(sec/60);
      sec%=60;
      return min+":"+(sec<10?"0":"")+sec;
    }

    var pad0 = function(num, n) {  
      var len = num.toString().length;  
      while(len < n) {  
        num = "0" + num;  
        len++;  
      }  
      return num;  
    } 

    var makeDmItem = function(dm) {
      var d = new Date(dm.date*1000);
      return _("div",{
        "className":"ABP-CommentList-Item",
      },[
      _("div", {
        "className":"time",
        "html":convTime(parseInt(dm.stime/1000)),
      }),
      _("div", {
        "className":"content",
        "html":dm.text,
        "tooltip":_("div",{
          "html":dm.text,
        }),
      }),
      _("div", {
        "className":"date",
        "html":(d.getMonth()+1)+"-"+d.getDate()+" "+d.getHours()+":"+pad0(d.getMinutes(),2),
        "tooltip":_("div",{
          "html":d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" "+d.getHours()+":"+pad0(d.getMinutes(),2)+":"+pad0(d.getSeconds(),2),
        }),
      })
      ]);
    };

    ABP.create = function (element, params) {
      var elem = element;
      if(!params){
        params = {};
      }
      params = buildFromDefaults(params,{
        "replaceMode":true,
        "width":1280,
        "height":640,
        "src":"",
        "mobile":false
      });
      if (typeof element === "string") {
        elem = document.getElementById(element);
      }
      if(elem.children.length > 0 && params.replaceMode){
        elem.innerHTML = "";
      }
      // 'elem' is the parent container in which we create the player.
      var container;
      if(!hasClass(elem, "ABP-Unit")){
        container = _("div", {
          "className": "ABP-Unit",
          "style":{
            "width": params.width + "px",
            "height": params.height + "px"
          }
        });
        elem.appendChild(container);
      }else{
        container = elem;
      }
      var playlist = [];
      if(typeof params.src === "string"){
        params.src = _("video",{
          "className":"ABP-VideoItem",
          "preload":"meatdata",
        },[
        _("source",{
          "src":params.src
        })
        ]);
        playlist.push(params.src);
      }else if(params.src.hasOwnProperty("playlist")){
        var data = params.src;
        var plist = data.playlist;
        for(var id = 0; id < plist.length; id++){
          if(plist[id].hasOwnProperty("sources")){
            var sources = [];
            for(var mime in plist[id]["sources"]){
              sources.push(_("source", {
                "src":plist[id]["sources"][mime],
                "type":mime
              }));
            }
            playlist.push(_("video",{
              "className":id==0?"ABP-VideoItem":"ABP-VideoItem ABP-VideoItemHidden",
              "preload":"metadata",
            },sources));
          }else if(plist[id].hasOwnProperty("video")){
            playlist.push(plist[id]["video"]);
          }else{
            console.log("No recognized format");
          }
        }
      }else{
        playlist.push(params.src);
      }
      var _video=[];
      for (var i=0;i<playlist.length;i++) _video.push(playlist[i]);
      _video.push(_("div", {
        "className":"ABP-Container"
      }));
      container.appendChild(_("div",{
        "className":"ABP-Player"
      },[
      _("div",{
        "className" : "ABP-Video",
        "tabindex" : "10"	
      }, 
      _video),
      _("div", {
        "className":"ABP-Toolbar",
      }, [
      _("div", {
        "className":"ABP-Text",
      },[
      _("div", {
        "className" : "button ABP-CommentFont",
        "tooltip":_("div",{
          "html":"弹幕大小与弹幕模式（未实现）",
        }),
      }),
      _("div", {
        "className" : "button ABP-CommentColor",
        "tooltip":_("div",{
          "html":"弹幕颜色（未实现）",
        }),
      }),
      _("div", {
        "className" : "button right ABP-CommentSend",
        "tooltip":_("div",{
          "html":"毁灭地喷射白光！da！",
        }),
        "html":"发送 >",
      }),
        _("div", {
          "className": "ABP-TextBox autofill",
        },[
        _("input", {
          "type":"text"
        }),
        ]),
        ]),
          _("div", {
            "className":"ABP-Control"
          },[
          _("div", {
            "className": "button ABP-Play",
            "tooltip":_("div",{
              "html":"播放/暂停",
            }),
          }),
          _("div", {
            "className": "button right ABP-FullScreen",
            "tooltip":_("div",{
              "html":"全屏播放",
            }),
          }),
          _("div", {
            "className": "button right ABP-FullWindow",
            "tooltip":_("div",{
              "html":"网页全屏",
            }),
          }),
            _("div", {
              "className": "button right ABP-WideScreen",
              "tooltip":_("div",{
                "html":"宽屏",
              }),
            }),
            _("div", {
              "className": "button right ABP-Loop",
              "tooltip":_("div",{
                "html":"洗脑循环",
              }),
            }),
              _("div", {
                "className": "button right ABP-CommentShow",
                "tooltip":_("div",{
                  "html":"弹幕开关",
                }),
              }),
              _("div",{
                "className":"ABP-Opacity",
              },[
              _("div",{
                "html":"透明度",
              }),
              _("div",{
                "className":"opacity-bar",
              }),
              ]),
                _("div", {
                  "className": "volume-bar right",
                  "tooltip":_("div",{
                    "html":"音量调节",
                  }),
                }),
                _("div", {
                  "className": "button right ABP-VolumeButton",
                  "tooltip":_("div",{
                    "html":"静音",
                  }),
                }),
                  _("div", {
                    "className": "right ABP-TimeLabel",
                  }),
                  _("div", {
                    "className": "ABP-progress-bar autofill",
                  }),
                    ]),
                    ]),
                      _("div", {
                        "className": "box ABP-CommentFont-Box"
                      }),
                      _("div", {
                        "className": "box ABP-CommentColor-Box"
                      })
          ]));
          container.appendChild(_("div",{
            "className":"ABP-CommentList ABP-SideBlock"
          },[
          _("div",{
            "className":"ABP-CommentList-Title"
          },[
          _("div", {
            "className":"time",
            "html":"时间"
          }),
          _("div", {
            "className":"content",
            "html":"评论"
          }),
          _("div", {
            "className":"date",
            "html":"发送日期",
          })
          ]),
          _("div",{
            "className":"ABP-CommentList-Container"
          })
          ]));
          container.appendChild(_("div",{
            "className":"ABP-InfoBox ABP-SideBlock"
          },[
          //todo
          ]));
          container.appendChild(_("div",{
            "className":"ABP-Settings ABP-SideBlock"
          },[
          //todo
          ]));
          var bind = ABP.bind(container, params.mobile);
          if (params.src.hasOwnProperty("danmaku")) {
            bind.cmManager.timeline = [];
            CommentLoader(params.src.danmaku, bind.cmManager, function(){
              for (var i=0;i<bind.cmManager.timeline.length;i++) {
                bind.cmList.appendChild(makeDmItem(bind.cmManager.timeline[i]));
              }
            });
          }
          if (typeof ABP_Restyle !== "undefined") ABP_Restyle();
          return bind;
    }

    ABP.bind = function (playerUnit, mobile, state) {
      // private values
      var currentTime=0;
      var dragging = false;
      var waitting = false;
      var eventListeners = [];
      var mutevol = 100;
      // public instance
      var ABPInst = {
        btnPlay:null,
        divComment:null,
        btnFullScr:null,
        btnFullWin:null,
        btnWide:null,
        btnDm:null,
        btnLoop:null,
        videos:null,
        timeLabel:null,
        divTextField:null,
        txtText:null,
        cmManager:null,
        cmList:null,
        currentItem:0,
        duration:0,
        buffered:0,
        defaults:{
          w:0,
          h:0
        },
        state:buildFromDefaults(state, {
          widescreen: false,
          fullwindow: false,
          fullscreen: false,
          allowRescale: false,
          autosize: false,
          loop:false,
          danmaku:true,
          mute:false,
        }),
        resetLayout:null,
        wideScreen:null,
        fullWindow:null,
        ready:false,
        play:null,
        pause:null,
        playing:false,
          get currentTime() {
            return currentTime;
          },
          set currentTime(x) {
            seekto(x);
          },
        addListener:null,
        dispatch:null,
        disableTime:15,
      };


      // private functions
      function changeItem(item) {
        removeClass(ABPInst.videos[item],"ABP-VideoItemHidden");
        for (var i=0;i<ABPInst.videos.length;i++) {
          if (i!=item) {
            addClass(ABPInst.videos[i],"ABP-VideoItemHidden");
          }
        }
        ABPInst.currentItem=item; 
      }
      function seekto(pos) {
        ABPInst.videos[ABPInst.currentItem].pause();
        var item = 0;
        while ( item<ABPInst.videos.length && pos > ABPInst.videos[item].duration ) {
          pos -= ABPInst.videos[item].duration;
          item++;
        }
        if (item>=ABPInst.videos.length ) return;
        ABPInst.videos[item].currentTime=pos;
        changeItem(item);
        //currentTime=pos;
        if (ABPInst.cmManager) {
          ABPInst.cmManager.time(parseInt(pos*1000));
          ABPInst.cmManager.clear();
        }
        if (ABPInst.playing) {
          if (ABPInst.cmManager && ABPInst.state.danmaku)
            ABPInst.cmManager.startTimer();
          ABPInst.videos[ABPInst.currentItem].play();
        }
      }
      var time2rate = function(t) {
        return t*100/ABPInst.duration;
      }

      // event mechanics
      ABPInst.addListener = function(type, listener) {
        if (typeof type !== "string") {
          console.err(type+" is not a event name");
          return;
        }
        if (typeof listener !== "function") {
          console.err(listener+" is not a listener");
          return;
        }
        if (typeof eventListeners[type] == "undefined") eventListeners[type]=[];
        eventListeners[type].push(listener);
      };
      ABPInst.dispatch = function(type, msg) {
        if (typeof eventListeners[type] == "undefined") return;
        for (var i=0;i<eventListeners[type].length;i++) {
          if (typeof msg !== "undefined") eventListeners[type][i](msg);
          else eventListeners[type][i]();
        }
      };

      // layout settings
      ABPInst.resetLayout = function(){
        var e;
        ABPInst.state.widescreen=false;
        ABPInst.state.fullwindow=false;
        ABPInst.state.fullscreen=false;
        // if fullscreen
        if(window.outerHeight==screen.height && window.outerWidth==screen.width){
          var el = document;
          var cfs = el.cancelFullScreen || el.webkitCancelFullScreen || 
            el.mozCancelFullScreen || el.exitFullScreen;
          if(typeof cfs != "undefined" && cfs) {
            cfs.call(el);
          } else if(typeof window.ActiveXObject != "undefined") {
            //for IE
            var wscript = new ActiveXObject("WScript.Shell");
            if(wscript != null) {
              wscript.SendKeys("{F11}");
            }
          }
        }
        removeClass(playerUnit,"ABP-Wide");
        removeClass(playerUnit,"ABP-Full");
        removeClass(playerUnit,"ABP-Screen");
        removeClass(document.getElementsByTagName("body")[0],"ABP-NoScroll");
        if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
      };
      ABPInst.wideScreen = function(){
        ABPInst.resetLayout();
        addClass(playerUnit, "ABP-Wide");
        ABPInst.state.widescreen=true;
        if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
      };
      ABPInst.fullWindow = function(){
        ABPInst.resetLayout();
        addClass(playerUnit, "ABP-Full");
        addClass(document.getElementsByTagName("body")[0],"ABP-NoScroll");
        ABPInst.state.fullwindow=true;
        if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
      };
      ABPInst.fullScreen = function(){
        ABPInst.fullWindow();
        var el = document.documentElement;
        var rfs = el.requestFullScreen || el.webkitRequestFullScreen || 
          el.mozRequestFullScreen || el.msRequestFullScreen;
        if(typeof rfs != "undefined" && rfs) {
          rfs.call(el);
        } else if(typeof window.ActiveXObject != "undefined") {
          //for IE
          var wscript = new ActiveXObject("WScript.Shell");
          if(wscript != null) {
            wscript.SendKeys("{F11}");
          }
        }
        addClass(playerUnit, "ABP-Screen");
        if (ABPInst.cmManager) ABPInst.cmManager.setBounds();
        setTimeout(function(){ABPInst.state.fullscreen=true;},100);
      };

      // player controls
      ABPInst.play = function() {
        if (ABPInst.playing) return;
        ABPInst.videos[ABPInst.currentItem].play();
        if (ABPInst.cmManager && ABPInst.state.danmaku) ABPInst.cmManager.startTimer();
        ABPInst.playing = true;
        ABPInst.dispatch("play");
      };
      ABPInst.pause = function() {
        if (!ABPInst.playing) return;
        ABPInst.videos[ABPInst.currentItem].pause();
        if (ABPInst.cmManager) ABPInst.cmManager.stop();
        ABPInst.playing = false;
        ABPInst.dispatch("pause");
      };
      ABPInst.setLoop = function(x) {
        if(x){
          ABPInst.state.loop=true;
          addClass(ABPInst.btnLoop,"ABP-LoopOn");
        }else{
          ABPInst.state.loop=false;
          removeClass(ABPInst.btnLoop,"ABP-LoopOn");
        }
      };
      ABPInst.setDanmaku = function(x) {
        if (x) {
          ABPInst.cmManager.time(parseInt(ABPInst.currentTime*1000));
          ABPInst.cmManager.clear();
          ABPInst.cmManager.startTimer();
          removeClass(ABPInst.btnDm, "ABP-DanmakuOff");
        } else {
          ABPInst.cmManager.stopTimer();
          ABPInst.cmManager.clear();
          addClass(ABPInst.btnDm, "ABP-DanmakuOff");
        }
        ABPInst.state.danmaku = x;
      };

      ABPInst.mute = function(x) {
        if (x == ABPInst.state.mute) return;
        ABPInst.state.mute = x;
        if (x) {
          mutevol = ABPInst.barVolume.progress.main;
          ABPInst.barVolume.progress.main = 0;
          addClass(ABPInst.btnVolume, "muted");
        } else {
          ABPInst.barVolume.progress.main = mutevol;
          removeClass(ABPInst.btnVolume, "muted");
        }
      };




      /* start binding */
      ABPInst.videos = playerUnit.getElementsByClassName("ABP-VideoItem");
      ABPInst.btnPlay = playerUnit.getElementsByClassName("ABP-Play")[0];
      ABPInst.barProgress = makebar(playerUnit.getElementsByClassName("ABP-progress-bar")[0],null);
      ABPInst.btnFullWin = playerUnit.getElementsByClassName("ABP-FullWindow")[0];
      ABPInst.btnFullScr = playerUnit.getElementsByClassName("ABP-FullScreen")[0];
      ABPInst.btnWide = playerUnit.getElementsByClassName("ABP-WideScreen")[0];
      ABPInst.btnLoop = playerUnit.getElementsByClassName("ABP-Loop")[0];
      ABPInst.btnVolume = playerUnit.getElementsByClassName("ABP-VolumeButton")[0];
      ABPInst.barVolume = makebar(playerUnit.getElementsByClassName("volume-bar")[0]);
      ABPInst.barOpacity = makebar(playerUnit.getElementsByClassName("opacity-bar")[0],null);
      ABPInst.divTextField = playerUnit.getElementsByClassName("ABP-Text")[0];
      ABPInst.txtText = ABPInst.divTextField.getElementsByTagName("input")[0];
      ABPInst.btnDm = playerUnit.getElementsByClassName("ABP-CommentShow")[0];
      ABPInst.divComment = playerUnit.getElementsByClassName("ABP-Container")[0];
      ABPInst.timeLabel = playerUnit.getElementsByClassName("ABP-TimeLabel")[0];
      ABPInst.btnSend = playerUnit.getElementsByClassName("ABP-CommentSend")[0];
      ABPInst.videoarea = playerUnit.getElementsByClassName("ABP-Video")[0];
      ABPInst.cmList = playerUnit.getElementsByClassName("ABP-CommentList-Container")[0];

      ABPInst.defaults.w = ABPInst.divComment.offsetWidth; 
      ABPInst.defaults.h = ABPInst.divComment.offsetHeight;

      // bind danmaku
      if(typeof CommentManager !== "undefined"){
        ABPInst.cmManager = new CommentManager(ABPInst.divComment);
        ABPInst.cmManager.init();
        ABPInst.cmManager.clear();
      }

      ABPInst.timeLabel.setTime = function(t) {
        this.innerHTML = convTime(t)+"/"+convTime(ABPInst.duration);
      }

      /* set events */

      // fullscreen monitor
      window.addEventListener("resize", function(){
        if (ABPInst.state.fullscreen && !(window.outerHeight==screen.height && window.outerWidth==screen.width))
          ABPInst.resetLayout();
      });
      //video events
      for (var i=0;i<ABPInst.videos.length;i++) {
        var v=ABPInst.videos[i];
        var readyNum = 0;
        v.itemNo=i;
        v.buffComplete=false;
        v.addEventListener("loadedmetadata",function(){
          ABPInst.duration += ABPInst.videos[this.itemNo].duration;
          readyNum++;
          if (readyNum == ABPInst.videos.length) {
            ABPInst.ready=true;
            console.log("ABP duration "+ABPInst.duration);
            ABPInst.timeLabel.setTime(0);
            /* Force start to buffer */
            ABPInst.videos[0].play();
            ABPInst.videos[0].pause();

            ABPInst.dispatch("ready");
          }
          ABPInst.videos[0].dispatchEvent(makeEvent("progress"));
        });
        var loaded = false;
        var bufferingItem = 0;
        v.addEventListener("progress", function(){
          var buff=0,b;
          var i;
          for (i=0;i<ABPInst.currentItem;i++) b+=ABPInst.videos[i].duration;
          for (;i<ABPInst.videos.length;i++) {
            try{
              b = ABPInst.videos[i].buffered.end(0);
            } catch(e) {
              break;
            }
            buff += b;
            if (b<ABPInst.videos[i].duration) break;
          }
          ABPInst.buffered=buff;
          ABPInst.dispatch("progress");
          if (ABPInst.buffered==ABPInst.duration) ABPInst.dispatch("buffered");
          else if (this.buffered.length>0 && this.buffered.end(0) == this.duration && this.itemNo+1 != ABPInst.currentItem && this.itemNo+1 < ABPInst.videos.length) {
            ABPInst.videos[this.itemNo+1].play();
            ABPInst.videos[this.itemNo+1].pause();
          }
        });
        v.addEventListener("timeupdate", function() {
          if (this.itemNo != ABPInst.currentItem) return;
          if (waitting && ABPInst.cmManager && ABPInst.state.danmaku) ABPInst.cmManager.startTimer();
          waitting = false;
          var nowtime=this.currentTime;
          for (var ii=0;ii<this.itemNo;ii++) nowtime+=ABPInst.videos[ii].duration;
          currentTime=nowtime;
          if (!dragging) {
            ABPInst.timeLabel.setTime(nowtime);
            ABPInst.barProgress.progress.main=time2rate(nowtime);
          }
          ABPInst.cmManager.time(parseInt(nowtime*1000));
        });
        v.addEventListener("waitting", function(){
          if (this.itemNo == ABPInst.currentItem) {
            if ((!waitting) && ABPInst.cmManager)  ABPInst.cmManager.stopTimer();
            waitting = true;
          }
        });
        v.addEventListener("ended", function() {
          if (this.itemNo != ABPInst.currentItem) return;
          if (this.itemNo<ABPInst.videos.length-1) {
            changeItem(this.itemNo+1);
            ABPInst.videos[this.itemNo+1].currentTime=0;
            ABPInst.videos[this.itemNo+1].play();
          } else {
            if (ABPInst.state.loop) {
              seekto(0);
            } else {
              ABPInst.playing=false;
              ABPInst.dispatch("stop");
            }
          }
        });
      }
      //buttons
      ABPInst.btnFullScr.addEventListener("click", function(){
        if(!ABPInst.state.fullscreen){
          ABPInst.fullScreen();
        }else{
          ABPInst.resetLayout();
        }
      });
      ABPInst.btnFullWin.addEventListener("click", function(){
        if((!ABPInst.state.fullwindow)||ABPInst.state.fullscreen) {
          ABPInst.fullWindow();;
        } else {
          ABPInst.resetLayout();
        }
      });
      ABPInst.btnWide.addEventListener("click",function(){
        if(!ABPInst.state.widescreen)
          ABPInst.wideScreen();
        else
          ABPInst.resetLayout();
      });
      ABPInst.btnDm.addEventListener("click", function(){
        ABPInst.setDanmaku(!ABPInst.state.danmaku);
      });
      ABPInst.btnLoop.addEventListener("click", function(){
        ABPInst.setLoop(!ABPInst.state.loop);
      });
      ABPInst.btnPlay.addEventListener("click", function(){
        if(!ABPInst.playing){
          ABPInst.play();
        }else{
          ABPInst.pause();
        }
      });
      ABPInst.videoarea.addEventListener("click", function(){
        if(!ABPInst.playing){
          ABPInst.play();
        }else{
          ABPInst.pause();
        }
      });
      //progress bar
      ABPInst.barProgress.addEventListener("stopdrag", function(){
        dragging = false;
        seekto(this.progress.main / 100 * ABPInst.duration);
      });
      ABPInst.barProgress.addEventListener("ondrag", function(){
        dragging = true;
        ABPInst.timeLabel.setTime(this.progress.main/100*ABPInst.duration);
      });
      ABPInst.barProgress.bar.updatetooltip = function(e) {
        var pos = e.clientX-this.getBoundingClientRect().left;
        if (pos>=0 && pos<=this.offsetWidth) {
          this.tooltip.innerHTML = convTime(pos*ABPInst.duration/this.offsetWidth);
        }
        var pr = document.body.getBoundingClientRect();
        var er = this.getBoundingClientRect();
        var tr = this.tooltip.getBoundingClientRect();
        this.tooltip.style.left = (pos+er.left-pr.left-tr.width/2)+"px";
        this.tooltip.style.top = (er.top-pr.top-tr.height+2)+"px";
      };
      // mute button
      ABPInst.btnVolume.addEventListener("click", function(){
        ABPInst.mute(!ABPInst.state.mute);
      });
      //volume bar
      ABPInst.barVolume.progress.main=100;
      ABPInst.barVolume.addEventListener("stopdrag", function(){
        for (var i=0;i<ABPInst.videos.length;i++) {
          ABPInst.videos[i].volume = ABPInst.barVolume.progress.main/100;
        }
      });
      ABPInst.barVolume.addEventListener("ondrag", function(){
        for (var i=0;i<ABPInst.videos.length;i++) {
          ABPInst.videos[i].volume = ABPInst.barVolume.progress.main/100;
        }
      });
      ABPInst.barVolume.addEventListener("startdrag", function(){
        ABPInst.mute(false);
      });
      //opacity bar
      ABPInst.barOpacity.progress.main=100;
      ABPInst.barOpacity.addEventListener("stopdrag",function(){
        ABPInst.cmManager.options.global.opacity = ABPInst.barOpacity.progress.main/100;
      });
      ABPInst.barOpacity.addEventListener("ondrag",function(){
        ABPInst.cmManager.options.global.opacity = ABPInst.barOpacity.progress.main/100;
      });
      ABPInst.barOpacity.bar.updatetooltip = function(e) {
        var pos = e.clientX-this.getBoundingClientRect().left;
        if (pos>=0 && pos<=this.offsetWidth) {
          this.tooltip.innerHTML = parseInt(pos/this.offsetWidth*100)/100;
        }
        var pr = document.body.getBoundingClientRect();
        var er = this.getBoundingClientRect();
        var tr = this.tooltip.getBoundingClientRect();
        this.tooltip.style.left = (pos+er.left-pr.left-tr.width/2)+"px";
      };

      //UI Reactions
      ABPInst.addListener("play",function(){
        ABPInst.cmManager.setBounds();
        addClass(ABPInst.btnPlay,"ABP-Playing");
      });
      ABPInst.addListener("pause",function(){
        removeClass(ABPInst.btnPlay,"ABP-Playing");
      });
      ABPInst.addListener("stop",function(){
        removeClass(ABPInst.btnPlay,"ABP-Playing");
      });
      ABPInst.addListener("progress",function(){
        ABPInst.barProgress.progress.secondary=time2rate(ABPInst.buffered);
      });


      //
      /* danmaku events */
      //todo
      function makeDanmaku() {
        return {
          "mode": 1,
          "stime": parseInt(ABPInst.currentTime*1000),
          "text": ABPInst.txtText.value,
          "size": 25,
          "color": 0xffffff,
          "date": parseInt((new Date()).valueOf()/1000),
        };
      }
      ABPInst.dminsert=function (dm) {
        ABPInst.cmManager.insert(dm);
        ABPInst.cmList.appendChild(makeDmItem(dm));
      };
      ABPInst.dmsend=function(dm) {
        ABPInst.cmManager.send(dm);
      };
      ABPInst.btnSend.addEventListener("click", function(){
        ABPInst.dispatch("senddanmaku", makeDanmaku());
      });
      ABPInst.txtText.addEventListener("keydown", function(e){
        if (e&&e.keyCode == 13) {
          ABPInst.dispatch("senddanmaku", makeDanmaku());
        }
      });
      ABPInst.addListener("senddanmaku", function(dm) {
        console.log("send danmaku: "+dm);
        ABPInst.txtText.value="发射器冷却中......";
        ABPInst.txtText.setAttribute("disabled","disabled");
        setTimeout(function() {
          ABPInst.txtText.value="";
          ABPInst.txtText.removeAttribute("disabled");
        }, ABPInst.disableTime*1000);
      });

      /* key events */
      playerUnit.addEventListener("keydown", function(e){
        if(e && e.keyCode == 32 && document.activeElement !== ABPInst.txtText){
          ABPInst.btnPlay.click();
          e.preventDefault();
        }
      });

      /** Create a bound CommentManager if possible **/
      if(typeof CommentManager !== "undefined"){
        if(ABPInst.state.autosize){
          var autosize = function(){
            if(video.videoHeight === 0 || video.videoWidth === 0){
              return;
            }
            var aspectRatio = video.videoHeight / video.videoWidth;
            // We only autosize within the bounds
            var boundW = playerUnit.offsetWidth;
            var boundH = playerUnit.offsetHeight;
            var oldASR = boundH / boundW;

            if(oldASR < aspectRatio){
              playerUnit.style.width = (boundH / aspectRatio) + "px";
              playerUnit.style.height = boundH  + "px";
            }else{
              playerUnit.style.width = boundW + "px";
              playerUnit.style.height = (boundW * aspectRatio) + "px";
            }

            ABPInst.cmManager.setBounds();
          };
          video.addEventListener("loadedmetadata", autosize);
          autosize();
        }
      }
      return ABPInst;
    }
  })();
  return ABP;
});
