class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.sortOrder = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号输出
    window.__signals__ = {
      objectCount: 3,
      sortOrder: [],
      dragCount: 0,
      lastSortTime: 0
    };

    // 创建白色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 100, 80);
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(0, 0, 100, 80);
    graphics.generateTexture('whiteBox', 100, 80);
    graphics.destroy();

    // 创建3个可拖拽的白色物体
    const startX = 150;
    const spacing = 150;
    const startY = 200;

    for (let i = 0; i < 3; i++) {
      const obj = this.add.sprite(startX + i * spacing, startY + i * 50, 'whiteBox');
      obj.setInteractive({ draggable: true });
      obj.setData('id', i);
      obj.setData('originalIndex', i);
      
      // 添加文本标签
      const text = this.add.text(0, 0, `Box ${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 将文本绑定到物体
      obj.setData('label', text);
      this.updateLabelPosition(obj);
      
      this.objects.push(obj);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      this.updateLabelPosition(gameObject);
      
      // 高亮正在拖拽的物体
      gameObject.setTint(0xcccccc);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时提升深度
      gameObject.setDepth(100);
      gameObject.getData('label').setDepth(101);
      window.__signals__.dragCount++;
      
      console.log(JSON.stringify({
        event: 'dragstart',
        objectId: gameObject.getData('id'),
        position: { x: gameObject.x, y: gameObject.y }
      }));
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 清除高亮
      gameObject.clearTint();
      gameObject.setDepth(0);
      gameObject.getData('label').setDepth(1);
      
      console.log(JSON.stringify({
        event: 'dragend',
        objectId: gameObject.getData('id'),
        position: { x: gameObject.x, y: gameObject.y }
      }));
      
      // 松手后按Y坐标排序
      this.sortObjectsByY();
    });

    // 添加说明文本
    this.add.text(400, 50, 'Drag boxes to reorder by Y position', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 80, 'Release to auto-sort', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 初始化排序顺序
    this.updateSortOrder();
  }

  updateLabelPosition(obj) {
    const label = obj.getData('label');
    if (label) {
      label.setPosition(obj.x, obj.y);
    }
  }

  sortObjectsByY() {
    // 按Y坐标排序对象
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算新的X位置（垂直排列）
    const targetX = 400;
    const startY = 150;
    const spacing = 120;

    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      // 使用Tween实现平滑移动
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onUpdate: () => {
          this.updateLabelPosition(obj);
        },
        onComplete: () => {
          this.updateLabelPosition(obj);
        }
      });
    });

    // 更新排序顺序
    this.sortOrder = sorted.map(obj => obj.getData('id'));
    this.updateSortOrder();
    
    console.log(JSON.stringify({
      event: 'sorted',
      sortOrder: this.sortOrder,
      positions: sorted.map(obj => ({ id: obj.getData('id'), y: obj.y }))
    }));
  }

  updateSortOrder() {
    // 更新当前排序状态
    const currentOrder = [...this.objects]
      .sort((a, b) => a.y - b.y)
      .map(obj => obj.getData('id'));
    
    window.__signals__.sortOrder = currentOrder;
    window.__signals__.lastSortTime = Date.now();
    
    // 输出当前状态
    console.log(JSON.stringify({
      event: 'status',
      sortOrder: currentOrder,
      objectPositions: this.objects.map(obj => ({
        id: obj.getData('id'),
        x: Math.round(obj.x),
        y: Math.round(obj.y)
      }))
    }));
  }

  update(time, delta) {
    // 持续更新标签位置（确保同步）
    this.objects.forEach(obj => {
      this.updateLabelPosition(obj);
    });
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