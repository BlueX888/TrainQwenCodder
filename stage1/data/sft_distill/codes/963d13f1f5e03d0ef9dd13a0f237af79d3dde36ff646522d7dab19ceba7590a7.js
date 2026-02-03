const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let ellipse;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 1. 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(30, 30, 60, 40); // 在 (30, 30) 位置绘制椭圆
  graphics.generateTexture('ellipse', 60, 60);
  graphics.destroy();

  // 2. 设置世界边界，让椭圆有足够的移动空间
  this.physics.world.setBounds(0, -2000, 800, 3000);

  // 3. 创建椭圆精灵并启用物理
  ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 4. 设置椭圆向上移动（负 Y 方向）
  ellipse.setVelocityY(-150);

  // 5. 设置相机跟随椭圆
  this.cameras.main.startFollow(ellipse, true, 0.1, 0.1);
  
  // 6. 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, -2000, 800, 3000);

  // 添加背景网格以便观察移动效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制水平线
  for (let y = -2000; y <= 1000; y += 100) {
    gridGraphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制垂直线
  for (let x = 0; x <= 800; x += 100) {
    gridGraphics.lineBetween(x, -2000, x, 1000);
  }

  // 添加文本提示（固定在相机上）
  const text = this.add.text(16, 16, 'Camera Following Ellipse', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图上
}

function update(time, delta) {
  // 当椭圆移动到顶部边界时，重置到底部
  if (ellipse.y < -1900) {
    ellipse.y = 900;
  }
}

new Phaser.Game(config);