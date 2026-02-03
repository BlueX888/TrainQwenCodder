class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.signals = {
      dragCount: 0,
      sortCount: 0,
      currentOrder: []
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture('greenCircle', 50, 50);
    graphics.destroy();

    // 创建10个可拖拽物体
    const startX = 100;
    const startY = 100;
    const spacing = 60;

    for (let i = 0; i < 10; i++) {
      const obj = this.add.sprite(startX, startY + i * spacing, 'greenCircle');
      obj.setInteractive({ draggable: true });
      obj.setData('id', i);
      
      // 添加序号文本
      const text = this.add.text(0, 0, `${i}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      obj.text = text;
      this.objects.push(obj);
      
      // 更新文本位置
      text.setPosition(obj.x, obj.y);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.text.setPosition(dragX, dragY);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setTint(0xffff00); // 拖拽时变黄
      this.signals.dragCount++;
      this.updateSignals();
    });

    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.clearTint();
      this.sortObjects();
    });

    // 添加说明文本
    this.add.text(400, 50, '拖拽绿色圆球，松手后自动按Y坐标排序', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 初始化signals
    this.updateCurrentOrder();
    this.updateSignals();
    
    // 暴露signals到全局
    window.__signals__ = this.signals;
  }

  sortObjects() {
    // 按当前Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    
    // 计算新位置
    const startX = 100;
    const startY = 100;
    const spacing = 60;

    // 使用Tween动画移动到新位置
    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: obj,
        x: startX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });

      this.tweens.add({
        targets: obj.text,
        x: startX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
    });

    // 更新排序计数
    this.signals.sortCount++;
    this.updateCurrentOrder();
    this.updateSignals();
    
    // 输出日志
    console.log(JSON.stringify({
      event: 'sort',
      sortCount: this.signals.sortCount,
      order: this.signals.currentOrder
    }));
  }

  updateCurrentOrder() {
    // 记录当前从上到下的物体ID顺序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    this.signals.currentOrder = sorted.map(obj => obj.getData('id'));
  }

  updateSignals() {
    window.__signals__ = {
      dragCount: this.signals.dragCount,
      sortCount: this.signals.sortCount,
      currentOrder: this.signals.currentOrder,
      timestamp: Date.now()
    };
  }

  update(time, delta) {
    // 每帧更新当前顺序（用于实时监控）
    if (time % 1000 < 16) { // 大约每秒更新一次
      this.updateCurrentOrder();
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

// 初始化全局signals
window.__signals__ = {
  dragCount: 0,
  sortCount: 0,
  currentOrder: [],
  timestamp: Date.now()
};