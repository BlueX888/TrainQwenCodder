class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortOrder = 0; // 可验证的状态信号：记录排序次数
  }

  preload() {
    // 使用Graphics程序化生成灰色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 80, 60);
    graphics.generateTexture('grayBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 创建背景
    this.add.rectangle(400, 300, 800, 600, 0x222222);
    
    // 标题文本
    this.add.text(400, 30, 'Drag Gray Boxes - Auto Sort by Y Position', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 状态显示文本
    this.sortText = this.add.text(400, 570, 'Sort Count: 0', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 存储所有物体的数组
    this.boxes = [];

    // 创建20个灰色物体
    const cols = 5;
    const rows = 4;
    const startX = 150;
    const startY = 100;
    const spacingX = 130;
    const spacingY = 100;

    for (let i = 0; i < 20; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      // 创建物体
      const box = this.add.image(x, y, 'grayBox');
      box.setInteractive({ draggable: true });
      
      // 添加编号文本
      const text = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 存储物体和文本的引用
      box.labelText = text;
      box.originalIndex = i;
      
      this.boxes.push(box);

      // 拖拽时的视觉反馈
      box.on('pointerover', () => {
        box.setTint(0xaaaaaa);
      });

      box.on('pointerout', () => {
        box.clearTint();
      });
    }

    // 设置拖拽事件监听
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      // 拖拽时跟随鼠标
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 文本跟随物体
      if (gameObject.labelText) {
        gameObject.labelText.x = dragX;
        gameObject.labelText.y = dragY;
      }

      // 拖拽时高亮显示
      gameObject.setTint(0xffff00);
      gameObject.setDepth(1000);
      if (gameObject.labelText) {
        gameObject.labelText.setDepth(1001);
      }
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setScale(1.1);
      if (gameObject.labelText) {
        gameObject.labelText.setScale(1.1);
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复大小和颜色
      gameObject.setScale(1);
      gameObject.clearTint();
      gameObject.setDepth(0);
      
      if (gameObject.labelText) {
        gameObject.labelText.setScale(1);
        gameObject.labelText.setDepth(1);
      }

      // 触发自动排序
      this.autoSort();
    });

    // 添加说明文本
    this.add.text(10, 60, 'Drag boxes and release\nThey will auto-sort by Y position', {
      fontSize: '14px',
      color: '#aaaaaa'
    });
  }

  autoSort() {
    // 增加排序计数
    this.sortOrder++;
    this.sortText.setText(`Sort Count: ${this.sortOrder}`);

    // 按Y坐标排序所有物体
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);

    // 计算新的排列位置（5列4行网格）
    const cols = 5;
    const startX = 150;
    const startY = 100;
    const spacingX = 130;
    const spacingY = 100;

    sortedBoxes.forEach((box, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const targetX = startX + col * spacingX;
      const targetY = startY + row * spacingY;

      // 使用Tween动画平滑移动到新位置
      this.tweens.add({
        targets: box,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: 'Back.easeOut'
      });

      // 文本也要跟随移动
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

    // 添加视觉反馈
    this.cameras.main.shake(100, 0.002);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: DragSortScene,
  parent: 'game-container'
};

new Phaser.Game(config);