class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 验证状态：记录排序次数
    this.boxes = [];
  }

  preload() {
    // 创建灰色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 0, 80, 60);
    graphics.generateTexture('grayBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文字
    this.add.text(400, 30, '拖拽灰色物体，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加状态显示
    this.sortText = this.add.text(400, 60, `排序次数: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建10个灰色物体
    const startX = 400;
    const startY = 120;
    const spacing = 65;

    for (let i = 0; i < 10; i++) {
      const box = this.add.image(startX, startY + i * spacing, 'grayBox');
      
      // 添加编号文字
      const text = this.add.text(startX, startY + i * spacing, `${i + 1}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 启用交互和拖拽
      box.setInteractive({ draggable: true, cursor: 'pointer' });
      
      // 存储关联的文字对象
      box.labelText = text;
      
      this.boxes.push(box);
    }

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      // 提升层级
      this.children.bringToTop(gameObject);
      this.children.bringToTop(gameObject.labelText);
      
      // 放大效果
      gameObject.setScale(1.1);
      gameObject.setTint(0xaaaaaa);
    });

    // 监听拖拽中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 文字跟随
      gameObject.labelText.x = dragX;
      gameObject.labelText.y = dragY;
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复原样
      gameObject.setScale(1);
      gameObject.clearTint();
      
      // 执行排序
      this.sortBoxesByY();
    });
  }

  sortBoxesByY() {
    // 增加排序计数
    this.sortCount++;
    this.sortText.setText(`排序次数: ${this.sortCount}`);

    // 按当前Y坐标排序
    this.boxes.sort((a, b) => a.y - b.y);

    // 计算新位置并使用Tween动画移动
    const startY = 120;
    const spacing = 65;
    const targetX = 400;

    this.boxes.forEach((box, index) => {
      const targetY = startY + index * spacing;

      // 动画移动物体
      this.tweens.add({
        targets: box,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });

      // 动画移动文字
      this.tweens.add({
        targets: box.labelText,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
    });
  }

  update(time, delta) {
    // 可选：添加悬停效果
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