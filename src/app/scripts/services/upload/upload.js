/**
 * @file upload.js 
 * A simple uploader with resume support
 * 
 * @author swordfeng
 * @author voidrank
 **/


var Uploader;
(function(){
	
	/**
	 * Ajax maker
	 *
	 * @param method HTTP request method
	 * @param url requested url
	 * @param data POST data (set to undefined if not exists)
	 * @param headers object that contains HTTP request headers
	 *
	 * @return
	 **/
	function ajax(method, url, data, headers) {
		if (typeof data == "undefined") data=null;
		if (typeof headers == "undefined") headers={};
		return new Promise(function(resolve, reject){
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if (xhr.status > 0 && xhr.status < 400) {
						resolve(xhr.responseText);
					} else {
						reject(Error(xhr.responseText));
					}
				}
			};
			xhr.open(method, url, true);
			for (var i in headers) {
				xhr.setRequestHeader(i, headers[i]);
			}
			xhr.send(data);
		});
	}
	
	/**
	 * JSON parser
	 *
	 * @param json a json string
	 *
	 * @return object
	 **/
	var parseJSON = function(json){return JSON.parse(json);};

	/** 
	 * Uploader Object Constructor
	 *
	 * @param file :File html file object
	 * @param onStatusChange(info_obj) :function called when checksum/upload status change
	 * @param config :object a set of config
	 * @param callback :function(result) called when finished
	 * @param onerror :function(err) called when exception occurs
	 *
	 * @return a new upload object, which represents a file that is being uploaded
	 * @exception
	 **/
	Uploader = function(file, onStatusChange, config, callback, onerror){

		/** checksum progress **/
		Object.defineProperty(this, "checksumprog", {
			get: function() {return checksumprog;}
		});
		/** checksum result **/
		Object.defineProperty(this, "checksum", {
			get: function() {return sum;}
		});
		/** upload progress **/
		Object.defineProperty(this, "uploadprog", {
			get: function() {return uploadprog;}
		});

		// defaults
		if (typeof onStatusChange != "function") 
			onStatusChange = function(obj) {};
		if (typeof callback != "function") 
			callback = function() {};
		if (typeof onerror != "function") 
			onerror = function(e) {throw e};

		if (typeof config == "undefined" || config == null) 
			var config = {};
		config['size'] = file.size;
		if (typeof(config['url']) == "undefined")
			config["url"] = window.location.href;
		if (typeof(config['collection']) == "undefined")
			config['collection'] = ['test'];
		if (typeof(config['chunksize']) == "undefined") 
			config['chunksize'] = 1048576;
		if (typeof(config['filename']) == "undefined")
			config['filename'] = file.name; 

		// self object
		var obj = this;

		// upload token
		var token;

		// upload chunk position
		var seqnow = 0;
		// upload chunk count
		var seqs = parseInt(file.size / config.chunksize);

		// upload chunk size
		var chunksize = config["chunksize"];
		var pos = 0;
		// file reader
		var reader = new FileReader(); 

		// checksum chunk size
		var checksumchunk = 131072;

		// checksum result
		var sum;

		// progress values in percentage
		var checksumprog = 0;
		var uploadprog = 0;

		// start working
		onStatusChange(obj);

		/* --- STAGE 1 --- */
		/* checksum before upload */
		sha256_init();
		/* init promise */
		var chain = Promise.resolve(0);
		/* calculate sha256sum */
		for (var p = 0; p < parseInt( (file.size - 1) / checksumchunk + 1); p++) {
			chain = chain.then(function(pos) {
				return new Promise(function(resolve, reject) {
					var thischunk = pos+checksumchunk < file.size ? checksumchunk : file.size-pos;
					reader.onload = function() {
						checksumprog = pos / file.size * 100;
						onStatusChange(obj);
						sha256_update(new Uint8Array(this.result), thischunk);
						resolve(pos + thischunk);
					};
					reader.readAsArrayBuffer(file.slice(pos, pos+thischunk));
				});
			});
		}
		/* finalize sha256sum */
		chain = chain.then(function(){
			sha256_final();
			sum = sha256_encode_hex();
			console.log('file checksum: '+sum);
			checksumprog = 100;
			onStatusChange(obj);
		})
		/* --- STAGE 2 --- */
		/* get token from sessions && return last seq */
		.then(function(){
			console.log(config.url + "upload/session/");
			return ajax("GET", config.url + "upload/session/");
		})
		.then(parseJSON)
		.then(function(sessions){
			var f = 0;
			for (; f < sessions.length; f++) {
				if (sessions[f].hash == sum) break;
			}
			if (f >= sessions.length) {
				config['hash'] = sum;
				return ajax("POST", config.url+"upload/init/", JSON.stringify(config))
				.then(parseJSON)
				.then(function(res) {token = res.token; return 0;})
			} else {
				token = sessions[f].token;
				if (sessions[f].chunksize) config.chunksize=sessions[f].chunksize;
				return ajax("GET", config.url+"upload/chunk/"+token)
				.then(parseJSON)
				.then(function(res) {
					var list = [];
					for (var i = 0; i < seqs; i++) list[i] = false;
					for (var i = 0; i < res.length; i++) {
						list[res[i].seq] = true;
					}
					seqnow = seqs;
					for (var i = 0; i < seqs; i++) if (!list[i]) {seqnow = i; break;}
					return seqnow;
				});
			}
		})
		/* --- STAGE 3 --- */
		/* upload chunks */
		.then(function(seqnow){
			var upchain = Promise.resolve(seqnow);
			for (var i = seqnow; i < seqs; i++) {
				upchain = upchain.then(function(seq) {
					return new Promise(function(resolve, reject){
						var offset = config.chunksize * seq;
						var chunksize = offset + config.chunksize*2 <= file.size ? config.chunksize : file.size - offset;
						var reader = new FileReader();
						reader.onload = function(e) {
							onStatusChange(obj);
							var data = new Uint8Array(this.result);
							var hash = sha256_digest(data);
							ajax("PUT", config.url+"upload/chunk/"+token+"/?hash="+hash+"&seq="+seq, this.result, {
								"Content-Type": "application/x-www-form-urlencoded"
							}).then(function(m){
								uploadprog = offset * 100 / file.size;
								onStatusChange(obj);
							}).then(function(){resolve(seq + 1)});
						};
						reader.readAsArrayBuffer(file.slice(offset, offset + chunksize));
					});
				});
			}
			return upchain;
		})
		/* --- STAGE 4 --- */
		/* finish upload */
		.then(function(seq) {
			uploadprog = 100;
			onStatusChange(obj);
			return ajax("GET", config.url+"upload/store/"+token);
		})
		.then(parseJSON)
		.then(function(res){
			console.log(res);
			callback(res);
		})
		.catch(function(e){
			onerror(e);
		});
	};

})();
