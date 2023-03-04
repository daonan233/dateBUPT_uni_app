//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    cond: false, //判断标志：检测是否存在多个匹配信息
    searchKey: "",//监控搜索框输入信息
    keyWord1: "",//第一匹配信息
    description1: "", //信息答案2
    keyWord2: "",//第二匹配信息
    description2: "" //信息答案2
  },

  /**
   * 
   * 搜索功能
   */

  //监听搜索框输入的信息
  searchInput: function (e) {
    // console.log(e)
    let value = e.detail.value //搜索框输入的信息
    this.setData({
      searchKey: value //监听搜索输入关键字信息
    })
  },

  //设置搜索规则
  search: function (e) {
    let searchKey = this.data.searchKey //监听搜索框输入的信息
    if (searchKey == '') { //如果不输入任何字符直接搜索，返回提示信息
      this.setData({
        keyWord1: searchKey,
        description1: "小55提示您：还没有输入内容哦",
      })
      return
    }

    var db = wx.cloud.database() //连接msg数据库
    db.collection('msg').where({
      keyWord: db.RegExp({//按照KeyWord模糊查询
        regexp: searchKey, //模糊搜索监听到的搜索信息
        options: 'i', //不区分大小写
      })
    }).get().then(res => { //获取查询到的信息
      //console.log(res)
      if (res.data.length == 0) { //如果搜索信息在数据库中找不到
        this.setData({
          keyWord1: searchKey,
          description1: "这题我不会！",
        })
        return
      }

      var total = res.data.length //总匹配信息个数
      var _collections = new Array() //声明一个数组
      //console.log(total)
      //将匹配信息存入数组
      for (var i = 0; i < total; i++) {
        _collections.push(JSON.parse(JSON.stringify(res.data[i])))
      }
      //console.log(_collections.length)
      this.setData({//显示第一匹配信息
        keyWord1: _collections[0].keyWord,
        description1: _collections[0].description
      })//显示第二匹配信息
      if ((_collections.length == 0) || (_collections.length != 1)) {
        this.setData({//校验是否有多条数据
          cond: true,//将标志位置为true
          keyWord2: _collections[1].keyWord,//显示第二匹配数据
          description2: _collections[1].description
        })
      }
    }).catch(res => {
      console.log(res)
    })
  },

  //设置弹窗规则
  showModal(e) {
    this.setData({ //设置搜索弹窗表头的字符
      modalName: e.currentTarget.dataset.target
    })
    this.search(e) //调用搜索函数
  },
  //关闭弹窗
  hideModal(e) {
    this.setData({
      modalName: null,
      keyWord1: "",
      description1: "",
      cond: false //标志位复位
    })
  },

  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '微信搜索案例'
    }
  }
})

