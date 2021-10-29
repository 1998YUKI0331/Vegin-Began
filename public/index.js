var markers = []; // 지도에 표시된 마커 객체를 가지고 있을 배열
var vegan_list = [];
var like_list = [];
var global_maptype = '';

$.ajax({
    type: 'POST',
    url: '/vegan',
    dataType: 'json',
    async: false,
    success: function (data) {
        for ( var i=0; i<Object.keys(data).length; i++ ) {
            vegan_list.push(data[i].phone);
        }
    }
})

if (document.getElementById('username').innerText != "null") {
    $.ajax({
        type: 'POST',
        url: '/like',
        data: { 'username': document.getElementById('username').innerText },
        dataType: 'json',
        success: function (data) {
            for ( var i=0; i<Object.keys(data).length; i++ ) {
                like_list.push(data[i]);
            }
        }
    })
}

var mapContainer = document.getElementById('map'),
    mapOption = { 
        center: new kakao.maps.LatLng(37.5524979951415, 126.989316855952),
        level: 7
    };

var map = new kakao.maps.Map(mapContainer, mapOption); //지도 생성
var ps = new kakao.maps.services.Places(); //장소 검색 객체

for ( var i=0; i<vegan_list.length / 10; i++ ) { //너무 오래 걸려서 일단 조금만
    searchPlaces(vegan_list[i]);
}

function searchPlaces(keyword) {
    ps.keywordSearch(keyword, placesSearchCB); 
}

function placesSearchCB(data, status, pagination) { // 장소검색 완료 때 호출되는 콜백함수
    if (status === kakao.maps.services.Status.OK) {
        displayPlaces(data); // 정상적으로 검색되면 마커 표출
    } 
    
/*    else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
        return;
    } 
    
    else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
        return;
    }*/
}

function displayPlaces(places) {
    var bounds = new kakao.maps.LatLngBounds();

    // 마커를 생성하고 지도에 표시합니다
    var placePosition = new kakao.maps.LatLng(places[0].y, places[0].x),
        marker = addMarker(placePosition);

    bounds.extend(placePosition);
    (function(marker, title, address, phone) {
        kakao.maps.event.addListener(marker, 'mouseover', function() {
            displayCustomOverlay(marker, title, address, phone);
        });

        kakao.maps.event.addListener(marker, 'click', function() {
            if(like_list.includes(phone)) {
                deleteLikeList(marker, title, address, phone);}
            else {
                addLikeList(marker, title, address, phone);}
        });
    })(marker, places[0].place_name, places[0].road_address_name, places[0].phone);

    // map.setBounds(bounds); // 검색된 장소 위치를 기준으로 지도 범위를 재설정
}

function addMarker(position) {
    var marker = new kakao.maps.Marker({ map: map, position: position });
    marker.setMap(map);
    markers.push(marker);

    return marker;
}

function removeMarker() { // 지도 위에 표시되고 있는 마커를 모두 제거
    for ( var i = 0; i < markers.length; i++ ) {
        markers[i].setMap(null);
    }   
    markers = [];
}

function setMarkers(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }            
}

function displayCustomOverlay(marker, title, address, phone) {
    var content = 
            '<div class="wrap">' + 
            '    <div class="info">' + 
            '        <div class="title">' + title;

    if(like_list.includes(phone)) { 
        content += '<div class="like" onclick="deleteLikeList(\'' + marker + '\',\'' + title+ '\',\'' + address+ '\',\'' + phone + '\')">💗</div>';}
    else {
        content += '<div class="like" onclick="addLikeList(\'' + marker + '\',\'' + title+ '\',\'' + address+ '\',\'' + phone + '\')">🤍</div>';}

    content +=
            '<div class="close" onclick="closeInfowindow()" title="닫기"></div>' +
            '</div>' + 
            '   <div class="body">' + 
            '       <div class="img">' +
            '           <img src="http://image.kmib.co.kr/online_image/2014/1103/201411030916_61130008820668_1.jpg" width="73" height="70">' +
            '       </div>' + 
            '           <div class="desc">' + 
            '               <div class="ellipsis">' + address + '</div>' + 
            '               <div><span class="tel">' + phone + '</span></div>' +
            '               <div>' +
            '                   <a href="#" onclick="displayPop(\'' + marker + '\',\'' + title+ '\',\'' + address+ '\',\'' + phone + '\')">비건 메뉴 보러가기</a>' +
            '               </div>' +
            '           </div>' + 
            '       </div>' + 
            '   </div>' +    
            '</div>';

    var overlay = new kakao.maps.CustomOverlay({
        content: content,
        map: map,
        position: marker.getPosition()       
    });

    overlay.setMap(map);
    kakao.maps.event.addListener(marker, 'mouseout', function() {
        overlay.setMap(null);
    });
}

function addLikeList(marker, title, address, phone) { // 내가 좋아하는 식당 추가하는 함수
    if (document.getElementById('username').innerText != "null") {
        like_list = [];
        $.ajax({
            type: 'POST',
            url: '/like/add',
            data: { 
                'username': document.getElementById('username').innerText, 
                'phone': phone
            },
            dataType: 'json',
            async: false,
            success: function (data) {
                for ( var i=0; i<Object.keys(data).length; i++ ) {
                    like_list.push(data[i]);
                }
            }
        })
        displayCustomOverlay(marker, title, address, phone);
    }
    
}

function deleteLikeList(marker, title, address, phone) { // 내가 좋아하는 식당 삭제하는 함수
    like_list = [];
    $.ajax({
        type: 'POST',
        url: '/like/delete',
        data: { 
            'username': document.getElementById('username').innerText, 
            'phone': phone
        },
        dataType: 'json',
        async: false,
        success: function (data) {
            for ( var i=0; i<Object.keys(data).length; i++ ) {
                like_list.push(data[i]);
            }
        }
    })

    if (global_maptype === 'skyview') setMapType();
    displayCustomOverlay(marker, title, address, phone);
}

function setMapType(maptype) { 
    var roadmapControl = document.getElementById('btnRoadmap');
    var skyviewControl = document.getElementById('btnSkyview'); 

    removeMarker();

    if (maptype === 'roadmap') {
        map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);
        for ( var i=0; i<vegan_list.length / 10; i++ ) {
            searchPlaces(vegan_list[i]);
        }
        roadmapControl.className = 'selected_btn';
        skyviewControl.className = 'btn';
        global_maptype = 'roadmap';
    } 
    else {
        $.ajax({
            type: 'POST',
            url: '/like',
            data: { 'username': document.getElementById('username').innerText },
            dataType: 'json',
            success: function (data) {
                like_idx=0;
                for ( var i=0; i<Object.keys(data).length; i++ ) {
                    like_list.push(data[i]);
                    searchPlaces(data[i]);
                }
                skyviewControl.className = 'selected_btn';
                roadmapControl.className = 'btn';
                global_maptype = 'skyview';
            }
        })
    }
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

function shareSNS() {
    var sendText = "제 지도 공유해요!";
    var sendUrl = "http://localhost:3000/";
    window.open("https://twitter.com/intent/tweet?text=" + sendText + "&url=" + sendUrl);
}