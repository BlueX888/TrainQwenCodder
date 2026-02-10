class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 验证状态：排序次数
    this.items = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFF00, 1);
    graphics.fillRect(0, 0, 100, 80);
    graphics.generateTexture('yellowBox', 100, 80);
    graphics.destroy();

    // 创建3个可拖拽的黄色物体
    const startX = 400;
    const startYPositions = [150, 300, 450];
    
    for (let i = 0; i < 3; i++) {
      const item = this.add.image(startX, startYPositions[i], 'yellowBox');
      item.setInteractive({ draggable: true });
      
      // 添加文本标识
      const text = this.add.text(startX, startYPositions[i], `Item ${i + 1}`, {
        fontSize: '20px',
        color: '#000000'
      });
      text.setOrigin(0.5);
      
      // 将文本关联到物体
      item.labelText = text;
      
      this.items.push(item);
    }

    // 添加说明文本
    this.add.text(400, 50, '拖拽黄色方块，松手后自动按Y坐标排序', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortCountText = this.add.text(400, 550, `排序次数: ${this.sortCount}`, {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步更新文本位置
      if (gameObject.labelText) {
        gameObject.labelText.x = dragX;
        gameObject.labelText.y = dragY;
      }
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      this.sortItems();
    });
  }

  sortItems() {
    // 按Y坐标排序
    const sortedItems = [...this.items].sort((a, b) => a.y - b.y);
    
    // 计算新的Y位置（等间距排列）
    const spacing = 150;
    const startY = 150;
    
    // 使用Tween动画移动到新位置
    sortedItems.forEach((item, index) => {
      const targetY = startY + index * spacing;
      const targetX = 400; // 保持X坐标居中
      
      // 物体动画
      this.tweens.add({
        targets: item,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
      
      // 文本动画
      if (item.labelText) {
        this.tweens.add({
          targets: item.labelText,
          x: targetX,
          y: targetY,
          duration: 300,
          ease: 'Power2'
        });
      }
    });
    
    // 更新排序次数
    this.sortCount++;
    this.sortCountText.setText(`排序次数: ${this.sortCount}`);
    
    console.log('Sorted! Count:', this.sortCount);
  }

  update(time, delta) {
    // 每帧更新逻辑（本例不需要）
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