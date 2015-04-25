'use strict';
/**
 * @file upload.js 
 * A simple uploader with resume support
 * 
 * @author swordfeng
 * @author voidrank
 **/
define('Uploader', [], function() {
    var Uploader;
    (function() {

        /**
         * Ajax maker
         *
         * @param method HTTP request method
         * @param url requested url
         * @param data POST data (set to undefined if not exists)
         * @param headers object that contains HTTP request headers
         *
         * @return promise
         **/
        function ajax(method, url, data, headers) {
            if (typeof data === "undefined") data = null;
            if (typeof headers === "undefined") headers = {};
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
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
        
        function fReader(blob) {
			return new Promise(function(resolv, reject) {
				var reader = new FileReader();
				reader.onload = function(r) {
					resolv(r.target.result);
				};
				reader.onerror = function(r) {
					reject(this.error);
				};
				reader.readAsArrayBuffer(blob);
			});
		}
		
        /**
         * JSON parser
         *
         * @param json a json string
         *
         * @return object
         **/
        var parseJSON = function(json) {
            return JSON.parse(json);
        };

        /** 
         * Uploader Object Constructor
         *
         * @param file :File html file object
         * @param onStatusChange(info_obj) :function called when checksum/upload status change
         * @param config :object a set of config
         * @param callback :function (result) called when finished
         * @param onerror :function (err) called when exception occurs
         *
         * @return a new upload object, which represents a file that is being uploaded
         * @exception
         **/
        Uploader = function(file, config) {

            this.file = file;
            if (typeof config !== "undefined") this.config = config;
            else this.config = {};
            this.__progress__ = {
                checksum: 0,
                upload: 0,
            };
            this.progress = {
				__progress__: this.__progress__
			};
            console.log("prog set");
            
            
            var sha256 = new SHA256();

            

            // self object
            var self = this;

            // upload token
            var token, sqenow, seqs, chunksize, pos = 0, checksumchunk = 131072;

            // upload chunk position
            var seqnow = 0;
            // upload chunk count
            var seqs;
            

            /* --- STAGE 1 --- */
            /* init promise */
            var chain = new Promise(function(resolv, reject) {
				self.upload = function() {
					if (typeof self.config['url'] === "undefined") {
						var err = new Error("url is not defined");
						reject(err);
						throw err;
					}
					self.config['size'] = file.size;
					if (typeof self.config['chunksize'] === "undefined")
						config['chunksize'] = 1048576;
					if (typeof self.config['filename'] === "undefined")
						config['filename'] = file.name;
						
					chunksize = self.config["chunksize"];
					seqs = parseInt(file.size / chunksize) || 1;
					resolv();
				};
			})
			.then(function() {
                self.__emit__("init");
			    sha256.sha256_init();
                return 0;
            });
            /* calculate sha256sum */
            for (var p = 0; p < parseInt((file.size - 1) / checksumchunk + 1); p++) {
                chain = chain.then(function(pos) {
                    var thischunk = pos + checksumchunk < file.size ? checksumchunk : file.size - pos;
                    return fReader(file.slice(pos, pos + thischunk)).then(function(result) {
                        if (self.__canceled__) throw new Error("User Canceled");
						self.__progress__.checksum = pos / file.size * 100;
						self.__emit__("progress", self.progress);
						self.__emit__("progressChecksum", self.progress);
						sha256.sha256_update(new Uint8Array(result), thischunk);
						return (pos + thischunk);
                    });
                });
            }
            /* finalize sha256sum */
            chain = chain.then(function() {
				sha256.sha256_final();
				self.__sum__ = sha256.sha256_encode_hex();
				self.__progress__.checksum = 100;
				self.__emit__("checksum", self.__sum__);
			})
			/* --- STAGE 2 --- */
			/* get token from sessions && return last seq */
			.then(function() {
				return ajax("GET", config.url + "upload/session/");
			})
			.then(parseJSON)
			.then(function(sessions) {
				sessions.map(function(sess) {
					if (sess.hash === self.__sum__) {
						return sess;
					}
				});
				return false;
			})
			.then(function(sess) {
				if (!sess) {
					config['hash'] = self.__sum__;
					return ajax("POST", config.url + "upload/init/", JSON.stringify(config))
						.then(parseJSON)
						.then(function(res) {
							token = res.token;
							return 0;
						})
				} else {
					token = sess.token;
					if (sess.chunksize) config.chunksize = sess.chunksize;
					return ajax("GET", config.url + "upload/chunk/" + token)
						.then(parseJSON)
						.then(function(res) {
							var list = [];
							for (var i = 0; i < seqs; i++) list[i] = false;
							for (var i = 0; i < res.length; i++) {
								list[res[i].seq] = true;
							}
							seqnow = seqs;
							for (var i = 0; i < seqs; i++)
								if (!list[i]) {
									seqnow = i;
									break;
								}
							return seqnow;
						});
				}
			})
			/* --- STAGE 3 --- */
			/* upload chunks */
			.then(function(seqnow) {
				var upchain = Promise.resolve(seqnow);
				for (var i = seqnow; i < seqs; i++) {
					console.log("seqs:", seqs);
					upchain = upchain.then(function(seq) {
						var offset = config.chunksize * seq;
						var chunksize = offset + config.chunksize * 2 <= file.size ? config.chunksize : file.size - offset;
						return fReader(file.slice(offset, offset + chunksize)).then(function(result) {
							if (self.__canceled__) reject(new Error("User Canceled"));
							var data = new Uint8Array(result);
							var hash = sha256.sha256_digest(data);
							return ajax("PUT", config.url + "upload/chunk/" + token + "/?hash=" + hash + "&seq=" + seq, result, {
								"Content-Type": "application/x-www-form-urlencoded"
							}).then(function(m) {
								self.__progress__.upload = offset * 100 / file.size;
								self.__emit__("progress", self.progress);
								self.__emit__("progressUpload", self.progress);
							}).then(function() {
								return (seq + 1);
							});
						});
					});
				}
				return upchain;
			})
			/* --- STAGE 4 --- */
			/* finish upload */
			.then(function(seq) {
				self.__progress__.upload = 100;
				self.__emit__("progress", self.progress);
				self.__emit__("progressUpload", self.progress);
				self.__emit__("upload");
				return ajax("GET", config.url + "upload/store/" + token);
			})
			.then(parseJSON)
			.then(function(res) {
				self.__emit__("finish", res);
			})
			.catch(function(e) {
				self.__emit__("error", e)
			});
        };

        Uploader.prototype.__canceled__ = false;
        Uploader.prototype.cancel = function() {
            this.__canceled__ = true;
        };

        Uploader.prototype.__events__ = {};
        Uploader.prototype.on = function(evt, cb) {
            if (typeof evt !== "string") throw new Error("Event name is not a string");
            if (typeof cb !== "function") throw new Error("Event listener is not a function");
            if (typeof this.__events__[evt] === "undefined") {
                this.__events__[evt] = [];
            }
            this.__events__[evt].push(cb);
        };
        Uploader.prototype.__emit__ = function(evt) {
            if (typeof this.__events__[evt] === "undefined") return;
            var args = Array.prototype.slice.call(arguments, 1);
            var self = this;
            this.__events__[evt].map(function(cb) {
                cb.apply(self, args);
            });
        };

        Uploader.prototype.progress = {
            get checksum() {
                return this.__progress__.checksum;
            },
            get upload() {
                return this.__progress__.upload;
            }
        };

        Object.defineProperty(Uploader.prototype, "checksum", {
            get: function() {
                return this.__sum__;
            }
        });

    })();


    /*
     * A JavaScript implementation of the SHA256 hash function.
     *
     * FILE:    sha256.js
     * VERSION:    0.8
     * AUTHOR:    Christoph Bichlmeier <informatik@zombiearena.de>
     *
     * NOTE: This version is not tested thoroughly!
     *
     * Copyright (c) 2003, Christoph Bichlmeier
     * All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions
     * are met:
     * 1. Redistributions of source code must retain the above copyright
     *    notice, this list of conditions and the following disclaimer.
     * 2. Redistributions in binary form must reproduce the above copyright
     *    notice, this list of conditions and the following disclaimer in the
     *    documentation and/or other materials provided with the distribution.
     * 3. Neither the name of the copyright holder nor the names of contributors
     *    may be used to endorse or promote products derived from this software
     *    without specific prior written permission.
     *
     * ======================================================================
     *
     * THIS SOFTWARE IS PROVIDED BY THE AUTHORS ''AS IS'' AND ANY EXPRESS
     * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
     * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
     * ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHORS OR CONTRIBUTORS BE
     * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
     * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
     * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
     * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
     * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
     * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
     * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */

    var SHA256 = function() {
        "use strict";
        /* SHA256 logical functions */
        function rotateRight(n, x) {
            n = n | 0;
            x = x | 0;
            return ((x >>> n) | (x << (32 - n))) | 0;
        }

        function choice(x, y, z) {
            x = x | 0;
            y = y | 0;
            z = z | 0;
            return ((x & y) ^ (~x & z)) | 0;
        }

        function majority(x, y, z) {
            x = x | 0;
            y = y | 0;
            z = z | 0;
            return ((x & y) ^ (x & z) ^ (y & z)) | 0;
        }

        function sha256_Sigma0(x) {
            x = x | 0;
            return (rotateRight(2, x) ^ rotateRight(13, x) ^ rotateRight(22, x)) | 0;
        }

        function sha256_Sigma1(x) {
            x = x | 0;
            return (rotateRight(6, x) ^ rotateRight(11, x) ^ rotateRight(25, x)) | 0;
        }

        function sha256_sigma0(x) {
            x = x | 0;
            return (rotateRight(7, x) ^ rotateRight(18, x) ^ (x >>> 3)) | 0;
        }

        function sha256_sigma1(x) {
            x = x | 0;
            return (rotateRight(17, x) ^ rotateRight(19, x) ^ (x >>> 10)) | 0;
        }

        function sha256_expand(W, j) {
            j = j | 0;
            return (W[j & 0x0f] = (W[j & 0x0f] + sha256_sigma1(W[(j + 14) & 0x0f] | 0) + W[(j + 9) & 0x0f] +
                sha256_sigma0(W[(j + 1) & 0x0f] | 0)) | 0) | 0;
        }

        /* Hash constant words K: */
        var K256 = new Array(
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
            0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
            0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
            0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
            0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
            0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
            0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
            0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
            0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        );

        /* global arrays */
        var ihash, count, buffer;
        var sha256_hex_digits = "0123456789abcdef";

        /* Add 32-bit integers with 16-bit operations (bug in some JS-interpreters: 
        overflow) */
        function safe_add(x, y) {
            x = x | 0;
            y = y | 0;
            return (x + y) | 0;
        }

        /* Initialise the SHA256 computation */
        function sha256_init() {
            ihash = new Array(8);
            count = new Array(2);
            buffer = new Array(64);
            count[0] = count[1] = 0;
            ihash[0] = 0x6a09e667;
            ihash[1] = 0xbb67ae85;
            ihash[2] = 0x3c6ef372;
            ihash[3] = 0xa54ff53a;
            ihash[4] = 0x510e527f;
            ihash[5] = 0x9b05688c;
            ihash[6] = 0x1f83d9ab;
            ihash[7] = 0x5be0cd19;
        }

        /* Transform a 512-bit message block */
        function sha256_transform() {
            var a, b, c, d, e, f, g, h, T1, T2;
            var W = new Array(16);

            /* Initialize registers with the previous intermediate value */
            a = ihash[0] | 0;
            b = ihash[1] | 0;
            c = ihash[2] | 0;
            d = ihash[3] | 0;
            e = ihash[4] | 0;
            f = ihash[5] | 0;
            g = ihash[6] | 0;
            h = ihash[7] | 0;

            /* make 32-bit words */
            for (var i = 0; i < 16; i++)
                W[i] = ((buffer[(i << 2) + 3]) | (buffer[(i << 2) + 2] << 8) | (buffer[(i << 2) + 1] << 16) | (buffer[i << 2] << 24)) | 0;

            for (var j = 0; j < 64; j = (j + 1) | 0) {
                T1 = (h + sha256_Sigma1(e | 0) + choice(e | 0, f | 0, g | 0) + K256[j]) | 0;
                if (j < 16) T1 = (T1 + W[j]) | 0;
                else T1 = (T1 + sha256_expand(W, j | 0)) | 0;
                T2 = (sha256_Sigma0(a | 0) + majority(a | 0, b | 0, c | 0)) | 0;
                h = g | 0;
                g = f | 0;
                f = e | 0;
                e = safe_add(d | 0, T1 | 0) | 0;
                d = c | 0;
                c = b | 0;
                b = a | 0;
                a = safe_add(T1 | 0, T2 | 0) | 0;
            }

            /* Compute the current intermediate hash value */
            ihash[0] = (ihash[0] + a) | 0;
            ihash[1] = (ihash[1] + b) | 0;
            ihash[2] = (ihash[2] + c) | 0;
            ihash[3] = (ihash[3] + d) | 0;
            ihash[4] = (ihash[4] + e) | 0;
            ihash[5] = (ihash[5] + f) | 0;
            ihash[6] = (ihash[6] + g) | 0;
            ihash[7] = (ihash[7] + h) | 0;
        }

        /* Read the next chunk of data and update the SHA256 computation */
        function sha256_update(data, inputLen) {
            var i, index, curpos = 0;
            /* Compute number of bytes mod 64 */
            index = ((count[0] >> 3) & 0x3f);
            var remainder = (inputLen & 0x3f);

            /* Update number of bits */
            if ((count[0] += (inputLen << 3)) < (inputLen << 3)) count[1]++;
            count[1] += (inputLen >> 29);

            /* Transform as many times as possible */
            for (i = 0; i + 63 < inputLen; i += 64) {
                for (var j = index; j < 64; j++)
                    buffer[j] = data[curpos++] | 0;
                sha256_transform();
                index = 0;
            }

            /* Buffer remaining input */
            for (var j = 0; j < remainder; j++)
                buffer[j] = data[curpos++] | 0;
        }

        /* Finish the computation by operations such as padding */
        function sha256_final() {
            var index = ((count[0] >> 3) & 0x3f);
            buffer[index++] = 0x80;
            if (index <= 56) {
                for (var i = index; i < 56; i++)
                    buffer[i] = 0;
            } else {
                for (var i = index; i < 64; i++)
                    buffer[i] = 0;
                sha256_transform();
                for (var i = 0; i < 56; i++)
                    buffer[i] = 0;
            }
            buffer[56] = (count[1] >>> 24) & 0xff;
            buffer[57] = (count[1] >>> 16) & 0xff;
            buffer[58] = (count[1] >>> 8) & 0xff;
            buffer[59] = count[1] & 0xff;
            buffer[60] = (count[0] >>> 24) & 0xff;
            buffer[61] = (count[0] >>> 16) & 0xff;
            buffer[62] = (count[0] >>> 8) & 0xff;
            buffer[63] = count[0] & 0xff;
            sha256_transform();
        }

        /* Split the internal hash values into an array of bytes */
        this.sha256_encode_bytes = function() {
            var j = 0;
            var output = new Array(32);
            for (var i = 0; i < 8; i++) {
                output[j++] = ((ihash[i] >>> 24) & 0xff);
                output[j++] = ((ihash[i] >>> 16) & 0xff);
                output[j++] = ((ihash[i] >>> 8) & 0xff);
                output[j++] = (ihash[i] & 0xff);
            }
            return output;
        }

        /* Get the internal hash as a hex string */
        this.sha256_encode_hex = function() {
            var output = new String();
            for (var i = 0; i < 8; i++) {
                for (var j = 28; j >= 0; j -= 4)
                    output += sha256_hex_digits.charAt((ihash[i] >>> j) & 0x0f);
            }
            return output;
        }

        /* Main function: returns a hex string representing the SHA256 value of the 
        given data */
        this.sha256_digest = function(data) {
            sha256_init();
            sha256_update(data, data.length);
            sha256_final();
            return this.sha256_encode_hex();
        }

        this.sha256_init = sha256_init;
        this.sha256_update = sha256_update;
        this.sha256_final = sha256_final;

    };
    return Uploader;
});
