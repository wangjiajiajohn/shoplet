const app = getApp();

Page({
  data: {
    form: {
      status: 'not_started',
      location: '文一西路口',
      locationSub: '近电子科技大楼',
      time: '17:30',
      timeSub: '',
      note: '',
      announcement: '',
      lastResetDate: ''
    },
    menu: {},
    showCategoryModal: false,
    showProductModal: false,
    editingCategory: null,
    editingProduct: null,
    currentCategoryId: '',
    categoryForm: {
      name: '',
      icon: ''
    },
    productForm: {
      name: '',
      desc: '',
      price: '',
      priceSuffix: '',
      emoji: '',
      hot: false
    },
    emojiOptions: ['🍜', '🥩', '🍖', '🥓', '🦐', '🍳', '🥤', '🍺', '💧', '🍵', '🥛', '🥬', '🐷', '🍞', '🍲', '🍔', '🍕', '🌭', '🍟', '🍿']
  },

  onShow() {
    const info = app.getStallInfo();
    if (info.time && info.time.includes('–')) {
      const match = info.time.match(/(\d{2}:\d{2})/);
      if (match) {
        info.time = match[1];
        info.timeSub = '';
        app.saveStallInfo(info);
      }
    }
    let menu = app.getMenu();
    if (!menu || !menu.categories || menu.categories.length === 0 || !menu.products) {
      menu = app.globalData.menu;
      app.saveMenu(menu);
    }
    this.setData({ 
      form: info,
      menu: menu
    });
  },

  setStatus(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ 'form.status': status });
  },

  setLoc(e) {
    const { loc, sub, lat, lng } = e.currentTarget.dataset;
    this.setData({
      'form.location': loc,
      'form.locationSub': sub,
      'form.latitude': parseFloat(lat),
      'form.longitude': parseFloat(lng)
    });
  },

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'form.location': res.name || res.address,
          'form.locationSub': res.name ? res.address : '',
          'form.latitude': res.latitude,
          'form.longitude': res.longitude
        });
      },
      fail: () => {
        wx.showToast({ title: '定位失败', icon: 'none' });
      }
    });
  },

  onTimeChange(e) {
    this.setData({ 'form.time': e.detail.value });
  },

  onNoteInput(e) {
    this.setData({ 'form.note': e.detail.value });
  },

  onAnnouncementInput(e) {
    this.setData({ 'form.announcement': e.detail.value });
  },

  saveInfo() {
    app.saveStallInfo(this.data.form);
    app.saveMenu(this.data.menu);
    wx.showToast({
      title: '已发布给顾客',
      icon: 'success',
      duration: 1500
    });
    setTimeout(() => {
      wx.navigateBack();
    }, 900);
  },

  showAddCategoryModal() {
    this.setData({
      showCategoryModal: true,
      editingCategory: null,
      categoryForm: { name: '', icon: '' }
    });
  },

  editCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    const category = this.data.menu.categories.find(c => c.id === categoryId);
    if (category) {
      this.setData({
        showCategoryModal: true,
        editingCategory: categoryId,
        categoryForm: { name: category.name, icon: category.icon }
      });
    }
  },

  hideCategoryModal() {
    this.setData({ showCategoryModal: false });
  },

  onCategoryNameInput(e) {
    this.setData({ 'categoryForm.name': e.detail.value });
  },

  selectEmoji(e) {
    this.setData({ 'categoryForm.icon': e.currentTarget.dataset.emoji });
  },

  saveCategory() {
    const { name, icon } = this.data.categoryForm;
    if (!name.trim()) {
      wx.showToast({ title: '请输入分类名称', icon: 'none' });
      return;
    }
    if (!icon) {
      wx.showToast({ title: '请选择分类图标', icon: 'none' });
      return;
    }

    const menu = this.data.menu;
    if (this.data.editingCategory) {
      const idx = menu.categories.findIndex(c => c.id === this.data.editingCategory);
      if (idx !== -1) {
        menu.categories[idx] = { ...menu.categories[idx], name, icon };
      }
    } else {
      const newId = 'cat_' + Date.now();
      menu.categories.push({ id: newId, name, icon });
      menu.products[newId] = [];
    }
    this.setData({ menu });
    this.hideCategoryModal();
    wx.showToast({ title: '保存成功', icon: 'success' });
  },

  deleteCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除分类',
      content: '确定删除该分类及所有商品吗？',
      success: (res) => {
        if (res.confirm) {
          const menu = this.data.menu;
          menu.categories = menu.categories.filter(c => c.id !== categoryId);
          delete menu.products[categoryId];
          this.setData({ menu });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  showAddProductModal(e) {
    const categoryId = e.currentTarget.dataset.cat;
    this.setData({
      showProductModal: true,
      editingProduct: null,
      currentCategoryId: categoryId,
      productForm: { name: '', desc: '', price: '', priceSuffix: '', emoji: '', hot: false }
    });
  },

  editProduct(e) {
    const { cat, pid } = e.currentTarget.dataset;
    const product = this.data.menu.products[cat].find(p => p.id === pid);
    if (product) {
      this.setData({
        showProductModal: true,
        editingProduct: { cat, pid },
        currentCategoryId: cat,
        productForm: {
          name: product.name,
          desc: product.desc || '',
          price: product.price,
          priceSuffix: product.priceSuffix || '',
          emoji: product.emoji,
          hot: product.hot || false
        }
      });
    }
  },

  hideProductModal() {
    this.setData({ showProductModal: false });
  },

  onProductNameInput(e) {
    this.setData({ 'productForm.name': e.detail.value });
  },

  onProductDescInput(e) {
    this.setData({ 'productForm.desc': e.detail.value });
  },

  onProductPriceInput(e) {
    this.setData({ 'productForm.price': e.detail.value });
  },

  onProductPriceSuffixInput(e) {
    this.setData({ 'productForm.priceSuffix': e.detail.value });
  },

  selectProductEmoji(e) {
    this.setData({ 'productForm.emoji': e.currentTarget.dataset.emoji });
  },

  toggleProductHot() {
    this.setData({ 'productForm.hot': !this.data.productForm.hot });
  },

  saveProduct() {
    const { name, price, emoji } = this.data.productForm;
    if (!name.trim()) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return;
    }
    if (!price.trim()) {
      wx.showToast({ title: '请输入价格', icon: 'none' });
      return;
    }
    if (!emoji) {
      wx.showToast({ title: '请选择商品图标', icon: 'none' });
      return;
    }

    const menu = this.data.menu;
    const catId = this.data.currentCategoryId;
    
    if (this.data.editingProduct) {
      const idx = menu.products[catId].findIndex(p => p.id === this.data.editingProduct.pid);
      if (idx !== -1) {
        menu.products[catId][idx] = {
          ...menu.products[catId][idx],
          ...this.data.productForm
        };
      }
    } else {
      const newId = 'prod_' + Date.now();
      menu.products[catId].push({
        id: newId,
        ...this.data.productForm
      });
    }
    this.setData({ menu });
    this.hideProductModal();
    wx.showToast({ title: '保存成功', icon: 'success' });
  },

  deleteProduct(e) {
    const { cat, pid } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除商品',
      content: '确定删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          const menu = this.data.menu;
          menu.products[cat] = menu.products[cat].filter(p => p.id !== pid);
          this.setData({ menu });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});