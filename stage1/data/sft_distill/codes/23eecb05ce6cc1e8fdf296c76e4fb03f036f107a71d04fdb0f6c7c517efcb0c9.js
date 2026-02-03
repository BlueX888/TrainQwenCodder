const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let triangle;
const moveSpeed = 100; // 每秒移动像素

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建一个更大的世界边界，让三角形有足够的移动空间
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  this.physics.world.setBounds(0, 0, 2000, 2000);

  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个指向右上方的三角形
  graphics.beginPath();
  graphics.moveTo(0, -20);      // 顶点（上）
  graphics.lineTo(15, 20);      // 右下
  graphics.lineTo(-15, 20);     // 左下
  graphics.closePath();
  graphics.fillPath();
  
  // 添加边框使三角形更清晰
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();

  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangleTexture', 40, 50);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成纹理

  // 创建三角形精灵，初始位置在世界中心
  triangle = this.add.sprite(1000, 1000, 'triangleTexture');

  // 设置相机跟随三角形
  // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
  // lerpX 和 lerpY 设置为 0.1 使相机平滑跟随
  this.cameras.main.startFollow(triangle, true, 0.1, 0.1, 0, 0);

  // 添加一些参考网格线帮助观察移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直网格线
  for (let x = 0; x <= 2000; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 2000);
  }
  
  // 绘制水平网格线
  for (let y = 0; y <= 2000; y += 100) {
    gridGraphics.lineBetween(0, y, 2000, y);
  }

  // 添加文本说明（固定在相机上）
  const infoText = this.add.text(10, 10, '三角形自动向右上移动\n相机跟随中...', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setScrollFactor(0); // 固定在相机视图上，不随世界移动

  // 添加位置信息文本
  this.positionText = this.add.text(10, 70, '', {
    fontSize: '14px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 计算移动增量（向右上方移动，45度角）
  const moveX = moveSpeed * (delta / 1000); // 向右
  const moveY = -moveSpeed * (delta / 1000); // 向上（Y轴负方向）

  // 更新三角形位置
  triangle.x += moveX;
  triangle.y += moveY;

  // 更新位置信息显示
  this.positionText.setText(
    `三角形位置: (${Math.round(triangle.x)}, ${Math.round(triangle.y)})\n` +
    `相机中心: (${Math.round(this.cameras.main.scrollX + 400)}, ${Math.round(this.cameras.main.scrollY + 300)})`
  );

  // 如果三角形超出世界边界，重置到起始位置
  if (triangle.x > 1900 || triangle.y < 100) {
    triangle.setPosition(100, 1900);
  }
}

new Phaser.Game(config);