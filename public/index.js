var markers = [];   // 마커를 담을 배열입니다
var like_list = []; // 찜 목록 추가
var like_idx = 0;
var global_maptype = '';

var searchbool = false;

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

var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
        level: 3 // 지도의 확대 레벨
    };  

// 지도를 생성합니다    
var map = new kakao.maps.Map(mapContainer, mapOption); 

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places();  

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({zIndex:1});

// 키워드로 장소를 검색합니다
searchPlaces();

// 키워드 검색을 요청하는 함수입니다
function searchPlaces() {
    var keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        //alert('키워드를 입력해주세요!');
        return false;
    }

    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    ps.keywordSearch(keyword, placesSearchCB); 
}

// 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {

        // 정상적으로 검색이 완료됐으면
        // 검색 목록과 마커를 표출합니다
        displayPlaces(data);

        // 페이지 번호를 표출합니다
        displayPagination(pagination);

    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {

        alert('검색 결과가 존재하지 않습니다.');
        return;

    } else if (status === kakao.maps.services.Status.ERROR) {

        alert('검색 결과 중 오류가 발생했습니다.');
        return;

    }
}

// 검색 결과 목록과 마커를 표출하는 함수입니다
function displayPlaces(places) {

    var listEl = document.getElementById('placesList'), 
    menuEl = document.getElementById('menu_wrap'),
    fragment = document.createDocumentFragment(), 
    bounds = new kakao.maps.LatLngBounds(), 
    listStr = '';
    
    // 검색 결과 목록에 추가된 항목들을 제거합니다
    removeAllChildNods(listEl);

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();
    
    for ( var i=0; i<places.length; i++ ) {

        // 마커를 생성하고 지도에 표시합니다
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
            marker = addMarker(placePosition, i), 
            itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성합니다

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        bounds.extend(placePosition);

        // 마커와 검색결과 항목에 mouseover 했을때
        // 해당 장소에 인포윈도우에 장소명을 표시합니다
        // mouseout 했을 때는 인포윈도우를 닫습니다
        (function(marker, title, address, phone) {
            kakao.maps.event.addListener(marker, 'click', function() {
                addLikeList(marker, title, address, phone); // 클릭하면 추가
            });

            kakao.maps.event.addListener(marker, 'mouseover', function() {
                displayInfowindow(marker, title, address, phone);
            });

            itemEl.onmouseover =  function () {
                displayInfowindow(marker, title, address, phone);
            };

        })(marker, places[i].place_name, places[i].road_address_name, places[i].phone);

        fragment.appendChild(itemEl);
    }

    // 검색결과 항목들을 검색결과 목록 Elemnet에 추가합니다
    listEl.appendChild(fragment);
    menuEl.scrollTop = 0;

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    map.setBounds(bounds);
}

// 검색결과 항목을 Element로 반환하는 함수입니다
function getListItem(index, places) {

    var el = document.createElement('li'),
    itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
                '<div class="info">' +
                '   <h5>' + places.place_name + '</h5>';

    if (places.road_address_name) {
        itemStr += '    <span>' + places.road_address_name + '</span>' +
                    '   <span class="jibun gray">' +  places.address_name  + '</span>';
    } else {
        itemStr += '    <span>' +  places.address_name  + '</span>'; 
    }
                 
    itemStr += '  <span class="tel">' + places.phone  + '</span>' +
                '</div>';           

    el.innerHTML = itemStr;
    el.className = 'item';

    return el;
}

// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(position, idx, title) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
        imageSize = new kakao.maps.Size(36, 37),  // 마커 이미지의 크기
        imgOptions =  {
            spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
            marker = new kakao.maps.Marker({
            position: position, // 마커의 위치
            image: markerImage 
        });

    marker.setMap(map); // 지도 위에 마커를 표출합니다
    markers.push(marker);  // 배열에 생성된 마커를 추가합니다

    return marker;
}

// 지도 위에 표시되고 있는 마커를 모두 제거합니다
function removeMarker() {
    for ( var i = 0; i < markers.length; i++ ) {
        markers[i].setMap(null);
    }   
    markers = [];
}

// 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(), i; 

    // 기존에 추가된 페이지번호를 삭제합니다
    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild (paginationEl.lastChild);
    }

    for (i=1; i<=pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;

        if (i===pagination.current) {
            el.className = 'on';
        } else {
            el.onclick = (function(i) {
                return function() {
                    pagination.gotoPage(i);
                }
            })(i);
        }

        fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
}

// 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
// 인포윈도우에 장소명을 표시합니다
function displayInfowindow(marker, title, address, phone) {
    //var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';
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

    infowindow.setContent(content);
    infowindow.open(map, marker);
}

// 커스텀 오버레이를 닫기 위해 호출되는 함수입니다 
function closeInfowindow() {
    infowindow.close(); 
}

