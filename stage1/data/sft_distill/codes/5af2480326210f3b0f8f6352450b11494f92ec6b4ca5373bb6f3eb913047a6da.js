class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号：记录排序次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFDD00, 1);
    graphics.fillRoundedRect(0, 0, 120, 80, 8);
    graphics.lineStyle(3, 0xCC9900, 1);
    graphics.strokeRoundedRect(0, 0, 120, 80, 8);
    graphics.generateTexture('yellowBox', 120, 80);
    graphics.destroy();

    // 创建3个可拖拽的物体
    this.boxes = [];
    const startX = 340;
    const startY = [150, 300, 450];
    
    for (let i = 0; i < 3; i++) {
      const box = this.add.image(startX, startY[i], 'yellowBox');
      box.setInteractive({ draggable: true, cursor: 'pointer' });
      box.setData('index', i);
      box.originalX = startX; // 记录原始X坐标
      
      // 添加标签文字
      const text = this.add.text(0, 0, `Box ${i + 1}`, {
        fontSize: '20px',
        color: '#333333',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 将文字作为子对象绑定到box
      box.text = text;
      this.updateTextPosition(box);
      
      this.boxes.push(box);
    }

    // 拖拽事件处理
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      this.updateTextPosition(gameObject);
      
      // 拖拽时提升层级
      this.children.bringToTop(gameObject);
      this.children.bringToTop(gameObject.text);
    });

    // 拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      this.sortBoxes();
    });

    // 添加说明文字
    this.add.text(400, 50, 'Drag and Drop to Sort', {
      fontSize: '28px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortCountText = this.add.text(400, 550, `Sort Count: ${this.sortCount}`, {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // 背景
    this.add.rectangle(400, 300, 800, 600, 0x2C3E50).setDepth(-1);
  }

  updateTextPosition(box) {
    // 更新文字位置跟随box
    box.text.x = box.x;
    box.text.y = box.y;
  }

  sortBoxes() {
    // 按Y坐标排序
    const sortedBoxes = [...this.boxes].sort((a, b) => a.y - b.y);
    
    // 计算目标Y坐标（均匀分布）
    const spacing = 150;
    const startY = 150;
    
    // 使用缓动动画移动到目标位置
    sortedBoxes.forEach((box, index) => {
      const targetY = startY + index * spacing;
      const targetX = box.originalX;
      
      this.tweens.add({
        targets: box,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: 'Back.easeOut',
        onUpdate: () => {
          this.updateTextPosition(box);
        }
      });

      this.tweens.add({
        targets: box.text,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: 'Back.easeOut'
      });
    });

    // 更新排序次数
    this.sortCount++;
    this.sortCountText.setText(`Sort Count: ${this.sortCount}`);
    
    console.log(`Sorted! Count: ${this.sortCount}`);
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2C3E50',
  scene: DragSortScene,
  parent: 'game-container'
};

new Phaser.Game(config);