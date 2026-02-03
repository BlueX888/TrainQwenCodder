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
  // 扩大世界边界，允许对象向上移动
  this.physics.world.setBounds(0, -5000, 800, 6000);
  
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(30, 30, 60, 40); // 中心点(30,30)，宽60，高40
  graphics.generateTexture('ellipseTex', 60, 60);
  graphics.destroy();
  
  // 创建椭圆精灵对象，启用物理引擎
  ellipse = this.physics.add.sprite(400, 300, 'ellipseTex');
  ellipse.setCollideWorldBounds(false); // 不与世界边界碰撞
  
  // 设置椭圆向上移动的速度（负Y方向）
  ellipse.setVelocity(0, -150);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, -5000, 800, 6000);
  
  // 相机跟随椭圆对象，保持居中
  this.cameras.main.startFollow(ellipse, true, 0.1, 0.1);
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '椭圆自动向上移动\n相机跟随并保持居中', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图上
  
  // 添加参考网格（用于观察移动效果）
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 800; x += 100) {
    gridGraphics.moveTo(x, -5000);
    gridGraphics.lineTo(x, 1000);
  }
  
  // 绘制水平线
  for (let y = -5000; y <= 1000; y += 100) {
    gridGraphics.moveTo(0, y);
    gridGraphics.lineTo(800, y);
  }
  
  gridGraphics.strokePath();
}

function update(time, delta) {
  // 椭圆已经通过物理引擎自动移动，无需额外更新
  // 相机自动跟随，无需手动调整
}

new Phaser.Game(config);