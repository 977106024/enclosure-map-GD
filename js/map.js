/*
 * 地图相关函数 
*/

// 创建地图
var map = new AMap.Map('container', {
    resizeEnable: true, //是否监控地图容器尺寸变化
    zoom: 14, //初始化地图层级
    center: [116.397428, 39.90923] //初始化地图中心点
});

// 地图加载完成
map.on("complete", function (e) {
    console.log('地图加载完成')
    drawPolygon()
});

var mouseTool = new AMap.MouseTool(map)

// 绘制多边形
function drawPolygon() {
    mouseTool.polygon({
        strokeColor: "#FF33FF",
        strokeOpacity: 1,
        strokeWeight: 6,
        strokeOpacity: 0.2,
        fillColor: '#1791fc',
        fillOpacity: 0.4,
        // 线样式还支持 'dashed'
        strokeStyle: "solid",
        // strokeStyle是dashed时有效
        // strokeDasharray: [30,10],
    })
}

// 开启多边形可编辑状态
function openEditPolygon(obj) {
    var polyEditor = new AMap.PolyEditor(map, obj)
    polyEditor.open()

    polyEditor.on('adjust', (event) => {
        var obj = event.target
        getEnclosureData(obj)

    })
}

//绘制圆形
// function drawCircle() {
//     mouseTool.circle({
//         strokeColor: "#FF33FF",
//         strokeOpacity: 1,
//         strokeWeight: 6,
//         strokeOpacity: 0.2,
//         fillColor: '#1791fc',
//         fillOpacity: 0.4,
//         strokeStyle: 'solid',
//         // 线样式还支持 'dashed'
//         // strokeDasharray: [30,10],
//     })
// }

// 开启圆形绘制编辑

// 画圆 绑定点击事件
function onClickCircle() {
    /**
     * offClickFn 用于解绑事件
     * onShowCircle 参数1 null 用于给设置e参数的位置
    */
    map.on('click', offClickFn = onShowCircle.bind(this, null))

    // 解绑多边形事件
    closeDrawPolygon()
}

// 画圆事件
var circleData = {}
var theCircle
function onShowCircle(obj, e) {
    clearMap()// 清理上一个圆
    var lng, lat
    var radius = 300
    if (obj) { // 渲染编辑
        lng = obj.center.lng
        lat = obj.center.lat
        radius = obj.radius
    } else { // 点击事件 e
        lng = e.lnglat.getLng() // 点击时的中心点
        lat = e.lnglat.getLat()
    }
    circleData = { radius, center: { lng, lat } }
    var circle = setCircle({ radius, center: { lng, lat } }) // 设置圆形
    theCircle = circle
    var circleEditor = new AMap.CircleEditor(map, circle)
    circleEditor.open()// 开始编辑

    // 获取拖动的围栏半径
    circleEditor.on('adjust', (event) => {
        circleData = { radius: event.radius, center: { lng, lat } }
        setInputRadius(event.radius)
    })

    // 获取中心点
    circleEditor.on('move', (event) => {
        lat = event.lnglat.lat
        lng = event.lnglat.lng
        var radius = event.target.getRadius()
        circleData = { radius, center: { lng, lat } }
    })
    setEnclosureInfo()
}

// 改变圆形半径
function circleRadius(radius) {
    theCircle.setRadius(radius)
    theCircle.setMap(map)
}

// 设置input 显示圆形半径 信息
function setInputRadius(num){
    document.querySelector('.radius input').value = num || 300
}


// 画圆 返回圆形实例
function setCircle(obj) {
    var circle = new AMap.Circle({
        center: [obj.center.lng, obj.center.lat],
        radius: obj.radius, // 半径
        borderWeight: 6,
        strokeColor: '#FF33FF',
        strokeOpacity: 1,
        strokeWeight: 8,
        strokeOpacity: 0.2,
        fillOpacity: 0.4,
        strokeStyle: 'dashed',
        strokeDasharray: [10, 10],
        // 线样式还支持 'dashed'
        fillColor: '#1791fc',
        zIndex: 50
    })
    circle.setMap(map)
    // 缩放地图到合适的视野级别
    map.setFitView([circle])
    return circle
}


