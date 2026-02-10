class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.dragCount = 0; // 状态信号：拖拽次数
    this.isSorted = false; // 状态信号：是否已排序
    this.boxes = []; // 存储所有方块
  }

  preload() {
    // 使用 Graphics 创建黄色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFD700, 1); // 金黄色
    graphics.fillRect(0, 0, 60, 60);
    graphics.lineStyle(3, 0xFFA500, 1); // 橙色边框
    graphics.strokeRect(0, 0, 60, 60);
    graphics.generateTexture('yellowBox', 60, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文字
    this.add.text(400, 30, '拖拽黄色方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加状态显示文字
    this.statusText = this.add.text(400, 60, '拖拽次数: 0 | 状态: 未排序', {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建10个黄色方块，随机分布
    const startX = 150;
    const startY = 150;
    
    for (let i = 0; i < 10; i++) {
      // 随机位置分布
      const x = startX + (i % 5) * 120 + Phaser.Math.Between(-20, 20);
      const y = startY + Math.floor(i / 5) * 200 + Phaser.Math.Between(-50, 50);
      
      const box = this.add.image(x, y, 'yellowBox');
      box.setInteractive({ draggable: true });
      
      // 添加序号文字
      const text = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文字绑定到方块上
      box.textLabel = text;
      box.index = i + 1;
      
      this.boxes.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      // 同步更新文字位置
      if (gameObject.textLabel) {
        gameObject.textLabel.x = dragX;
        gameObject.textLabel.y = dragY;
      }
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽时放大并提升深度
      this.tweens.add({
        targets: gameObject,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100
      });
      gameObject.setDepth(100);
      if (gameObject.textLabel) {
        gameObject.textLabel.setDepth(101);
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复大小
      this.tweens.add({
        targets: gameObject,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
      gameObject.setDepth(0);
      if (gameObject.textLabel) {
        gameObject.textLabel.setDepth(1);
      }

      // 更新拖拽次数
      this.dragCount++;
      
      // 松手后按Y坐标排序
      this.sortBoxesByY();
    });

    // 添加重置按钮
    const resetButton = this.add.text(400, 550, '重置位置', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#4444ff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    resetButton.on('pointerdown', () => {
      this.resetBoxes();
    });

    resetButton.on('pointerover', () => {
      resetButton.setScale(1.1);
    });

    resetButton.on('pointerout', () => {
      resetButton.setScale(1);
    });
  }

  sortBoxesByY() {
    // 按当前Y坐标排序
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);
    
    // 计算新的排列位置（垂直居中排列）
    const startX = 400;
    const startY = 150;
    const spacing = 40;

    sortedBoxes.forEach((box, index) => {
      const targetY = startY + index * spacing;
      
      // 使用缓动动画移动到新位置
      this.tweens.add({
        targets: box,
        x: startX,
        y: targetY,
        duration: 500,
        ease: 'Power2'
      });

      // 同步移动文字
      if (box.textLabel) {
        this.tweens.add({
          targets: box.textLabel,
          x: startX,
          y: targetY,
          duration: 500,
          ease: 'Power2'
        });
      }
    });

    // 更新排序状态
    this.isSorted = true;
    this.updateStatus();
  }

  resetBoxes() {
    // 重置到随机位置
    const startX = 150;
    const startY = 150;
    
    this.boxes.forEach((box, i) => {
      const x = startX + (i % 5) * 120 + Phaser.Math.Between(-20, 20);
      const y = startY + Math.floor(i / 5) * 200 + Phaser.Math.Between(-50, 50);
      
      this.tweens.add({
        targets: box,
        x: x,
        y: y,
        duration: 300,
        ease: 'Back.easeOut'
      });

      if (box.textLabel) {
        this.tweens.add({
          targets: box.textLabel,
          x: x,
          y: y,
          duration: 300,
          ease: 'Back.easeOut'
        });
      }
    });

    this.isSorted = false;
    this.dragCount = 0;
    this.updateStatus();
  }

  updateStatus() {
    const sortedText = this.isSorted ? '已排序' : '未排序';
    this.statusText.setText(`拖拽次数: ${this.dragCount} | 状态: ${sortedText}`);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);