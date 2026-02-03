class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.dragCount = 0; // 状态信号：拖拽次数
    this.isSorting = false; // 状态信号：是否正在排序
    this.objects = []; // 存储所有可拖拽对象
  }

  preload() {
    // 创建绿色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 80, 50);
    graphics.generateTexture('greenBox', 80, 50);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, '拖拽绿色物体，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 60, '拖拽次数: 0 | 状态: 就绪', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建15个绿色物体，随机分布
    const startX = 150;
    const startY = 120;
    const spacing = 40;

    for (let i = 0; i < 15; i++) {
      // 随机位置
      const x = startX + (i % 5) * 120 + Math.random() * 40;
      const y = startY + Math.floor(i / 5) * 120 + Math.random() * 60;

      // 创建精灵
      const box = this.add.sprite(x, y, 'greenBox');
      box.setInteractive({ draggable: true });
      
      // 添加序号文本
      const text = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 将文本绑定到物体上
      box.textLabel = text;
      box.originalIndex = i;

      this.objects.push(box);

      // 拖拽开始
      box.on('dragstart', (pointer) => {
        box.setTint(0xffff00); // 高亮显示
        box.setDepth(1000); // 置顶
        box.textLabel.setDepth(1001);
      });

      // 拖拽中
      box.on('drag', (pointer, dragX, dragY) => {
        box.x = dragX;
        box.y = dragY;
        box.textLabel.x = dragX;
        box.textLabel.y = dragY;
      });

      // 拖拽结束
      box.on('dragend', (pointer) => {
        box.clearTint(); // 恢复颜色
        box.setDepth(0);
        box.textLabel.setDepth(1);
        
        this.dragCount++;
        this.updateStatus('排序中...');
        
        // 触发排序
        this.sortObjects();
      });
    }

    // 添加重置按钮
    const resetButton = this.add.text(400, 550, '重置位置', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    resetButton.on('pointerdown', () => {
      this.resetPositions();
    });

    resetButton.on('pointerover', () => {
      resetButton.setStyle({ backgroundColor: '#555555' });
    });

    resetButton.on('pointerout', () => {
      resetButton.setStyle({ backgroundColor: '#333333' });
    });
  }

  sortObjects() {
    if (this.isSorting) return;
    
    this.isSorting = true;

    // 按Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算新的排列位置（垂直排列）
    const startX = 400;
    const startY = 120;
    const spacing = 28;

    sorted.forEach((box, index) => {
      const targetY = startY + index * spacing;

      // 使用缓动动画移动到新位置
      this.tweens.add({
        targets: [box, box.textLabel],
        x: startX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          if (index === sorted.length - 1) {
            this.isSorting = false;
            this.updateStatus('就绪');
          }
        }
      });
    });
  }

  resetPositions() {
    if (this.isSorting) return;

    this.isSorting = true;
    this.updateStatus('重置中...');

    // 恢复到初始随机位置
    const startX = 150;
    const startY = 120;

    this.objects.forEach((box, i) => {
      const x = startX + (i % 5) * 120 + Math.random() * 40;
      const y = startY + Math.floor(i / 5) * 120 + Math.random() * 60;

      this.tweens.add({
        targets: [box, box.textLabel],
        x: x,
        y: y,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          if (i === this.objects.length - 1) {
            this.isSorting = false;
            this.dragCount = 0;
            this.updateStatus('就绪');
          }
        }
      });
    });
  }

  updateStatus(status) {
    this.statusText.setText(`拖拽次数: ${this.dragCount} | 状态: ${status}`);
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
  scene: DragSortScene,
  parent: 'game-container'
};

new Phaser.Game(config);