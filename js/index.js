
// 选择围栏类型
var enclosureType = 1   // type 1多边形 2圆形 3行政区
var selectType = document.querySelector('select.type')
var provinceCitySelect = document.querySelector('.input-card')
var radius = document.querySelector('.radius')

selectType.addEventListener('change', function (e) {
    clearMap()

    var type = selectType.value
    if (type === 'polygon') {
        enclosureType = 1
        drawPolygon()
        provinceCitySelect.classList.remove('visible')
        radius.classList.remove('visible')
        map.off('click', offClickFn) // 关闭画圆事件
    } else if (type === 'circle') {
        enclosureType = 2
        onClickCircle()
        setInputRadius()
        provinceCitySelect.classList.remove('visible')
        radius.classList.add('visible')
    } else {
        enclosureType = 3
        provinceCitySelect.classList.add('visible')
        radius.classList.remove('visible')
        map.off('click', offClickFn) // 关闭画圆事件
    }
})

// 重置
var reset = document.querySelector('.reset')
reset.addEventListener('click', function () {
    clearMap()
})

// 提交
var submit = document.querySelector('.submit')
submit.addEventListener('click', function () {
    saveMapInfor()
})

// 获取url参数
var mapSelfToken = getQueryString('mapSelfToken')
var domain = getQueryString('domain')
var apiUrl = getDomain(domain) // 环境

// 提交围栏数据
function saveMapInfor() {
    var params = {
        name: '',
        type: enclosureType,
        number: num,
        radius: null, // 圆形半径
        enable: enable ? 1 : 0, // 是否开启电子围栏
        center: null, // 中心点
        projectCode: "map"
    }

    var paramsStatus =  paramsHandle(params)
    if(!paramsStatus){
        $.message({
            message:'请先绘制围栏',
            type:'warning'
        });
    }

    $.ajax({
        url: apiUrl + '',
        method: 'post',
        contentType: 'application/json;charset=utf-8',
        data: JSON.stringify(params),
        headers: {
            mapSelfToken: mapSelfToken,
            PROJECTCODE: 'map'
        },
        success: function(res){
            if(res.code == 0){
                $.message(res.msg)
                clearMap()
            }else{
                $.message({
                    message:res.msg,
                    type:'warning'
                });
            }
            
        }
    },)
}

// 各种围栏参数处理
function paramsHandle(params) {
    
    if(!enclosureData.center && !circleData.center && !provinceCityData.position){
        return false
    }

    if (enclosureType === 1) {
        params.center = centerList(JSON.parse(enclosureData.center))
        params.gpsList = gpsList(JSON.parse(enclosureData.position)) // 坐标点
    } else if (enclosureType === 2) {
        var center = circleData.center
        params.center = centerList(center)
        params.gpsList = [[{ latitude: center.lat, longitude: center.lng, serivalNum: 1 }]]
        params.radius = circleData.radius // 圆形宽度
    } else {
        params.gpsList = provinceCityData.position
        params.fenceRegionDTO = { adcode: provinceCityData.adcode, name: provinceCityData.name }
    }
    params.name = document.querySelector('.name input').value
}

var num
// 获取围栏id
$.ajax({
    url: apiUrl + '',
    success: function (res) {
        num = res.msg
        document.querySelector('.num input').value = num
    }
})

// 改变圆形半径大小
radius.addEventListener('change', function () {
    var value = radius.children[1].value
    circleRadius(value)
})

// 是否开启电子围栏 switch
var enable = true
var sw = document.querySelector('.switch')
sw.addEventListener('change',function(){
    if(sw.checked){
        enable = true
    }else{
        enable = false
    }
})

// 填充围栏信息
var positionInfo = document.querySelector('.position-info input')
function setEnclosureInfo() {
    if (enclosureType === 1) {
        positionInfo.value = enclosureData.position
    } else if (enclosureType === 2) {
        positionInfo.value = circleData.center.lat + ' , '+ circleData.center.lng
    } else {
        positionInfo.value = provinceCityData.name
    }
}
