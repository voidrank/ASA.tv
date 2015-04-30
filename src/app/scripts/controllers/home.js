define('homeController', ['app', 'jquery', 'UploadVideoCover', 'sparkMD5', 'factories', 'less!homeStyle', 'css!ngDropdownStyle'],
    function (app, $, UploadVideoCover, sparkMD5) {

        app

            .controller('home', function ($scope, $http) {
                $scope.tab = [];
                for (var i = 0; i < 6; ++i)
                    $scope.tab[i] = {};
                $scope.changeTab = function (tabIndex) {
                    for (var i = 0; i < 6; ++i)
                        $scope.tab[i].isActive = false;
                    $scope.tab[tabIndex].isActive = true;
                }
                $scope.changeTab(4);

            })


            .controller('tab2', ['$scope', '$http', 'myUploadUrl', 'videoCoverUrl', 'playerUrl', function ($scope, $http, myUploadUrl, videoCoverUrl, playerUrl) {
                $scope.videoCoverUrl = videoCoverUrl;
                $scope.playerUrl = playerUrl;
                $scope.muUpload = [];
                $http.get(myUploadUrl)
                    .success(function (res) {
                        $scope.myUpload = res;
                    })
                    .error(function (res) {
                        $scope.myUpload = [];
                    })
            }])


            .controller('tab4', ['$scope', '$http', 'collectionUrl', 'apiUrl', function ($scope, $http, collectionUrl, apiUrl) {
                //collections Selected
                $scope.collection = {};
                $scope.collection.options = [];
                $scope.collection.selected = {
                    'name': '请选择'
                };
                $http.get(collectionUrl + 'is_member_of')
                    .success(function (res) {
                        $scope.collection.options = res;
                        console.log($scope.collection.options);
                    });

                //cover upload
                uploadVideoCover = new UploadVideoCover(
                    document.getElementById('video-cover'),
                    document.getElementById('video-cover-preview'),
                    {'url': apiUrl + '/video/cover/'});

                // upload controller
                setTimeout(function () {
                    var md5 = '';
                    var form_data = [];

                    function calculate_md5(file, chunk_size) {
                        var slice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                            chunks = Math.ceil(file.size / chunk_size),
                            current_chunk = 0,
                            spark = new sparkMD5.ArrayBuffer();

                        function onload(e) {
                            spark.append(e.target.result); // append chunk
                            current_chunk++;
                            if (current_chunk < chunks) {
                                read_next_chunk();
                            } else {
                                md5 = spark.end();
                            }
                        };
                        function read_next_chunk() {
                            var reader = new FileReader();
                            reader.onload = onload;
                            var start = current_chunk * chunk_size,
                                end = Math.min(start + chunk_size, file.size);
                            reader.readAsArrayBuffer(slice.call(file, start, end));
                        };
                        read_next_chunk();
                    }

                    $('#chunked_upload').fileupload({
                        url: apiUrl + '/chunked_upload/',
                        dataType: "json",
                        formData: form_data,
                        maxChunkSize: 100000, // Chunks of 100kB
                        add: function (e, data) { // Called before starting upload
                            $('#messages').empty();
                            calculate_md5(data.files[0], 100000); // Again, chunks of 100kB
                            data.submit();
                        },
                        chunkdone: function (e, data) { // Called after uploading each chunk
                            if (form_data.length <= 1) {
                                form_data.push(
                                    {"name": "upload_id", "value": data.result.upload_id}
                                );
                            }
                            $('#messages').append($('<p>').text(JSON.stringify(data.result)));
                            var progress = parseInt(data.loaded / data.total * 100.0, 10);
                            $("#progress").text(Array(progress).join("=") + "> " + progress + "%");
                        },
                        done: function (e, data) { // Called when the file has completely uploaded
                            $.ajax({
                                type: "POST",
                                url: apiUrl + '/chunked_upload_complete/',
                                data: {
                                    upload_id: data.result.upload_id,
                                    md5: md5,
                                },
                                dataType: "json",
                                success: function (data) {
                                    $("#messages").append($('<p>').text(JSON.stringify(data)));
                                },
                            });
                        }
                    });
                }, 0);
            }]);
    }
);
