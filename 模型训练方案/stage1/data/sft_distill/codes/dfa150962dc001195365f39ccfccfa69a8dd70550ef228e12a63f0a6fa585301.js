class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.items = [];
    this.sortCount = 0;
  }

  preload() {
    // 创建粉色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillRoundedRect(0, 0, 80, 60, 8);
    graphics.generateTexture('pinkBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      sortCount: 0,
      itemPositions: [],
      lastSortTime: 0,
      dragActive: false
    };

    // 添加标题
    this.add.text(400, 30, 'Drag Pink Boxes to Sort by Y Position', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 60, 'Release to auto-sort by vertical position', {
      fontSize: '16px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // 创建8个粉色物体
    const startX = 150;
    const startY = 150;
    const spacing = 80;

    for (let i = 0; i < 8; i++) {
      const x = startX + (i % 4) * spacing;
      const y = startY + Math.floor(i / 4) * spacing;
      
      const item = this.add.image(x, y, 'pinkBox');
      item.setInteractive({ draggable: true });
      
      // 添加序号文本
      const text = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文本绑定到物体
      item.labelText = text;
      item.originalIndex = i;
      
      this.items.push(item);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步文本位置
      if (gameObject.labelText) {
        gameObject.labelText.x = dragX;
        gameObject.labelText.y = dragY;
      }

      window.__signals__.dragActive = true;
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽时提升层级
      gameObject.setDepth(100);
      if (gameObject.labelText) {
        gameObject.labelText.setDepth(101);
      }
      
      // 添加缩放效果
      this.tweens.add({
        targets: gameObject,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100
      });
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复缩放
      this.tweens.add({
        targets: gameObject,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });

      window.__signals__.dragActive = false;
      
      // 触发排序
      this.sortItemsByY();
    });

    // 添加排序计数显示
    this.sortCountText = this.add.text(400, 500, 'Sort Count: 0', {
      fontSize: '20px',
      color: '#FFD700'
    }).setOrigin(0.5);

    // 初始化位置信号
    this.updateSignals();
  }

  sortItemsByY() {
    // 按Y坐标排序
    const sortedItems = [...this.items].sort((a, b) => a.y - b.y);
    
    // 计算新位置（垂直排列在左侧）
    const targetX = 100;
    const startY = 150;
    const verticalSpacing = 70;

    sortedItems.forEach((item, index) => {
      const targetY = startY + index * verticalSpacing;
      
      // 重置层级
      item.setDepth(0);
      if (item.labelText) {
        item.labelText.setDepth(1);
      }

      // 平滑移动到新位置
      this.tweens.add({
        targets: item,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Back.easeOut',
        onUpdate: () => {
          // 同步文本位置
          if (item.labelText) {
            item.labelText.x = item.x;
            item.labelText.y = item.y;
          }
        }
      });
    });

    // 更新排序计数
    this.sortCount++;
    this.sortCountText.setText(`Sort Count: ${this.sortCount}`);

    // 更新信号
    window.__signals__.sortCount = this.sortCount;
    window.__signals__.lastSortTime = Date.now();
    
    // 延迟更新位置信号（等待动画完成）
    this.time.delayedCall(600, () => {
      this.updateSignals();
    });

    // 输出排序日志
    console.log(JSON.stringify({
      event: 'sort_completed',
      sortCount: this.sortCount,
      timestamp: Date.now(),
      order: sortedItems.map(item => item.originalIndex + 1)
    }));
  }

  updateSignals() {
    window.__signals__.itemPositions = this.items.map((item, index) => ({
      id: item.originalIndex + 1,
      x: Math.round(item.x),
      y: Math.round(item.y)
    }));
  }

  update() {
    // 实时更新位置信号（仅在非拖拽状态）
    if (!window.__signals__.dragActive) {
      this.updateSignals();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 输出初始化日志
console.log(JSON.stringify({
  event: 'game_initialized',
  timestamp: Date.now(),
  itemCount: 8
}));