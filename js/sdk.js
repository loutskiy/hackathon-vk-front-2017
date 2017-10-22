//        alert(window.location.href);
var user_id = 0;
var news_id = 0;
var news_id_g = 0;
var location_global = '';
var sort = 'rating'
var category_id = 0;
$(document).ready(function () {
    $('#danger-news').hide()
    getCategories()
    getStopList()
    $('#date-for-post').mask('00/00/0000 00:00');
    $('div #raiting').hide();
    $('#stop-list').hide();
    $('#raiting2').on('click', function (e) {
        e.preventDefault();
        $('#raiting2').addClass("active");
        $('#home2').removeClass("active");
        $('#stop-list2').removeClass('active')
        $('#raiting').show();
        console.log("должно выводить");
        $('#home').hide();
        $('#stop-list').hide();
        getRating()
    })
    $('#home2').on('click', function (e) {
        e.preventDefault();
        $('#home2').addClass("active");
        $('#stop-list2').removeClass('active')
        $('#raiting2').removeClass('active')
        $('#raiting').hide();
        $('#stop-list').hide();
        $('#home').show();
    })
    $('#stop-list2').on('click', function (e) {
        e.preventDefault();
        $('#stop-list2').addClass("active");
        $('#home2').removeClass("active");
        $('#raiting2').removeClass('active')
        $('#raiting').hide();
        $('#stop-list').show();
        $('#home').hide();
    })
    $('#sort-rating').on('click', function (e) {
        e.preventDefault();
        sort = 'rating'
        getNewsForAdmin()
    })
    $('#sort-date').on('click', function (e) {
      e.preventDefault();
      sort = 'date';
      getNewsForAdmin()
    })
    $('.card').on('click', function (e) {
        e.preventDefault();
        console.log("Выбрана карточка")
    })
    $('#cardModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var recipient = button.data('whatever') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this)
//                modal.find('.modal-title').text('New message to ' + recipient)
//         modal.find('.modal-body input').val(recipient)
        getComments(parseInt(recipient))
        console.log("news_id_g "+news_id_g)
        if (news_id_g != 0) {
            news_id = news_id_g
            news_id_g = 0
        } else {
            news_id = parseInt(recipient)
        }
        console.log("news_id " + news_id)
        var data = {
            id: news_id,
            userId: user_id
        }

        axios.post('/api/getNewsById', data)
            .then(function (response) {
                console.log("statusss " + parseInt(response.data.result.status))
                if (parseInt(response.data.result.status) == 3) {
                    $('.modal-footer').hide()
                } else {
                    $('.modal-footer').show()
                }
                $('.card-title').text(response.data.result.user.name)
                $('#message-text').text(response.data.result.data)
                $('#avatar').attr('src', response.data.result.user.avatar).load (function () {
                    this.width
                })
            })

        var dataCat = {
            limit: 100,
            offset: 0
        }
        axios.post('/api/admin/getCategories', dataCat)
            .then(function (response) {
                $('#inputState').empty()
                $.each(response.data.result, function (index, value) {
                    $('#inputState').append("<option value='"+value.id+"'>"+value.name+"</option>")
                })
            })
        $('#decline-action').on('click', function (e) {
            e.preventDefault()
            var data = {
                newsId: news_id,
                userId: user_id
            }
            axios.post('/api/admin/declineNews', data)
                .then(function (response) {
                    $('#cardModal').modal('hide')
                    getNewsForAdmin()
                })
        })
        $('#accept-action').on('click', function (e) {
            e.preventDefault()
            var postDate = Date.parse($('#date-for-post').val());
            console.log('postDate' + postDate)
            data = {
                owner_id: -155410240,
                from_group: 1,
                message: $('#message-text').val()
            }
            if (postDate > 0) {
                data = {
                    owner_id: -155410240,
                    from_group: 1,
                    message: $('#message-text').val(),
                    publish_date: postDate/1000
                }
            }
            console.log(postDate)
            VK.api("wall.post", data, function (data) {
                console.log(data)
            })
            var data = {
                newsId: news_id,
                userId: user_id
            }
            axios.post('/api/admin/acceptNews', data)
                .then(function (response) {
                    $('#cardModal').modal('hide')
                    getNewsForAdmin()
                })
        })
        $('#edit-action').on('click', function (e) {
            e.preventDefault()
            var data = {
                newsId: news_id,
                userId: user_id
            }
            axios.post('/api/admin/editNews', data)
                .then(function (response) {
                    $('#cardModal').modal('hide')
                    getNewsForAdmin()
                })
        })
    })
    $('#addCategoryModal').on('show.bs.modal', function (event) {
//                var button = $(event.relatedTarget) // Button that triggered the modal
        var modal = $(this)
        var addButton = modal.find('#add-category')
        $(addButton).on('click', function (e) {
            e.preventDefault();
            var data = {
                name: modal.find('.modal-body input').val()
            }
            axios.post('/api/admin/createCategory', data)
                .then(function (response) {
                    $('#addCategoryModal').modal('hide')
                    getCategories()
                })
        })
    })
    // Метод для добавления в стоп-лист
    var formAddStopList = $('form-add-stop-list')
    console.log("formAddStopList" + formAddStopList)
    var buttonAddStopList = formAddStopList.find('#form-add-stop-list-button')
    console.log("buttonAddStopList" + buttonAddStopList)
    $('#form-add-stop-list-button').on('click', function (e) {
        e.preventDefault()
        console.log("buttonAddStopList")
        var data = {
            name: $('#inlineFormInputGroupDomainName').val()
        }
        axios.post('/api/admin/createStopItem', data)
            .then(function (response) {
                console.log(response)
                $('#inlineFormInputGroupDomainName').val('')
                getStopList()
            })
    })
    $('#send-news-button').on('click', function (e) {
        e.preventDefault();
        console.log($('#file2').val())
        var text = $('#text-news').val()
        var data = {
            userId: user_id,
            data: text
        }
        axios.post('/api/suggestNews', data)
            .then(function (response) {
                $('#danger-news').hide()
                console.log(response)
                getNews()
            })
            .catch(function (response) {
                $('#danger-news').show()
            })
    })
    $('#send-comment').on('click', function (e) {
        e.preventDefault()
        var text = $('#comment-text').val()
        var data = {
            newsId: news_id,
            userId: user_id,
            data: text
        }
        axios.post('/api/admin/addComment', data)
            .then(function (response) {
                $('#comment-text').val('')
                console.log(response)
                getComments(news_id)
            })
            .catch(function (response) {
            })
    })
});