// 绘制省市区
var district, polygons = [], citycode;
var citySelect = document.getElementById('city');
var districtSelect = document.getElementById('district');
var opts = {
    subdistrict: 1,   //返回下一级行政区
    showbiz: false  //最后一级返回街道信息
};
district = new AMap.DistrictSearch(opts);//注意：需要使用插件同步下发功能才能这样直接使用
district.search('中国', function (status, result) {
    if (status == 'complete') {
        getData(result.districtList[0]);
    }
});
function getData(data, level) {
    var bounds = data.boundaries;
    if (bounds) {
        for (var i = 0, l = bounds.length; i < l; i++) {
            var polygon = new AMap.Polygon({
                map: map,
                strokeWeight: 1,
                strokeColor: '#0091ea',
                fillColor: '#80d8ff',
                fillOpacity: 0.2,
                path: bounds[i]
            });
            polygons.push(polygon);
        }
        map.setFitView();//地图自适应
    }

    //清空下一级别的下拉列表
    if (level === 'province') {
        citySelect.innerHTML = '';
        districtSelect.innerHTML = '';
    } else if (level === 'city') {
        districtSelect.innerHTML = '';
    } else if (level === 'district') {
    }

    var subList = data.districtList;
    if (subList) {
        var contentSub = new Option('--请选择--');
        var curlevel = subList[0].level;
        var curList = document.querySelector('#' + curlevel);
        curList.add(contentSub);
        for (var i = 0, l = subList.length; i < l; i++) {
            var name = subList[i].name;
            var levelSub = subList[i].level;
            var cityCode = subList[i].citycode;
            contentSub = new Option(name);
            contentSub.setAttribute("value", levelSub);
            contentSub.center = subList[i].center;
            contentSub.adcode = subList[i].adcode;
            curList.add(contentSub);
        }
    }

}

var provinceCityData = {}
function search(obj) {
    //清除地图上所有覆盖物
    for (var i = 0, l = polygons.length; i < l; i++) {
        polygons[i].setMap(null);
    }
    var option = obj[obj.options.selectedIndex];
    var keyword = option.text; //关键字
    var adcode = option.adcode;
    district.setLevel(option.value); //行政区级别
    district.setExtensions('all');
    //行政区查询
    //按照adcode进行查询可以保证数据返回的唯一性
    district.search(adcode, function (status, result) {
        if (status === 'complete') {
            console.log(result, 'resule')

            var province = document.getElementById('province')
            var index = province.selectedIndex // 选中索引
            var provinceText = province.options[index].text // 选中文本

            var city = document.getElementById('city')
            var index2 = city.selectedIndex >= 0 ? city.selectedIndex : ''
            var cityText = index2 ? city.options[index2].text : ''

            var district = document.getElementById('district')
            var index3 = district.selectedIndex >= 0 ? district.selectedIndex : ''
            var districtText = index3 ? district.options[index3].text : ''

            provinceCityData = {
                position: result.districtList[0].boundaries,
                adcode: adcode,
                name: provinceText + cityText + districtText
            }
            setEnclosureInfo()
            getData(result.districtList[0], obj.id);

        }
    });
}

// 获取围栏坐标点 中心点
var enclosureData = {}
function getEnclosureData(obj) {
    var center = null
    var position = null
    var type = ''
    if (obj.CLASS_NAME == 'AMap.Polygon') {
        type = 'polygon'
        var path = obj.getPath()
        var positionList = []
        for (var i = 0; i < path.length; i++) {
            positionList.push([path[i].lng, path[i].lat])
        }
        position = JSON.stringify(positionList)
        center = obj.getBounds().getCenter()
    }
    enclosureData = {
        name: obj.getExtData() && obj.getExtData().name,
        type: type,
        position: position,
        center: JSON.stringify(center)
    }
}

// 图形绘制完成
mouseTool.on('draw', function (event) {
    // event.obj 为绘制出来的覆盖物对象
    var obj = event.obj
    console.log('覆盖物对象绘制完成')
    getEnclosureData(obj)
    setEnclosureInfo()
    openEditPolygon(obj)
})


// 清除围栏
function clearMap() {
    map.clearMap()
    positionInfo.value = ''
}

// 关闭绘制多边形事件
function closeDrawPolygon() {
    mouseTool.close()
}

//地图搜索
var autoOptions = {
    input: "tipinput"
};
var auto = new AMap.Autocomplete(autoOptions);
var placeSearch = new AMap.PlaceSearch({
    map: map
});  //构造地点查询类
AMap.event.addListener(auto, "select", select);//注册监听，当选中某条记录时会触发
function select(e) {
    placeSearch.setCity(e.poi.adcode);
    placeSearch.search(e.poi.name);  //关键字查询查询
}