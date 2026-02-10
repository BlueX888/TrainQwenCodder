const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 添加提示文本
  const text = this.add.text(400, 30, '点击画面生成三角形', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorValue = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);

    // 创建 Graphics 对象绘制三角形
    const graphics = this.add.graphics();
    graphics.fillStyle(colorValue, 1);

    // 定义三角形的三个顶点（相对于点击位置）
    const size = Phaser.Math.Between(30, 60); // 随机大小
    const rotation = Phaser.Math.Between(0, 360) * Math.PI / 180; // 随机旋转角度

    // 计算三个顶点坐标（等边三角形）
    const point1 = {
      x: pointer.x + Math.cos(rotation) * size,
      y: pointer.y + Math.sin(rotation) * size
    };
    const point2 = {
      x: pointer.x + Math.cos(rotation + (2 * Math.PI / 3)) * size,
      y: pointer.y + Math.sin(rotation + (2 * Math.PI / 3)) * size
    };
    const point3 = {
      x: pointer.x + Math.cos(rotation + (4 * Math.PI / 3)) * size,
      y: pointer.y + Math.sin(rotation + (4 * Math.PI / 3)) * size
    };

    // 绘制填充三角形
    graphics.fillTriangle(
      point1.x, point1.y,
      point2.x, point2.y,
      point3.x, point3.y
    );

    // 添加描边效果
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeTriangle(
      point1.x, point1.y,
      point2.x, point2.y,
      point3.x, point3.y
    );

    // 添加淡入效果
    graphics.setAlpha(0);
    this.tweens.add({
      targets: graphics,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });

    // 可选：添加点击反馈音效（使用简单的视觉反馈代替）
    const clickFeedback = this.add.circle(pointer.x, pointer.y, 5, 0xffffff, 0.8);
    this.tweens.add({
      targets: clickFeedback,
      scale: 3,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        clickFeedback.destroy();
      }
    });
  });

  // 添加清空按钮
  const clearButton = this.add.text(400, 570, '[ 点击此处清空所有三角形 ]', {
    fontSize: '16px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  clearButton.setOrigin(0.5);
  clearButton.setInteractive({ useHandCursor: true });

  clearButton.on('pointerdown', () => {
    // 清除所有 Graphics 对象
    const allGraphics = this.children.list.filter(child => child instanceof Phaser.GameObjects.Graphics);
    allGraphics.forEach(graphic => graphic.destroy());
  });

  clearButton.on('pointerover', () => {
    clearButton.setStyle({ color: '#ffffff' });
  });

  clearButton.on('pointerout', () => {
    clearButton.setStyle({ color: '#ffff00' });
  });
}

new Phaser.Game(config);