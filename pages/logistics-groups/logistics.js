// pages/order-payment/order-payment.js
const Http = require('../../utils/request.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    payInfo: '',
    ordersn: '',
    openDetail: '',
    memberAddId: '',
    showModal: false,
    commodity: 0,
    freightAmount: 0,
    finalamount: 0,
    orderId: '',
    totalPrice: 0,
    goodsPrice:0,
    packs: '',
    pagePrice: 0,
    remark: '',
    rule: '',
    address: '',
    isPartner: false,
    groupsInstanceId: '',
    isClick: true,
    isShow: false,
    productAttr: '',
    isAddRess:false,
    hasPhone: true
  },
  regChange() {
    if (this.data.isShow == true) {
      this.setData({
        isShow: false
      })
    } else {
      this.setData({
        isShow: true
      })
    }
  },
  addRemarks() {
    app.globalData.finalamount = 0
    wx.navigateTo({
      url: '/pages/addRemarks/addRemarks'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHasPhone()
    this.setData({
      groupId: options.groupId
    })
    this.getStartGrops(options.groupId)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  totalMoney(shopPrice, freightAmount, finalamount, packageAmount) {
    var total = Number(shopPrice) - Number(finalamount) + Number(freightAmount) + Number(packageAmount)
    console.log(total, 'total')
    this.setData({
      totalPrice: total.toFixed(2)
    })
  },
  //详情
  getStartGrops(groupId) {
    let that = this
    Http.HttpRequst(false, '/group/startGroups?groupId=' + groupId, false, '', '', 'get', false, function (res) {
      console.log(res, '5555')
      if (res.state == 'ok') {
        var packs = res.data.packs
        packs[0].checked = true
        var packageAmount = 0
        var goodsPrice = 0
        packageAmount = packs[0].price
        goodsPrice = res.data.product.price * res.data.product.num
        that.setData({
          openDetail: res.data,//详情
          packs: packs, //包装
          goodsPrice: goodsPrice,
          rule: res.data.rule,
          productAttr: packs[0].name,
          pagePrice: packageAmount,
          packageAmount: packageAmount,//包装费
          walletAmount: res.data.wallet, //微信钱包
          categoreyIds: res.data.product.categoryid,//分类id
          isPartner: res.data.isPartner, //团长显示
          totalCount: res.data.product.num, //箱数
          totalWeight: res.data.product.weight
        })
        that.totalMoney(goodsPrice, that.data.freightAmount, that.data.finalamount, packageAmount)
        //判断地址为空
        console.log(that.data.address, '55566666666666666666')
        if (res.data.address == undefined){
   
        } else {
          that.setData({
            isAddRess: true,
            address: res.data.address,
            memberAddId: res.data.address.id,
          })
          that.getExpressFee()
        }
      }
    })
  },
  /**
   * 根据目的地算运费
   */
  getExpressFee(isAdd) {
    var that = this
    Http.HttpRequst(false, '/express/getExpressFee?count=' + this.data.totalCount + '&weight=' + this.data.totalWeight + '&memberAddId=' + this.data.memberAddId + '&prdCategoryIds=' + this.data.categoreyIds, true, '', '', 'post', false, function (res) {
      if (res.state == 'ok') {
        that.setData({
          freightAmount: res.data,
        })
        that.totalMoney(that.data.goodsPrice, that.data.freightAmount, that.data.finalamount, that.data.packageAmount)
        if (isAdd == true) {

        } else {}
      }
    })
  },
  //点击加减按钮  
  numchangeTap: function (e) {
    var shopcar = this.data.openDetail
    console.log(shopcar)
    var types = e.currentTarget.dataset.types//是加号还是减号        
    var totalCount = this.data.totalCount
    var totalWeight = this.data.totalWeight
    var packageNum = this.data.packageAmount
    var goodsPrice = Number(this.data.goodsPrice)
    switch (types) {
      case 'add':
        shopcar.product.num++; // 对应商品的数量+1
        goodsPrice += shopcar.product.price

        totalCount = shopcar.product.num, //箱数
        packageNum = shopcar.product.num * this.data.pagePrice,
        totalWeight = shopcar.product.weight * shopcar.product.num,//重量
        // that.getExpressFee()
        console.log(shopcar.product.num)
        break;
      case 'minus':
        if (shopcar.product.num == 1) {

        } else {
          shopcar.product.num--;//对应商品的数量-
          goodsPrice -= shopcar.product.price
          totalCount = shopcar.product.num, //箱数
          packageNum = shopcar.product.num * this.data.pagePrice,
          totalWeight = shopcar.product.weight * shopcar.product.num //重量
        }
        break;
    }
    
    this.setData({
      openDetail: shopcar,
      totalCount: totalCount,
      goodsPrice: goodsPrice,
      packageAmount: packageNum,
      totalWeight: totalWeight,
    });

    var that = this
    that.totalMoney(that.data.goodsPrice, that.data.freightAmount, that.data.finalamount, packageNum)

    if (shopcar.product.num == 1){
      
    } else{
      
      if (app.globalData.addressId == '') {

      } else {
        this.getExpressFee(true) //点击加减计算地址
      }
    }

  },
  showPayModal() {
    this.setData({
      showModal: true
    })
  },
  hidePayToast() {
    this.setData({
      showModal: false
    })
  },
  goAddress() {
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },
  radioText(e) {
    console.log(e, '5555')
    this.setData({
      productAttr: e.currentTarget.dataset.name
    })
  },
  /**
 * 包装费
 */
  radioChange(e) {
    var that = this
    this.setData({
      packageAmount: e.detail.value,
    })
    that.totalMoney(that.data.goodsPrice, that.data.freightAmount, that.data.finalamount, e.detail.value)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideShareMenu()
    if (app.globalData.addressId == '') {

    } else {
      this.setData({
        memberAddId: app.globalData.addressId,
        isAddRess: true
      })
      this.getAddDetails(app.globalData.addressId) //id查地址
    }
    this.setData({
      payInfo: app.globalData.payInfo,
      remark: wx.getStorageSync('remark')
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 团长
   */
  orderMemberGroups() {
    var oderItem = []
    var that = this
    if (that.data.isClick) { //防止重复点击
      that.setData({
        isClick: false
      })
      setTimeout(function () {
        that.setData({
          isClick: true
        })
      }, 1500)
    } else {
      return false
    }
    var product = that.data.openDetail.product


    if (!that.data.isShow) {
      var item = {
        productId: product.id,//商品id
        productPic: product.pic,//商品效果图
        productName: product.name,//商品名称
        productPrice: product.salesprice * product.num,//销售价格
        groupsPrice: product.price * product.num,//拼团价格
        productQuantity: product.num,//购买数量
        productWeight: product.weight * product.num,//总重量
        productCategotyId: product.categoryid,//分类id
        productAttr: that.data.productAttr
      }
      oderItem.push(item)
    } else {
      var item = {
        productId: product.id,//商品id
        productPic: product.pic,//商品效果图
        productName: product.name,//商品名称
        productPrice: 0,//销售价格
        groupsPrice: 0,//拼团价格
        productQuantity: 0,//购买数量
        productWeight: 0,//总重量
        productCategotyId: product.categoryid,//分类id
        productAttr: that.data.productAttr
      }
      oderItem.push(item)
    }
    

    // 我们默认优先使用钱包，自动帮用户计算好。
    // 分3中情况：  1.钱包的钱 >= 待支付的钱，就不提交到微信支付；
    // 2.钱包没钱， 全部走微信支付；--- 需要提交到微信；
    // 3.钱包的钱不够，部分钱包，部分微信；--- 微信支付的部分需要提交到微信：
    var wxAmount = 0
    var walletAmount = 0
    if (that.data.walletAmount >= that.data.totalPrice) {
      wxAmount = 0
      walletAmount = that.data.totalPrice
    } else {
      wxAmount = that.data.totalPrice - that.data.walletAmount
      walletAmount = that.data.walletAmount
    }
    var order = ''
    if (!that.data.isShow) {
      order = {
        groupsId: that.data.groupId,//拼团id
        productId: product.id,//商品id
        isExpress: 2, //是否自提1是2物流
        totalAmount: Number(that.data.totalPrice), //订单总金额 商品数量*单价 +包装金额 +运费总额
        payAmount: Number(that.data.totalPrice), // 应付金额 总额-优惠券
        wxAmount: wxAmount, // 微信支付金额
        walletAmount: walletAmount, //钱包支付金额
        packageAmount: that.data.packageAmount,//包装金额
        freightAmount: that.data.freightAmount,//运费金额
        couponAmount: 0,//优惠券抵用金额
        receiverName: that.data.address.name, // 收货人姓名
        receiverPhone: that.data.address.phoneNumber,// 收货人电话
        receiverProvince: that.data.address.province,//省份
        receiverCity: that.data.address.city,//城市
        receiverRegion: that.data.address.region,//区
        receiverDetailAddress: that.data.address.detailAddress,//详细地址
        note: that.data.remark,//备注
      }
    } else {
      order = {
        groupsId: that.data.groupId,//拼团id
        productId: product.id,//商品id
        isExpress: 2, //是否自提1是2物流
        totalAmount: 0, //订单总金额 商品数量*单价 +包装金额 +运费总额
        payAmount: 0, // 应付金额 总额-优惠券
        wxAmount: 0, // 微信支付金额
        walletAmount: 0, //钱包支付金额
        packageAmount: 0,//包装金额
        freightAmount: 0,//运费金额
        couponAmount: 0,//优惠券抵用金额
        receiverName: that.data.address.name, // 收货人姓名
        receiverPhone: that.data.address.phoneNumber,// 收货人电话
        receiverProvince: that.data.address.province,//省份
        receiverCity: that.data.address.city,//城市
        receiverRegion: that.data.address.region,//区
        receiverDetailAddress: that.data.address.detailAddress,//详细地址
        note: that.data.remark,//备注
      } 
    }

    var params = {
      order: order,
      oderItem: oderItem
    }
    if (that.data.address == '') {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none',
        duration: 1500,
      })
      return false
    }
    console.log(params, 'paramsparamsparamsparams')
    Http.HttpRequst(false, '/order/orderCaptGroups', true, '', JSON.stringify(params), 'post', false, function (res) {
      console.log(res.state == 'ok')
      if (res.state == 'ok') {
        wx.setStorageSync('remark', '')
        if (res.data.pay == 'SUCCESS') {
          wx.showToast({
            title: '下单成功！',
            icon: 'none',
            duration: 1000,
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/pay-success/pay-success?orderSn=' + res.data.orderSn
            })
          }, 1000)
        } else {
          app.globalData.payInfo = res.data
          wx.navigateTo({
            url: '/pages/logistics-payment/payment?ordersn=' + res.data.orderSn
          })
        }
      }
    })
  },
  // 用户购买，分享返现奖励说明
  showRewardModal() {
    this.setData({
      rewardModal: true
    })
  },
  hideRewardModal() {
    this.setData({
      rewardModal: false
    })
  },
  getAddDetails(id) {
    var that = this
    let params = {
      id: id
    }
    Http.HttpRequst(false, '/addr/getAdd', true, '', params, 'get', false, function (res) {
      if (res.state == 'ok') {
        that.setData({
          address: res.data
        })
        that.getExpressFee()
      }
    })
  },
  // 判断用户是否有手机号 如果有责不授权获取手机号,没有则授权
  getHasPhone() {
    let that = this
    console.log('5555')
    Http.HttpRequst(true, '/login/hasPhone', false, '', '', 'get', false, function (res) {
      that.setData({
        hasPhone: res.data
      })
      app.globalData.hasPhone = res.data
    })
  },
  /**
   * 获取手机号码服务端解密用户信息接口，获取手机号码
   */
  getPhoneNumber(e) {
    console.log(e)
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showToast({
        title: '未授权',
        icon: 'none',
        duration: 1000
      })
    } else {
      var params = {
        signature: app.globalData.userInfo.signature,
        rawData: app.globalData.userInfo.rawData,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      }
      var that = this
      Http.HttpRequst(true, '/login/getPhoneNumber', false, '', params, 'get', false, function (res) {
        if (res.state == 'ok') {
          that.setData({
            hasPhone: true
          })
          app.globalData.hasPhone = true
        }
      })
    }
  }
})