function getRating () {
    var data = {
        limit: 100,
        offset: 0
    }
    axios.post('/api/admin/getUsersForAdmin', data)
        .then(function (response) {
            $('#raiting-list').empty()
            $.each(response.data.result, function (index, value) {
                $('#raiting-list').append("<tr>\n" +
                    "                        <th scope=\"row\">"+(index+1)+"</th>\n" +
                    "                        <td>"+value.name+"</td>\n" +
                    "                        <td>"+value.rating+"</td>\n" +
                    "                        <td>"+value.newsCount+"</td>\n" +
                    "                        <td><button type=\"button\" class=\"btn btn-danger\">Наградить</button></td>\n" +
                    "                    </tr>")
            })
        })
}

function getCategories () {
    var data = {
        limit: 100,
        offset: 0
    }
    axios.post('/api/admin/getCategories', data)
        .then(function (response) {
            $('#list-tab').empty()
            $('#list-tab').append("<a class=\"list-group-item list-group-item-action active\" id=\"list-home-list\" data-toggle=\"list\" href=\"#list-home\" role=\"tab\" aria-controls=\"home\">Все</a>")
            $.each(response.data.result, function (index, value) {
                $('#list-tab').append("<a class=\"list-group-item list-group-item-action\" id=" + index + " data-toggle=\"list\" href=\"#" + index + "\" role=\"tab\" aria-controls="+ index +">" + value.name + "</a>")
            })
        })
}

