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
  // 添加标题文字提示
  const text = this.add.text(400, 30, 'Click anywhere to create triangles!', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);

  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);

    // 创建新的 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色
    graphics.fillStyle(colorHex, 1);

    // 在点击位置绘制三角形
    // 三角形的三个顶点相对于点击位置的偏移
    const size = 40; // 三角形大小
    const x = pointer.x;
    const y = pointer.y;

    // 绘制一个等边三角形（顶点朝上）
    graphics.beginPath();
    graphics.moveTo(x, y - size); // 顶点
    graphics.lineTo(x - size * 0.866, y + size * 0.5); // 左下顶点
    graphics.lineTo(x + size * 0.866, y + size * 0.5); // 右下顶点
    graphics.closePath();
    graphics.fillPath();

    // 添加描边使三角形更明显
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokePath();

    // 可选：添加淡入动画效果
    graphics.setAlpha(0);
    this.tweens.add({
      targets: graphics,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
  });

  // 添加计数器显示已创建的三角形数量
  let triangleCount = 0;
  const countText = this.add.text(16, 16, 'Triangles: 0', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  this.input.on('pointerdown', () => {
    triangleCount++;
    countText.setText('Triangles: ' + triangleCount);
  });
}

new Phaser.Game(config);