class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.boxes = [];
    this.sortCount = 0; // 验证信号：记录排序次数
    this.isDragging = false;
  }

  preload() {
    // 使用Graphics创建蓝色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(0, 0, 80, 60);
    graphics.generateTexture('blueBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文字
    this.add.text(400, 30, 'Drag Blue Boxes - They will auto-sort by Y position', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加状态显示文字
    this.sortText = this.add.text(400, 60, 'Sort Count: 0', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建10个蓝色物体，随机分布
    const startX = 150;
    const spacing = 70;
    
    for (let i = 0; i < 10; i++) {
      const x = startX + (i % 5) * spacing;
      const y = 150 + Math.floor(i / 5) * 200 + Math.random() * 100;
      
      const box = this.add.sprite(x, y, 'blueBox');
      box.setInteractive({ draggable: true });
      
      // 添加序号文字
      const text = this.add.text(x, y, `#${i + 1}`, {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文字作为box的属性，方便一起移动
      box.labelText = text;
      box.originalIndex = i;
      
      this.boxes.push(box);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      this.isDragging = true;
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步移动文字标签
      if (gameObject.labelText) {
        gameObject.labelText.x = dragX;
        gameObject.labelText.y = dragY;
      }
      
      // 拖拽时高亮显示
      gameObject.setTint(0x5dade2);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时放大
      gameObject.setScale(1.1);
      gameObject.setDepth(100);
      if (gameObject.labelText) {
        gameObject.labelText.setDepth(101);
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      this.isDragging = false;
      
      // 恢复原始颜色和大小
      gameObject.clearTint();
      gameObject.setScale(1);
      gameObject.setDepth(0);
      if (gameObject.labelText) {
        gameObject.labelText.setDepth(1);
      }
      
      // 触发自动排序
      this.autoSortByY();
    });

    // 添加说明文字
    this.add.text(400, 580, 'Drag any box and release - all boxes will sort by Y position', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  autoSortByY() {
    // 按Y坐标排序所有物体
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);
    
    // 计算新的排列位置（垂直排列）
    const startY = 120;
    const spacingY = 45;
    const columnX = [200, 350, 500]; // 三列布局
    
    sortedBoxes.forEach((box, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const targetX = columnX[col];
      const targetY = startY + row * spacingY;
      
      // 使用Tween动画平滑移动到新位置
      this.tweens.add({
        targets: box,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: 'Back.easeOut',
        onUpdate: () => {
          // 同步移动文字标签
          if (box.labelText) {
            box.labelText.x = box.x;
            box.labelText.y = box.y;
          }
        }
      });
      
      // 文字标签也添加动画
      if (box.labelText) {
        this.tweens.add({
          targets: box.labelText,
          x: targetX,
          y: targetY,
          duration: 400,
          ease: 'Back.easeOut'
        });
      }
    });
    
    // 更新排序计数
    this.sortCount++;
    this.sortText.setText(`Sort Count: ${this.sortCount}`);
    
    // 添加视觉反馈
    this.tweens.add({
      targets: this.sortText,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 例如：鼠标悬停效果
    this.boxes.forEach(box => {
      if (!this.isDragging) {
        const pointer = this.input.activePointer;
        const bounds = box.getBounds();
        if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
          box.setTint(0x85c1e9);
        } else {
          box.clearTint();
        }
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: DragSortScene,
  parent: 'game-container'
};

new Phaser.Game(config);