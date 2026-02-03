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
  const text = this.add.text(400, 30, 'Click anywhere to create triangles!', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorValue = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 创建新的 Graphics 对象
    const graphics = this.add.graphics();
    graphics.fillStyle(colorValue, 1);

    // 在点击位置绘制三角形
    // 三角形顶点相对于点击位置的偏移
    const size = 40; // 三角形大小
    const x = pointer.x;
    const y = pointer.y;

    // 绘制等边三角形（顶点朝上）
    graphics.beginPath();
    graphics.moveTo(x, y - size); // 顶点
    graphics.lineTo(x - size * 0.866, y + size * 0.5); // 左下角
    graphics.lineTo(x + size * 0.866, y + size * 0.5); // 右下角
    graphics.closePath();
    graphics.fillPath();

    // 添加随机旋转效果，让三角形更有趣
    graphics.rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);
  });

  // 添加计数器
  let triangleCount = 0;
  const countText = this.add.text(400, 570, 'Triangles: 0', {
    fontSize: '20px',
    color: '#ffffff'
  });
  countText.setOrigin(0.5);

  // 更新计数器
  this.input.on('pointerdown', () => {
    triangleCount++;
    countText.setText(`Triangles: ${triangleCount}`);
  });
}

new Phaser.Game(config);