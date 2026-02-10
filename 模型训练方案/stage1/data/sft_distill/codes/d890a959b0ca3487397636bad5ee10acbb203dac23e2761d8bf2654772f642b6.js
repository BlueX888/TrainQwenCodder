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

let diamond;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个大的世界边界，让菱形有足够的移动空间
  this.physics.world.setBounds(0, 0, 3200, 2400);
  
  // 绘制网格背景以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 3200; x += 100) {
    graphics.lineBetween(x, 0, x, 2400);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 2400; y += 100) {
    graphics.lineBetween(0, y, 3200, y);
  }
  
  // 创建菱形纹理
  const diamondGraphics = this.add.graphics();
  diamondGraphics.fillStyle(0xff6b6b, 1);
  
  // 绘制菱形路径
  const diamondPath = new Phaser.Geom.Polygon([
    0, -30,    // 上顶点
    30, 0,     // 右顶点
    0, 30,     // 下顶点
    -30, 0     // 左顶点
  ]);
  
  diamondGraphics.fillPoints(diamondPath.points, true);
  
  // 生成纹理
  diamondGraphics.generateTexture('diamond', 60, 60);
  diamondGraphics.destroy();
  
  // 创建菱形精灵，初始位置在世界中心
  diamond = this.physics.add.sprite(1600, 1200, 'diamond');
  
  // 设置菱形向左下移动
  // 负X速度表示向左，正Y速度表示向下
  diamond.setVelocity(-150, 150);
  
  // 设置碰撞边界
  diamond.setCollideWorldBounds(true);
  diamond.setBounce(1, 1); // 碰到边界反弹
  
  // 配置相机
  const camera = this.cameras.main;
  
  // 设置相机边界与世界边界一致
  camera.setBounds(0, 0, 3200, 2400);
  
  // 相机跟随菱形，保持居中
  camera.startFollow(diamond, true, 0.1, 0.1);
  
  // 添加说明文字（固定在相机上）
  const text = this.add.text(10, 10, '菱形自动向左下移动\n相机跟随并保持居中', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图上
  
  // 显示当前位置信息
  this.positionText = this.add.text(10, 80, '', {
    fontSize: '14px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新位置显示
  if (this.positionText && diamond) {
    this.positionText.setText(
      `菱形位置: (${Math.round(diamond.x)}, ${Math.round(diamond.y)})\n` +
      `速度: (${Math.round(diamond.body.velocity.x)}, ${Math.round(diamond.body.velocity.y)})`
    );
  }
}

new Phaser.Game(config);