// 팝업 (메뉴 보기) 출력 함수
function displayPop(marker, title, address, phone) {
    var popPositionDiv = document.getElementById('popPosition'); 
    popPositionDiv.style.display = "block"; // 숨겨진거 보이게
    var popBackgroundDiv = document.getElementById('popBackground'); 
    popBackgroundDiv.style.display = "block"; // 숨겨진거 보이게

    var content = 
        '<div class="close" onclick="clsoePop()" title="닫기"></div>' +
        '<div>'+ title +'</div>'

    popPositionDiv.innerHTML = content;
}

// 팝업 (메뉴 보기) 닫는 함수
function clsoePop() {
    var popPositionDiv = document.getElementById('popBackground'); 
    popPositionDiv.style.display = "none"; // 숨겨
    var popBackgroundDiv = document.getElementById('popBackground'); 
    popBackgroundDiv.style.display = "none"; // 숨겨

}

// 내가 좋아하는 식당 추가하는 함수
function addLikeList(marker, title, address, phone) {
    $.ajax({
        type: 'POST',
        url: '/like/add',
        data: { 
            'username': document.getElementById('username').innerText, 
            'phone': phone
        },
        dataType: 'json',
        success: function (data) {
            for ( var i=0; i<Object.keys(data).length; i++ ) {
                like_list.push(data[i]);
            }
        }
    })
    displayInfowindow(marker, title, address, phone);
}

// 내가 좋아하는 식당 삭제하는 함수
function deleteLikeList(marker, title, address, phone) {
    $.ajax({
        type: 'POST',
        url: '/like/delete',
        data: { 
            'username': document.getElementById('username').innerText, 
            'phone': phone
        },
        dataType: 'json',
        success: function (data) {
            for ( var i=0; i<Object.keys(data).length; i++ ) {
                like_list.push(data[i]);
            }
        }
    })

    if (global_maptype === 'skyview') setMapType();
    displayInfowindow(marker, title, address, phone);
}

 // 검색결과 목록의 자식 Element를 제거하는 함수입니다
function removeAllChildNods(el) {   
    while (el.hasChildNodes()) {
        el.removeChild (el.lastChild);
    }
}

function setMapType(maptype) { 
    var roadmapControl = document.getElementById('btnRoadmap');
    var skyviewControl = document.getElementById('btnSkyview'); 

    var listEl = document.getElementById('placesList');
    removeAllChildNods(listEl);
    removeMarker();

    if (maptype === 'roadmap') {
        map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);
        searchPlaces();
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
                    searchPlaces2(data[i]);
                }
                skyviewControl.className = 'selected_btn';
                roadmapControl.className = 'btn';
                global_maptype = 'skyview';
            }
        })
    }
}

function searchPlaces2(keyword) {
    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    ps.keywordSearch(keyword, placesSearchCB2); 
}

function placesSearchCB2(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {

        // 정상적으로 검색이 완료됐으면
        // 검색 목록과 마커를 표출합니다
        var listEl = document.getElementById('placesList'), 
        menuEl = document.getElementById('menu_wrap'),
        fragment = document.createDocumentFragment(), 
        bounds = new kakao.maps.LatLngBounds(), 
        listStr = '';        

        // 마커를 생성하고 지도에 표시합니다
        var placePosition = new kakao.maps.LatLng(data[0].y, data[0].x),
            marker = addMarker(placePosition, like_idx), 
            itemEl = getListItem(like_idx, data[0]); // 검색 결과 항목 Element를 생성합니다
        
        like_idx++;
            
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        bounds.extend(placePosition);

        // 마커와 검색결과 항목에 mouseover 했을때
        // 해당 장소에 인포윈도우에 장소명을 표시합니다
        // mouseout 했을 때는 인포윈도우를 닫습니다
        (function(marker, title, address, phone) {
            kakao.maps.event.addListener(marker, 'mouseover', function() {
                displayInfowindow(marker, title, address, phone);
            });

            itemEl.onmouseover =  function () {
                displayInfowindow(marker, title, address, phone);
            };

        })(marker, data[0].place_name, data[0].road_address_name, data[0].phone);

        fragment.appendChild(itemEl);

        // 검색결과 항목들을 검색결과 목록 Elemnet에 추가합니다
        listEl.appendChild(fragment);
        menuEl.scrollTop = 0;

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        //map.setBounds(bounds);

        // 페이지 번호를 표출합니다
        displayPagination(pagination);

    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {

        alert('검색 결과가 존재하지 않습니다.');
        return;

    } else if (status === kakao.maps.services.Status.ERROR) {

        alert('검색 결과 중 오류가 발생했습니다.');
        return;

    }
}

function searchTgl() {
    if (searchbool === false) {
        document.getElementById('menu_wrap').style.display = 'block';
        searchbool = true;
    }
    else if (searchbool === true) {
        document.getElementById('menu_wrap').style.display = 'none';
        searchbool = false;
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
