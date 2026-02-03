class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.sortCount = 0; // 可验证的状态信号
    this.isDragging = false;
  }

  preload() {
    // 使用Graphics创建灰色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 80, 60);
    graphics.generateTexture('grayBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, 'Drag & Drop to Sort by Y Position', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortText = this.add.text(400, 70, `Sort Count: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建10个可拖拽的灰色物体
    const startX = 400;
    const startY = 150;
    const spacing = 65;

    for (let i = 0; i < 10; i++) {
      const yPos = startY + i * spacing;
      const obj = this.add.sprite(startX, yPos, 'grayBox');
      
      // 添加编号文本
      const label = this.add.text(startX, yPos, `#${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 设置交互和拖拽
      obj.setInteractive({ draggable: true, cursor: 'pointer' });
      
      // 存储关联的文本和初始索引
      obj.label = label;
      obj.index = i;
      obj.originalY = yPos;

      this.objects.push(obj);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      this.isDragging = true;
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步文本位置
      if (gameObject.label) {
        gameObject.label.x = dragX;
        gameObject.label.y = dragY;
      }

      // 拖拽时改变透明度
      gameObject.setAlpha(0.7);
      gameObject.setScale(1.1);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时提升深度
      gameObject.setDepth(100);
      if (gameObject.label) {
        gameObject.label.setDepth(101);
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      this.isDragging = false;
      
      // 恢复外观
      gameObject.setAlpha(1);
      gameObject.setScale(1);
      gameObject.setDepth(0);
      if (gameObject.label) {
        gameObject.label.setDepth(1);
      }

      // 触发排序
      this.sortObjectsByY();
    });

    // 添加说明文本
    this.add.text(400, 560, 'Drag any box and release to auto-sort by Y position', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);
  }

  sortObjectsByY() {
    // 按当前Y坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算新位置
    const startY = 150;
    const spacing = 65;

    // 增加排序计数
    this.sortCount++;
    this.sortText.setText(`Sort Count: ${this.sortCount}`);

    // 使用动画移动到新位置
    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;
      const targetX = 400;

      // 如果位置有变化，则执行动画
      if (Math.abs(obj.y - targetY) > 1 || Math.abs(obj.x - targetX) > 1) {
        this.tweens.add({
          targets: obj,
          x: targetX,
          y: targetY,
          duration: 300,
          ease: 'Power2',
          onUpdate: () => {
            // 同步文本位置
            if (obj.label) {
              obj.label.x = obj.x;
              obj.label.y = obj.y;
            }
          }
        });

        // 文本也添加动画（虽然会被onUpdate覆盖，但保证同步）
        if (obj.label) {
          this.tweens.add({
            targets: obj.label,
            x: targetX,
            y: targetY,
            duration: 300,
            ease: 'Power2'
          });
        }
      }
    });

    // 添加视觉反馈：短暂闪烁排序文本
    this.tweens.add({
      targets: this.sortText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 例如高亮显示当前拖拽的物体
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);