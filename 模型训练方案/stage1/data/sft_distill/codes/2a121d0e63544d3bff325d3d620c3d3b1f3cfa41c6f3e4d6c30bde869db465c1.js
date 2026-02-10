const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#2d2d2d'
};

let ellipse;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillEllipse(40, 40, 80, 60);
  graphics.generateTexture('ellipseTex', 80, 80);
  graphics.destroy();

  // 设置世界边界，让场景有足够的移动空间
  this.physics.world.setBounds(0, 0, 800, 3000);

  // 创建椭圆精灵对象，初始位置在场景上方中心
  ellipse = this.physics.add.sprite(400, 100, 'ellipseTex');
  
  // 设置椭圆向下移动的速度
  ellipse.setVelocityY(150);

  // 设置相机跟随椭圆对象
  this.cameras.main.startFollow(ellipse);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 800, 3000);

  // 添加提示文本（固定在相机视图上）
  const text = this.add.text(10, 10, '相机跟随椭圆移动', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setScrollFactor(0); // 固定在相机视图，不随相机移动

  // 添加一些参考网格线，帮助观察移动效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  for (let y = 0; y < 3000; y += 100) {
    gridGraphics.lineBetween(0, y, 800, y);
  }
  
  for (let x = 0; x < 800; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 3000);
  }
}

function update(time, delta) {
  // 当椭圆到达底部时，重置到顶部
  if (ellipse.y > 2900) {
    ellipse.setPosition(400, 100);
  }
}

new Phaser.Game(config);