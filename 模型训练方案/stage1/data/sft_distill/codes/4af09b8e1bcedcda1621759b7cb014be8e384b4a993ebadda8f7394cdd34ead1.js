class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.items = [];
    this.sortCount = 0;
  }

  preload() {
    // 创建粉色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRoundedRect(0, 0, 100, 80, 10);
    graphics.lineStyle(3, 0xff1493, 1); // 深粉色边框
    graphics.strokeRoundedRect(0, 0, 100, 80, 10);
    graphics.generateTexture('pinkBox', 100, 80);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      sortCount: 0,
      currentOrder: [],
      lastSortTime: 0
    };

    // 添加标题
    this.add.text(400, 50, 'Drag Pink Objects to Sort', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ff69b4',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 90, 'Release to auto-sort by Y position', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建3个粉色物体
    const startX = 400;
    const startY = 200;
    const spacing = 120;

    for (let i = 0; i < 3; i++) {
      const item = this.add.sprite(startX, startY + i * spacing, 'pinkBox');
      
      // 添加编号文本
      const label = this.add.text(0, 0, `Item ${i + 1}`, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 创建容器
      const container = this.add.container(startX, startY + i * spacing);
      container.add([item, label]);
      container.setSize(100, 80);
      container.setData('id', i + 1);
      container.setData('originalIndex', i);

      // 设置可拖拽
      container.setInteractive({ draggable: true, useHandCursor: true });

      // 拖拽事件
      container.on('drag', (pointer, dragX, dragY) => {
        container.x = dragX;
        container.y = dragY;
        container.setAlpha(0.7);
        container.setScale(1.1);
      });

      // 拖拽开始
      container.on('dragstart', () => {
        container.setDepth(100);
      });

      // 拖拽结束
      container.on('dragend', () => {
        container.setAlpha(1);
        container.setScale(1);
        container.setDepth(0);
        this.sortItems();
      });

      this.items.push(container);
    }

    // 添加排序次数显示
    this.sortText = this.add.text(400, 550, 'Sort Count: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 初始化顺序
    this.updateSignals();
  }

  sortItems() {
    // 按当前Y坐标排序
    const sorted = [...this.items].sort((a, b) => a.y - b.y);

    // 计算新位置
    const startX = 400;
    const startY = 200;
    const spacing = 120;

    // 使用动画移动到新位置
    sorted.forEach((item, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: item,
        x: startX,
        y: targetY,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          if (index === sorted.length - 1) {
            // 最后一个动画完成时更新信号
            this.sortCount++;
            this.sortText.setText(`Sort Count: ${this.sortCount}`);
            this.updateSignals();
          }
        }
      });
    });

    // 添加视觉反馈
    this.cameras.main.shake(100, 0.002);
  }

  updateSignals() {
    // 获取当前顺序（从上到下）
    const currentOrder = [...this.items]
      .sort((a, b) => a.y - b.y)
      .map(item => item.getData('id'));

    window.__signals__ = {
      sortCount: this.sortCount,
      currentOrder: currentOrder,
      lastSortTime: Date.now(),
      itemPositions: this.items.map(item => ({
        id: item.getData('id'),
        x: Math.round(item.x),
        y: Math.round(item.y)
      }))
    };

    // 输出到控制台便于验证
    console.log('Sort Signals:', JSON.stringify(window.__signals__, null, 2));
  }

  update() {
    // 实时更新位置信息（不触发排序）
    if (this.items.every(item => !item.input.dragState)) {
      // 没有物体在拖拽时才更新
      const positions = this.items.map(item => ({
        id: item.getData('id'),
        y: Math.round(item.y)
      }));
      
      if (window.__signals__) {
        window.__signals__.itemPositions = positions;
      }
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出游戏实例用于测试
window.__game__ = game;