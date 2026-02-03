class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.items = [];
  }

  preload() {
    // 程序化生成黄色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFD700, 1); // 黄色
    graphics.fillRect(0, 0, 80, 60);
    graphics.generateTexture('yellowBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, '拖拽黄色物体进行排序', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加说明文本
    this.add.text(400, 60, '松手后会按Y坐标自动排列', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 添加排序计数显示
    this.sortText = this.add.text(400, 90, `排序次数: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建8个黄色物体
    const startX = 150;
    const startY = 150;
    const spacing = 70;

    for (let i = 0; i < 8; i++) {
      const x = startX + (i % 4) * 150;
      const y = startY + Math.floor(i / 4) * 150;
      
      const item = this.add.sprite(x, y, 'yellowBox');
      
      // 添加编号文本
      const label = this.add.text(x, y, `${i + 1}`, {
        fontSize: '32px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 将文本作为物体的子对象
      item.label = label;
      item.originalIndex = i;

      // 启用交互和拖拽
      item.setInteractive({ draggable: true, useHandCursor: true });

      // 拖拽开始
      item.on('dragstart', (pointer) => {
        item.setTint(0xFFFFAA); // 高亮显示
        item.setDepth(100); // 提升层级
        item.label.setDepth(101);
      });

      // 拖拽中
      item.on('drag', (pointer, dragX, dragY) => {
        item.x = dragX;
        item.y = dragY;
        item.label.x = dragX;
        item.label.y = dragY;
      });

      // 拖拽结束
      item.on('dragend', (pointer) => {
        item.clearTint();
        item.setDepth(0);
        item.label.setDepth(1);
        this.sortItems();
      });

      this.items.push(item);
    }

    // 添加重置按钮
    const resetButton = this.add.rectangle(400, 550, 120, 40, 0x4444ff)
      .setInteractive({ useHandCursor: true });
    
    this.add.text(400, 550, '重置位置', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    resetButton.on('pointerdown', () => {
      this.resetPositions();
    });

    resetButton.on('pointerover', () => {
      resetButton.setFillStyle(0x6666ff);
    });

    resetButton.on('pointerout', () => {
      resetButton.setFillStyle(0x4444ff);
    });
  }

  sortItems() {
    // 按Y坐标排序
    const sortedItems = [...this.items].sort((a, b) => a.y - b.y);

    // 计算新的排列位置（垂直排列）
    const startX = 400;
    const startY = 150;
    const spacing = 50;

    sortedItems.forEach((item, index) => {
      const targetY = startY + index * spacing;
      
      // 使用 Tween 动画移动到新位置
      this.tweens.add({
        targets: [item, item.label],
        x: startX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
    });

    // 更新排序计数
    this.sortCount++;
    this.sortText.setText(`排序次数: ${this.sortCount}`);
    
    console.log('Sort completed. Count:', this.sortCount);
  }

  resetPositions() {
    // 重置到初始位置
    const startX = 150;
    const startY = 150;

    this.items.forEach((item, i) => {
      const x = startX + (i % 4) * 150;
      const y = startY + Math.floor(i / 4) * 150;
      
      this.tweens.add({
        targets: [item, item.label],
        x: x,
        y: y,
        duration: 300,
        ease: 'Power2'
      });
    });

    console.log('Positions reset');
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene
};

const game = new Phaser.Game(config);