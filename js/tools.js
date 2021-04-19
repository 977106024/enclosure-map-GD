/*
*工具、数据处理函数
*/

// 环境适配
function getDomain(domain) {
    var hostList = {
        DEV: '',
        TEST: '',
        PRE: '',
        PROD: ''
    }

    return hostList[domain || 'DEV']
}

// cneter 格式处理 给后端
function centerList(obj) {
    return {
        q: obj.Q,
        r: obj.R,
        latitude: obj.lat,
        longitude: obj.lng
    }
}

// position 坐标格式处理 给后端
function gpsList(position) {
    return [
        position.map((item, i) => ({
            longitude: item[0],
            latitude: item[1],
            serivalNum: i + 1
        }))
    ]
}

// 获取url参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}