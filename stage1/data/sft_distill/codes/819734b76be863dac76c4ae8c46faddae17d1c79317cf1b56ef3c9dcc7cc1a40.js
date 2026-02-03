class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.items = [];
    this.sortOrder = []; // 可验证的状态信号：记录当前排序顺序
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建白色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(0, 0, 80, 60, 8);
    graphics.lineStyle(2, 0x333333, 1);
    graphics.strokeRoundedRect(0, 0, 80, 60, 8);
    graphics.generateTexture('whiteBox', 80, 60);
    graphics.destroy();

    // 创建8个可拖拽的白色物体
    const startX = 100;
    const startY = 100;
    const spacingY = 70;

    for (let i = 0; i < 8; i++) {
      const item = this.add.image(startX, startY + i * spacingY, 'whiteBox');
      item.setInteractive({ draggable: true });
      item.setData('id', i); // 设置唯一标识
      
      // 添加编号文本
      const text = this.add.text(0, 0, `#${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 将文本作为子对象绑定到item
      item.text = text;
      this.updateTextPosition(item);
      
      this.items.push(item);
    }

    // 初始化排序顺序
    this.updateSortOrder();

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      this.updateTextPosition(gameObject);
      
      // 拖拽时提高层级
      this.children.bringToTop(gameObject);
      this.children.bringToTop(gameObject.text);
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      this.sortItemsByY();
    });

    // 添加说明文字
    this.add.text(400, 30, 'Drag and Drop to Sort by Y Position', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 显示当前排序状态
    this.statusText = this.add.text(400, 570, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    this.updateStatusText();
  }

  updateTextPosition(item) {
    if (item.text) {
      item.text.x = item.x;
      item.text.y = item.y;
    }
  }

  sortItemsByY() {
    // 按Y坐标排序物体
    const sorted = [...this.items].sort((a, b) => a.y - b.y);
    
    // 计算新位置
    const targetX = 100;
    const startY = 100;
    const spacingY = 70;

    // 使用Tween动画移动到新位置
    sorted.forEach((item, index) => {
      const targetY = startY + index * spacingY;
      
      this.tweens.add({
        targets: item,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onUpdate: () => {
          this.updateTextPosition(item);
        },
        onComplete: () => {
          this.updateTextPosition(item);
        }
      });

      // 同时移动文本
      this.tweens.add({
        targets: item.text,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
    });

    // 更新排序顺序状态
    this.updateSortOrder();
  }

  updateSortOrder() {
    // 按当前Y坐标排序并记录ID顺序
    const sorted = [...this.items].sort((a, b) => a.y - b.y);
    this.sortOrder = sorted.map(item => item.getData('id'));
    this.updateStatusText();
    
    // 输出到控制台便于验证
    console.log('Current sort order (by ID):', this.sortOrder);
  }

  updateStatusText() {
    if (this.statusText) {
      this.statusText.setText(`Sort Order: [${this.sortOrder.join(', ')}]`);
    }
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中无需特殊更新）
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

new Phaser.Game(config);