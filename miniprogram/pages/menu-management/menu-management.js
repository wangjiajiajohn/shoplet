const app = getApp();

Page({
  data: {
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
      image: '',
      hot: false
    },
    emojiOptions: ['🍜', '🥩', '🍖', '🥓', '🦐', '🍳', '🥤', '🍺', '💧', '🍵', '🥛', '🥬', '🐷', '🍞', '🍲', '🍔', '🍕', '🌭', '🍟', '🍿'],
    loading: true
  },

  async onShow() {
    this.setData({ loading: true });
    try {
      let menu = await app.getMenu();
      if (!menu || !menu.categories || menu.categories.length === 0 || !menu.products) {
        menu = app.globalData.menu;
        await app.saveMenu(menu);
      }
      if (!menu.products) {
        menu.products = {};
      }
      this.setData({ 
        menu: menu,
        loading: false
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      this.setData({ loading: false });
    }
  },

  async saveMenu() {
    try {
      await app.saveMenu(this.data.menu);
      wx.showToast({
        title: '已保存',
        icon: 'success',
        duration: 1500
      });
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
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

  async saveCategory() {
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
    await this.saveMenu();
  },

  deleteCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除分类',
      content: '确定删除该分类及所有商品吗？',
      success: async (res) => {
        if (res.confirm) {
          const menu = this.data.menu;
          menu.categories = menu.categories.filter(c => c.id !== categoryId);
          delete menu.products[categoryId];
          this.setData({ menu });
          await this.saveMenu();
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
      productForm: { name: '', desc: '', price: '', priceSuffix: '', emoji: '', image: '', hot: false }
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
          image: product.image || '',
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

  async chooseProductImage() {
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      
      if (res.tempFiles && res.tempFiles.length > 0) {
        const tempFile = res.tempFiles[0];
        const fileName = `products/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        
        wx.showLoading({ title: '上传中...' });
        
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: fileName,
          filePath: tempFile.tempFilePath
        });
        
        wx.hideLoading();
        
        if (uploadRes.fileID) {
          this.setData({ 'productForm.image': uploadRes.fileID });
          wx.showToast({ title: '上传成功', icon: 'success' });
        }
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },

  clearProductImage() {
    this.setData({ 'productForm.image': '' });
  },

  async saveProduct() {
    const { name, price } = this.data.productForm;
    if (!name.trim()) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return;
    }
    if (!price.trim()) {
      wx.showToast({ title: '请输入价格', icon: 'none' });
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
    await this.saveMenu();
  },

  deleteProduct(e) {
    const { cat, pid } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除商品',
      content: '确定删除该商品吗？',
      success: async (res) => {
        if (res.confirm) {
          const menu = this.data.menu;
          menu.products[cat] = menu.products[cat].filter(p => p.id !== pid);
          this.setData({ menu });
          await this.saveMenu();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});
