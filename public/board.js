loadAllBoard();

var title = document.getElementsByName('title');
var id = document.getElementsByName('id');
var index = 0;
for ( var i=0; i<title.length; i++ ) (function(ln) {
    title[ln].addEventListener('click', function(event){
        location.href="/content?" + id[ln].innerText;     
    });
    index++;
})(index);

function clickContent() {
    var title = document.getElementsByName('title');
    var id = document.getElementsByName('id');
    var index = 0;
    for ( var i=0; i<title.length; i++ ) (function(ln) {
        title[ln].addEventListener('click', function(event){
            location.href="/content?" + id[ln].innerText;     
        });
        index++;
    })(index);
}

function loadBoard(data) {
    var tablebody = document.getElementById('tablebody');
    tablebody.innerHTML = "<thead><tr><th>번호</th><th>태그</th><th>제목</th><th>작성자</th><th>날짜</th></tr></thead>";
    for ( var i=Object.keys(data).length-1; i>=0; i-- ) {
        tablebody.innerHTML += 
            '<tbody><tr>' +
                '<td name="id" style="display:none;">' + data[i]._id + '</td>' +
                '<td>' + i + '</td>' +
                '<td>' + data[i].tag + '</td>' +
                '<td name="title">' + data[i].title + '</td>' +
                '<td>' + data[i].writer + '</td>' +
                '<td>' + data[i].date + '</td>' +
            '</tr></tbody>';
    }
    clickContent();
}

function loadAllBoard() {
    var tablebody = document.getElementById('tablebody');
    $.ajax({
        type: 'POST',
        url: '/board ',
        dataType: 'json',
        async: false,
        success: function (data) {
            loadBoard(data);
        }
    })
    clickContent();
}

var allbtn = document.getElementById('allbtn');
allbtn.addEventListener('click', function(event){
    loadAllBoard();
});

var freebtn = document.getElementById('freebtn');
freebtn.addEventListener('click', function(event){
    $.ajax({
        type: 'POST',
        url: '/board/tag',
        dataType: 'json',
        data: { 'tag': "자유" },
        async: false,
        success: function (data) {
            loadBoard(data);
        }
    })
});

var recipebtn = document.getElementById('recipebtn');
recipebtn.addEventListener('click', function(event){
    $.ajax({
        type: 'POST',
        url: '/board/tag',
        dataType: 'json',
        data: { 'tag': "비건 레시피" },
        async: false,
        success: function (data) {
            loadBoard(data);
        }
    })
});

var reviewbtn = document.getElementById('reviewbtn');
reviewbtn.addEventListener('click', function(event){
    $.ajax({
        type: 'POST',
        url: '/board/tag',
        dataType: 'json',
        data: { 'tag': "식당 리뷰" },
        async: false,
        success: function (data) {
            loadBoard(data);
        }
    })
});

function writeBoard() {
    document.getElementById('popBack').style.display = 'block';
    document.getElementById('popPosi').style.display = 'block';
}

function clsoePop() {
    document.getElementById('popBack').style.display = 'none';
    document.getElementById('popPosi').style.display = 'none';
}

function submitBoard() {
    var today = new Date();
    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    var tagdiv = document.getElementById('tag');

    var newtitle = document.getElementById('title').value;
    var content = document.getElementById('content').value;
    var date = year + month + day;
    var writer = document.getElementById('username').innerText;
    var tag = tagdiv.options[tagdiv.selectedIndex].value;
    
    if (newtitle != "" && content != "" && tag != "") {
        $.ajax({
            type: 'POST',
            url: '/board/add',
            dataType: 'json',
            data: { 'id':Math.floor(Math.random() * 10000000), 'title':newtitle, 'content':content, 'date':date, 'writer':writer, 'tag':tag },
            async: false,
            success: function (data) {
                clsoePop();
                loadBoard();
            }
        }) 
    }
    else {
        alert("항목을 모두 입력해주세요!");
    }
    loadAllBoard();
}

function homePage() {
    location.href="/";
}

function loginPage() {
    location.href="/login";
}

function signupPage() {
    location.href="/signup";
}

function logoutPage() {
    location.href="/logout";
}

function boardPage() {
    location.href="/board";
}

function contactPage() {
    location.href="https://github.com/1998YUKI0331/toy-project-repository";
}

