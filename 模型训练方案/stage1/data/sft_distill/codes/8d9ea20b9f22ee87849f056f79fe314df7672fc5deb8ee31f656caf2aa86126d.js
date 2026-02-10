class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.items = [];
    this.sortOrder = []; // 验证状态：当前排序顺序
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建紫色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932CC, 1); // 紫色
    graphics.fillRect(0, 0, 100, 60);
    graphics.generateTexture('purpleRect', 100, 60);
    graphics.destroy();

    // 创建5个可拖拽的紫色物体
    const startX = 350;
    const startY = 100;
    const spacing = 80;

    for (let i = 0; i < 5; i++) {
      const item = this.add.sprite(startX, startY + i * spacing, 'purpleRect');
      item.setInteractive({ draggable: true });
      
      // 添加文本标签显示初始序号
      const text = this.add.text(0, 0, `Item ${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff'
      });
      text.setOrigin(0.5);
      
      // 将文本作为子对象添加到sprite
      item.text = text;
      item.itemId = i + 1; // 用于识别物体
      
      this.items.push(item);
      this.sortOrder.push(i + 1);
    }

    // 添加说明文字
    this.add.text(400, 30, 'Drag purple items to reorder', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 560, 'Release to auto-sort by Y position', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      this.sortAndArrange();
    });

    // 初始化排序顺序显示
    this.updateSortOrderDisplay();
  }

  update() {
    // 更新文本位置跟随sprite
    this.items.forEach(item => {
      if (item.text) {
        item.text.x = item.x;
        item.text.y = item.y;
      }
    });
  }

  sortAndArrange() {
    // 按Y坐标排序物体
    this.items.sort((a, b) => a.y - b.y);

    // 更新sortOrder状态
    this.sortOrder = this.items.map(item => item.itemId);
    console.log('Current sort order:', this.sortOrder);

    // 计算新的排列位置
    const targetX = 350;
    const startY = 100;
    const spacing = 80;

    // 使用Tween动画移动到新位置
    this.items.forEach((item, index) => {
      const targetY = startY + index * spacing;

      this.tweens.add({
        targets: item,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          if (index === this.items.length - 1) {
            // 最后一个动画完成时更新显示
            this.updateSortOrderDisplay();
          }
        }
      });
    });
  }

  updateSortOrderDisplay() {
    // 显示当前排序状态
    if (this.sortOrderText) {
      this.sortOrderText.destroy();
    }

    this.sortOrderText = this.add.text(400, 520, 
      `Sort Order: [${this.sortOrder.join(', ')}]`, {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene
};

new Phaser.Game(config);