function getStopList () {
    var data = {
        limit: 100,
        offset: 0
    }
    axios.post('/api/admin/getStopList', data)
        .then(function (response) {
            $('#stop-list-table').empty()
            $.each(response.data.result, function (index, value) {
                $('#stop-list-table').append("<tr>\n" +
                    "                        <th scope=\"row\">" + (index+1) + "</th>\n" +
                    "                        <td>" +value.name + "</td>\n" +
                    "                        <td><button type=\"button\" class=\"btn btn-danger\">Удалить</button></td>\n" +
                    "                    </tr>")
            })
        })
}

function getNews () {
    var data = {
        userId: user_id,
        limit: 100,
        offset: 0
    }
    axios.post('/api/getNews', data)
        .then(function (response) {
            console.log(response)
            $('#news-user').empty()
            $.each(response.data.result, function (index, value) {
                var add = ''
                var status = ''
                var badge = ''
                switch (value.status) {
                    case 0:
                        status = 'Необработано'
                        badge = 'badge-secondary'
                        break;
                    case 1:
                        status = 'В обработке'
                        badge = 'badge-warning'
                        break;
                    case 2:
                        status = 'Отклонен'
                        badge = 'badge-danger'
                        break;
                    case 3:
                        status = 'Опубликовано'
                        badge = 'badge-success'
                        break;
                }
                if (!(index % 2 == 0) && index != 0 ) add = '</div><div class="row">'
                $('#news-user').append("<div class=\"col-12 col-sm-6 mt-2\">\n" +
                    "                <div class=\"card\" data-toggle=\"modal\" data-target=\"#cardModal\" data-whatever="+value.id+">\n" +
                    "                    <div class=\"card-body\">\n" +
                    "                        <div class=\"row\">\n" +
                    "                            <div class=\"col-2 col-sm-2\">\n" +
                    "                                <img align=\"middle\" src="+ value.user.avatar + " class=\"rounded-circle\" width=\"40\"\n" +
                    "                                     height=\"40\">\n" +
                    "                            </div>\n" +
                    "                            <div class=\"col-10 col-sm-10\">\n" +
                    "                                <h6 class=\"card-title\">"+ value.user.name + "</h6>\n" +
                    "                                <span class=\"card-date\">19 октября в 19:00</span>\n" +
                    "                            </div>\n" +
                    "                        </div>\n" +
                    "                        <div class=\"row mt-1\">\n" +
                    "                            <div class=\"col-12\">\n" +
                    "                                <p class=\"card-text-post\">"+ value.data.substr(0, 180) + "</p>\n" +
                    "                            </div>\n" +
                    "                        </div>\n" +
                    "                        <div class=\"row\">\n" +
                    "                            <div class=\"col-12\">\n" +
                    "                                <span class=\"badge badge-pill "+ badge+"\">"+status+"</span>\n" +
                    "                                <span class=\"badge badge-pill badge-info\">Есть сообщение</span>\n" +
                    "                            </div>\n" +
                    "                        </div>\n" +
                    "                    </div>\n" +
                    "                </div>\n" +
                    "            </div>" + add)
            })
        })
}

