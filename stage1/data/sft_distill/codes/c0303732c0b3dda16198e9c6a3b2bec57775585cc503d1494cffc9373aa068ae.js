const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制网格（扩大范围以便看到移动效果）
  for (let x = 0; x <= 3000; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 600);
  }
  for (let y = 0; y <= 600; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(3000, y);
  }
  graphics.strokePath();
  
  // 使用 Graphics 绘制圆形并生成纹理
  const circleGraphics = this.add.graphics();
  circleGraphics.fillStyle(0xff0000, 1);
  circleGraphics.fillCircle(25, 25, 25); // 中心点在 (25, 25)，半径 25
  circleGraphics.generateTexture('circle', 50, 50);
  circleGraphics.destroy(); // 生成纹理后销毁 Graphics 对象
  
  // 创建圆形精灵对象
  this.player = this.add.sprite(400, 300, 'circle');
  
  // 设置相机跟随该对象
  // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
  // roundPixels: 是否四舍五入像素，避免抖动
  // lerpX/lerpY: 跟随的平滑度 (0-1)，1 表示立即跟随，越小越平滑
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  
  // 设置相机边界（可选，让相机知道世界的范围）
  this.cameras.main.setBounds(0, 0, 3000, 600);
  
  // 添加速度变量
  this.moveSpeed = 3;
  
  // 添加文字提示
  const text = this.add.text(10, 10, '圆形会自动向右移动，相机跟随', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
}

function update(time, delta) {
  // 让圆形对象自动向右移动
  this.player.x += this.moveSpeed;
  
  // 当对象移动到边界时，可以选择停止或循环
  if (this.player.x > 2900) {
    this.player.x = 100; // 循环回起点
  }
}

new Phaser.Game(config);