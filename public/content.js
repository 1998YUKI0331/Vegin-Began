var temp = location.href.split("?");
var data=temp[1].split("/");
var contentId = data[0];

$.ajax({
    type: 'POST',
    url: '/board/content',
    dataType: 'json',
    data: { '_id': contentId },
    async: false,
    success: function (data) {
        document.getElementById('writer').innerText = data.writer;
        document.getElementById('title').innerText = data.title;
        document.getElementById('date').innerText = data.date;
        document.getElementById('content').innerText = data.content;
        document.getElementById('tag').innerText = data.tag;
    }
})

if (document.getElementById('username').innerText == document.getElementById('writer').innerText) {
    document.getElementById('delete').style.display = 'block';
    document.getElementById('edit').style.display = 'block';
}

var deletebtn = document.getElementById('delete');
deletebtn.addEventListener('click', function(event){
    $.ajax({
        type: 'POST',
        url: '/board/delete',
        dataType: 'json',
        data: { '_id': contentId },
        async: false,
        success: function (data) {
            location.href="/board";
        }
    })
});

var editbtn = document.getElementById('edit');
editbtn.addEventListener('click', function(event){
    $.ajax({
        type: 'POST',
        url: '/board/edit',
        dataType: 'json',
        data: {
            '_id': contentId, 
            'title':document.getElementById('title').innerText, 
            'content':document.getElementById('content').innerText },
        async: false,
        success: function (data) {
            location.href="/content?" + contentId;
        }
    })
});

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