function getNewsForAdmin () {
    console.log("newsForAdmin")
    var data = {
        sort: sort,
        limit: 100,
        offset: 0,
        categoryId: category_id
    }
    axios.post('/api/admin/getNewsForAdmin', data)
        .then(function (response) {
            console.log(response)
            $('#news-user').empty()

            $.each(response.data.result, function (index, value) {
                var add = ''
                var status = ''
                var badge = ''
                switch (value.status) {
                    case 0:
                        status = 'Необработано'
                        badge = 'badge-secondary'
                        break;
                    case 1:
                        status = 'В обработке'
                        badge = 'badge-warning'
                        break;
                    case 2:
                        status = 'Отклонен'
                        badge = 'badge-danger'
                        break;
                    case 3:
                        status = 'Опубликовано'
                        badge = 'badge-success'
                        break;
                }
                if (!(index % 2 == 0) && index != 0 ) add = '</div><div class="row mt-3">'
                $('#news-user').append("<div class=\"col-12 col-sm-6 mt-2\">\n" +
                    "                <div class=\"card\" data-toggle=\"modal\" data-target=\"#cardModal\" data-whatever="+value.id+">\n" +
                    "                    <div class=\"card-body\">\n" +
                    "                        <div class=\"row\">\n" +
                    "                            <div class=\"col-2 col-sm-3\">\n" +
                    "                                <img align=\"middle\" src="+ value.user.avatar + " class=\"rounded-circle\" width=\"40\"\n" +
                    "                                     height=\"40\">\n" +
                    "                            </div>\n" +
                    "                            <div class=\"col-10 col-sm-9\">\n" +
                    "                                <h6 class=\"card-title\">"+ value.user.name + "</h6>\n" +
                    "                                <span class=\"card-date\">19 октября в 19:00</span>\n" +
                    "                            </div>\n" +
                    "                        </div>\n" +
                    "                        <div class=\"row mt-1\">\n" +
                    "                            <div class=\"col-12\">\n" +
                    "                                <p class=\"card-text-post\">"+ value.data.substr(0, 180) + "</p>\n" +
                    "                            </div>\n" +
                    "                        </div>\n" +
                    "                        <div class=\"row\">\n" +
                    "                            <div class=\"col-12\">\n" +
                    "                                <span class=\"badge badge-pill "+ badge+"\">"+status+"</span>\n" +
                    "                                <span class=\"badge badge-pill badge-info\">Есть сообщение</span>\n" +
                    "                            </div>\n" +
                    "                        </div>\n" +
                    "                    </div>\n" +
                    "                </div>\n" +
                    "            </div>" + add)
            })
        })
}

function getComments (newsId) {
    var data = {
        newsId: newsId,
        limit: 100,
        offset: 0
    }
    axios.post('/api/admin/getComments', data)
        .then(function (response) {
            console.log(response)
            $('#comments-list').empty()
            $.each(response.data.result, function (index, value) {
                $('#comments-list').append("<div class=\"card mt-3\">\n" +
                    "                        <div class=\"card-header\">" + value.user.name + "</div>\n" +
                    "                        <div class=\"card-body\" id='card-body-comment'>\n" +
                    "                            <blockquote class=\"blockquote mb-0\" id='comment-date'>\n" +
                    "                                <p class='text-comment'>"+value.data+"</p>\n" +
                    "                                <footer class=\"blockquote-footer\">Отправлено 20 сентября 2018 <cite\n" +
                    "                                        title=\"Source Title\">в 17:00</cite></footer>\n" +
                    "                            </blockquote>\n" +
                    "                        </div>\n" +
                    "                    </div>")
            })
        })
}

var url = new URL(window.location.href);
var viewer_type = url.searchParams.get("viewer_type");
var userID = url.searchParams.get("viewer_id");
console.log("link " + window.location.href);
console.log("user_id" + userID);

VK.init(function() {
    console.log(userID)
    VK.api('users.get', {'fields': 'photo_50'}, function (data) {
        var data = {
            vkID: parseInt(userID),
            avatar: data.response[0].photo_50,
            name: data.response[0].first_name + " " + data.response[0].last_name,
            type: (viewer_type == 3 || viewer_type == 4) ? 1 : 0
        }
        console.log(data)
        axios.post('/api/registerUser', data)
            .then(function (response) {
                user_id = response.data.result.id;
                $('.navbar-text').text('Ваш рейтинг: ' + response.data.result.rating)
                console.log(response);
                if (viewer_type == 3 || viewer_type == 4) getNewsForAdmin ()
                else getNews()
                if(location_global.length > 0) {
                    if (location_global.split('-')[0] === 'card') {
                        news_id_g = parseInt(location_global.split('-')[1])
                        $('#cardModal').modal('show');
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    })
    VK.addCallback('onLocationChanged', function f(location){
        location_global = location
        // if(location.length > 0) {
        //     if (location.split('-')[0] === 'card') {
        //         news_id_g = parseInt(location.split('-')[1])
        //         $('#cardModal').modal('show');
        //     }
        // }
               // alert("location: " + location);
    });
    // API initialization succeeded
    // Your code here
}, function() {
    // API initialization failed
    // Can reload page here
}, '5.68');