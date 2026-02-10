class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.items = [];
    this.itemWidth = 80;
    this.itemHeight = 60;
    this.spacing = 100;
    this.startX = 100;
  }

  preload() {
    // 初始化信号系统
    window.__signals__ = {
      dragCount: 0,
      sortCount: 0,
      itemPositions: [],
      events: []
    };
  }

  create() {
    // 创建粉色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillRoundedRect(0, 0, this.itemWidth, this.itemHeight, 8);
    graphics.lineStyle(3, 0xFF1493, 1); // 深粉色边框
    graphics.strokeRoundedRect(0, 0, this.itemWidth, this.itemHeight, 8);
    graphics.generateTexture('pinkBox', this.itemWidth, this.itemHeight);
    graphics.destroy();

    // 添加标题
    this.add.text(400, 30, '拖拽粉色物体，松手后自动按Y坐标排序', {
      fontSize: '24px',
      color: '#FF69B4',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建8个粉色物体，随机初始Y位置
    for (let i = 0; i < 8; i++) {
      const randomY = 100 + Math.random() * 400;
      const item = this.add.sprite(this.startX + i * this.spacing, randomY, 'pinkBox');
      
      // 添加编号文本
      const text = this.add.text(0, 0, `#${i + 1}`, {
        fontSize: '20px',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 创建容器组合精灵和文本
      const container = this.add.container(item.x, item.y, [item, text]);
      container.setSize(this.itemWidth, this.itemHeight);
      container.setData('index', i);
      container.setData('originalX', this.startX + i * this.spacing);

      // 启用交互
      container.setInteractive({ draggable: true, useHandCursor: true });

      this.items.push(container);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 记录拖拽信号
      window.__signals__.dragCount++;
      window.__signals__.events.push({
        type: 'drag',
        item: gameObject.getData('index'),
        x: Math.round(dragX),
        y: Math.round(dragY),
        timestamp: Date.now()
      });
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽时提升层级
      this.children.bringToTop(gameObject);
      gameObject.list[0].setTint(0xFFB6C1); // 浅粉色高亮
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复颜色
      gameObject.list[0].clearTint();
      
      // 触发排序
      this.sortItems();
      
      // 记录排序信号
      window.__signals__.sortCount++;
      window.__signals__.events.push({
        type: 'dragend',
        item: gameObject.getData('index'),
        timestamp: Date.now()
      });
    });

    // 添加说明文本
    this.add.text(400, 570, '提示：拖动任意物体，松手后所有物体将按Y坐标自动排列', {
      fontSize: '16px',
      color: '#666666'
    }).setOrigin(0.5);

    // 初始记录位置
    this.updateSignalPositions();
  }

  sortItems() {
    // 按当前Y坐标排序
    const sortedItems = [...this.items].sort((a, b) => a.y - b.y);

    // 计算新位置并应用动画
    sortedItems.forEach((item, index) => {
      const newY = 100 + index * 60; // 垂直间距60像素
      const originalX = item.getData('originalX');

      this.tweens.add({
        targets: item,
        x: originalX,
        y: newY,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          // 排序完成后更新信号
          this.updateSignalPositions();
        }
      });
    });
  }

  updateSignalPositions() {
    window.__signals__.itemPositions = this.items.map((item, index) => ({
      index: item.getData('index'),
      x: Math.round(item.x),
      y: Math.round(item.y)
    }));

    // 输出当前排序状态到控制台
    console.log('Current Sort Order (by Y):', 
      [...this.items]
        .sort((a, b) => a.y - b.y)
        .map(item => `#${item.getData('index') + 1}`)
        .join(' -> ')
    );
  }

  update() {
    // 实时更新信号状态
    if (this.items.length > 0) {
      window.__signals__.currentState = {
        sortedOrder: [...this.items]
          .sort((a, b) => a.y - b.y)
          .map(item => item.getData('index')),
        timestamp: Date.now()
      };
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#F0F0F0',
  scene: DragSortScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出验证函数
window.verifyDragSort = function() {
  const signals = window.__signals__;
  console.log('=== Drag Sort Verification ===');
  console.log('Total Drags:', signals.dragCount);
  console.log('Total Sorts:', signals.sortCount);
  console.log('Current Positions:', signals.itemPositions);
  console.log('Recent Events:', signals.events.slice(-5));
  console.log('Current Sorted Order:', signals.currentState?.sortedOrder);
  return signals;
};

console.log('🎮 Drag Sort Game Loaded!');
console.log('📊 Run window.verifyDragSort() to check state');
console.log('🎯 Drag any pink box and release to trigger auto-sort');