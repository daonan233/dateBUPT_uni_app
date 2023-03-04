Page({
  /**
   * 页面的初始数据
   */
  data: {
     openid: "",
    loginstate: "0",
    openid: "",
    userEntity: null,
    terminal: "",
    osVersion: "",
     phoneNumber: "",
    showModal: false,//定义登录弹窗
  },
  //在页面加载的时候，判断缓存中是否有内容，如果有，存入到对应的字段里
  onLoad: function () {
    var that = this;
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        that.setData({ openid: res.data });
      },
      fail: function (res) {
        that.getcode();
      }
    });
    wx.getStorage({
      key: 'userEntity',
      success: function (res) {
        that.setData({ userEntity: res.data });
      },
      fail: function (res) {
        console.log("fail1");
      }
    });
    wx.getStorage({
      key: 'loginstate',
      success: function (res) {
        that.setData({ loginstate: res.data });
      }, fail: function (res) {
        console.log("fail2");
      }
    });
  },
  onGotUserInfo: function (e) {
    var that = this;
    if (e.detail.errMsg == "getUserInfo:ok") {
      wx.setStorage({
        key: "userinfo",
        data: e.detail.userInfo
      })
      this.setData({ userInfo: e.detail.userInfo });
      that.showDialogBtn();//调用一键获取手机号弹窗（自己写的）
    }
  },
 
  // 显示一键获取手机号弹窗
  showDialogBtn: function () {
    this.setData({
      showModal: true//修改弹窗状态为true，即显示
    })
  },
  // 隐藏一键获取手机号弹窗
  hideModal: function () {
    this.setData({
      showModal: false//修改弹窗状态为false,即隐藏
    });
  },
  onshow: function (openid, userInfo, phoneNumber) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({ terminal: res.model });
        that.setData({ osVersion: res.system });
      }
    })
    wx.request({
      url: '登录接口',
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: {
        username: phoneNumber,
        parentuser: 'xudeihai',
        wximg: userInfo.avatarUrl,
        nickname: userInfo.nickName,
        identity: "",
        terminal: that.data.terminal,
        osVersion: that.data.system,
        logintype: "10",//微信登录
        openid: that.data.openid,
      },
      success(res) {
        if (res.data.r == "T") {
          that.setData({ userEntity: res.data.d });
          wx.setStorage({
            key: "userEntity",
            data: res.data.d
          })
          that.setData({ loginstate: "1" });
          wx.setStorage({
            key: "loginstate",
            data: "1"
          })
          wx.setStorage({
            key: 'userinfo',
            data: "1"
          })
        }
        else {
          return;
        }
      },
      fail(res) {
        console.log(res);
      }
    })
  },
  //绑定手机
  getPhoneNumber: function (e) {
    var that = this;
    that.hideModal();
    wx.checkSession({
      success: function () {
        wx.login({
          success: res => {
            wx.request({
              url: '自己的登录接口', //仅为示例，并非真实的接口地址
              data: {
                account: '1514382701',
                jscode: res.code
              },
              method: "POST",
              header: {
                'content-type': 'application/json' // 默认值
              },
              success(res) {
                if (res.data.r == "T") {
                  wx.setStorage({
                    key: "openid",
                    data: res.data.openid
                  })
                  wx.setStorage({
                    key: "sessionkey",
                    data: res.data.sessionkey
                  })
                  wx.setStorageSync("sessionkey", res.data.sessionkey);
                  wx.request({
                    url: '自己的解密接口',//自己的解密地址
                    data: {
                      encryptedData: e.detail.encryptedData,
                      iv: e.detail.iv,
                      code: wx.getStorageSync("sessionkey")
                    },
                    method: "post",
                    header: {
                      'content-type': 'application/json'
                    },
                    success: function (res) {
                      if (res.data.r == "T") {
                        that.onshow(that.data.openid, that.data.userInfo, res.data.d.phoneNumber);//调用onshow方法，并传递三个参数
                        console.log("登录成功")
                        console.log(res.data.d.phoneNumber)//成功后打印微信手机号
                      }
                      else {
                        console.log(res);
                      }
                    }
                  })
                }
              }
            })
          }
        })
      },
      fail: function () {
        wx.login({
          success: res => {
            wx.request({
              url: '自己的登录接口', //仅为示例，并非真实的接口地址
              data: {
                account: '1514382701',
                jscode: res.code
              },
              method: "POST",
              header: {
                'content-type': 'application/json' // 默认值
              },
              success(res) {
                if (res.data.r == "T") {
                  wx.setStorage({
                    key: "openid",
                    data: res.data.openid
                  })
                  wx.setStorage({
                    key: "sessionkey",
                    data: res.data.sessionkey
                  })
                  wx.request({
                    url: '自己的解密接口',//自己的解密地址
                    data: {
                      encryptedData: e.detail.encryptedData,
                      iv: e.detail.iv,
                      code: res.data.sessionkey
                    },
                    method: "post",
                    header: {
                      'content-type': 'application/json'
                    },
                    success: function (res) {
                      that.onshow(that.data.openid, that.data.userInfo, res.data.d.phoneNumber);//调用onshow方法，并传递三个参数
                    }
                  })
                }
              }
            })
          }
        })
      }
    })
  },
})