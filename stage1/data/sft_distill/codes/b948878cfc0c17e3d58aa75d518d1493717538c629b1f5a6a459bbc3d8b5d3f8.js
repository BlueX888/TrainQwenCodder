class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.dragCount = 0; // 状态信号：拖拽次数
    this.sortedCorrectly = false; // 状态信号：是否完全排序
    this.boxes = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建白色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.lineStyle(2, 0x333333, 1);
    graphics.strokeRect(0, 0, 60, 60);
    graphics.generateTexture('whiteBox', 60, 60);
    graphics.destroy();

    // 创建10个方块，随机Y坐标
    const startX = 400;
    const usedYPositions = [];
    
    for (let i = 0; i < 10; i++) {
      // 生成不重复的随机Y坐标
      let randomY;
      do {
        randomY = Phaser.Math.Between(80, 520);
      } while (usedYPositions.some(y => Math.abs(y - randomY) < 70));
      
      usedYPositions.push(randomY);

      const box = this.add.image(startX, randomY, 'whiteBox');
      box.setInteractive({ draggable: true });
      box.originalIndex = i; // 记录原始索引
      
      // 添加文字标签显示编号
      const text = this.add.text(startX, randomY, `${i + 1}`, {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      box.labelText = text;
      this.boxes.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步文字位置
      if (gameObject.labelText) {
        gameObject.labelText.x = dragX;
        gameObject.labelText.y = dragY;
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      this.dragCount++;
      this.sortBoxes();
    });

    // 创建信息显示
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateInfo();

    // 添加说明文字
    this.add.text(400, 30, '拖动方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  sortBoxes() {
    // 按当前Y坐标排序
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);
    
    // 计算新的Y坐标（等间距排列）
    const startY = 100;
    const spacing = 50;
    
    // 检查是否完全按顺序排列
    this.sortedCorrectly = sortedBoxes.every((box, index) => {
      return box.originalIndex === index;
    });

    // 使用Tween动画移动到新位置
    sortedBoxes.forEach((box, index) => {
      const targetY = startY + index * spacing;
      
      this.tweens.add({
        targets: box,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });

      // 同步移动文字
      if (box.labelText) {
        this.tweens.add({
          targets: box.labelText,
          y: targetY,
          duration: 300,
          ease: 'Power2'
        });
      }
    });

    this.updateInfo();
  }

  updateInfo() {
    const statusText = this.sortedCorrectly ? '✓ 完全排序' : '○ 未完全排序';
    this.infoText.setText([
      `拖拽次数: ${this.dragCount}`,
      `排序状态: ${statusText}`,
      `方块数量: ${this.boxes.length}`
    ]);
  }

  update(time, delta) {
    // 可选：添加更新逻辑
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