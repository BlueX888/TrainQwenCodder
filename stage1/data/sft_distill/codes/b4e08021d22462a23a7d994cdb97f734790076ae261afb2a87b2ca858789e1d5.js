class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.items = [];
    this.dragCount = 0;
    this.sortCount = 0;
  }

  preload() {
    // 使用 Graphics 生成绿色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRoundedRect(0, 0, 80, 60, 8);
    graphics.lineStyle(3, 0x008800, 1);
    graphics.strokeRoundedRect(0, 0, 80, 60, 8);
    graphics.generateTexture('greenBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      items: [],
      dragCount: 0,
      sortCount: 0,
      lastDraggedIndex: -1,
      currentOrder: []
    };

    // 添加标题文本
    this.add.text(400, 30, '拖拽绿色方块，松手后自动按Y坐标排序', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加说明文本
    this.add.text(400, 60, '拖拽次数: 0 | 排序次数: 0', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5).setName('statsText');

    // 创建 10 个绿色物体
    const startX = 150;
    const startY = 120;
    const spacing = 60;

    for (let i = 0; i < 10; i++) {
      const item = this.add.sprite(startX, startY + i * spacing, 'greenBox');
      item.setInteractive({ draggable: true });
      item.setData('index', i);
      item.setData('originalIndex', i);
      
      // 添加序号文本
      const text = this.add.text(startX, startY + i * spacing, `#${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      item.setData('text', text);
      this.items.push(item);

      // 更新 signals
      window.__signals__.items.push({
        index: i,
        x: item.x,
        y: item.y
      });
    }

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setTint(0x88ff88);
      gameObject.setDepth(100);
      const text = gameObject.getData('text');
      text.setDepth(101);
      
      window.__signals__.lastDraggedIndex = gameObject.getData('index');
      console.log(JSON.stringify({
        event: 'dragstart',
        index: gameObject.getData('index'),
        position: { x: gameObject.x, y: gameObject.y }
      }));
    });

    // 监听拖拽中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      const text = gameObject.getData('text');
      text.x = dragX;
      text.y = dragY;
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.clearTint();
      gameObject.setDepth(0);
      const text = gameObject.getData('text');
      text.setDepth(1);
      
      this.dragCount++;
      window.__signals__.dragCount = this.dragCount;
      
      console.log(JSON.stringify({
        event: 'dragend',
        index: gameObject.getData('index'),
        position: { x: gameObject.x, y: gameObject.y }
      }));

      // 按 Y 坐标排序
      this.sortItemsByY();
    });

    // 更新初始顺序
    this.updateCurrentOrder();
  }

  sortItemsByY() {
    // 按当前 Y 坐标排序
    const sortedItems = [...this.items].sort((a, b) => a.y - b.y);
    
    this.sortCount++;
    window.__signals__.sortCount = this.sortCount;

    // 计算新位置并使用动画移动
    const startX = 150;
    const startY = 120;
    const spacing = 60;

    sortedItems.forEach((item, index) => {
      const targetY = startY + index * spacing;
      const text = item.getData('text');
      
      // 更新索引
      item.setData('index', index);

      // 使用 tween 动画平滑移动
      this.tweens.add({
        targets: [item, text],
        x: startX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          // 更新 signals
          this.updateSignals();
        }
      });
    });

    // 更新统计文本
    const statsText = this.children.getByName('statsText');
    statsText.setText(`拖拽次数: ${this.dragCount} | 排序次数: ${this.sortCount}`);

    console.log(JSON.stringify({
      event: 'sort',
      sortCount: this.sortCount,
      newOrder: sortedItems.map(item => item.getData('originalIndex'))
    }));
  }

  updateSignals() {
    window.__signals__.items = this.items.map((item, idx) => ({
      index: item.getData('index'),
      originalIndex: item.getData('originalIndex'),
      x: Math.round(item.x),
      y: Math.round(item.y)
    }));
    
    this.updateCurrentOrder();
  }

  updateCurrentOrder() {
    const sorted = [...this.items].sort((a, b) => a.y - b.y);
    window.__signals__.currentOrder = sorted.map(item => item.getData('originalIndex'));
  }

  update() {
    // 实时更新位置信息（仅在拖拽时）
    if (this.input.activePointer.isDown) {
      this.updateSignals();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出验证接口
window.getGameState = function() {
  return {
    signals: window.__signals__,
    timestamp: Date.now()
  };
};

console.log(JSON.stringify({
  event: 'game_initialized',
  config: {
    width: config.width,
    height: config.height,
    itemCount: 10
  }
}));