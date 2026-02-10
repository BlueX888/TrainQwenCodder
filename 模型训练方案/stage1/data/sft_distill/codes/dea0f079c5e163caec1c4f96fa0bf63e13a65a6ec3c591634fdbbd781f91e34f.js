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
  }
};

function preload() {
  // 使用 Graphics 生成椭圆纹理
  const graphics = this.add.graphics();
  
  // 绘制椭圆
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(30, 30, 60, 40); // 中心点(30,30)，宽60，高40
  
  // 生成纹理
  graphics.generateTexture('ellipse', 60, 60);
  graphics.destroy();
}

function create() {
  // 设置世界边界，使对象可以移动到更大的范围
  this.physics.world.setBounds(0, 0, 3000, 3000);
  
  // 创建椭圆精灵对象，初始位置在场景中心
  this.ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置椭圆向右上方移动（右上方向：x正，y负）
  this.ellipse.setVelocity(150, -100);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 3000, 3000);
  
  // 相机跟随椭圆对象
  this.cameras.main.startFollow(this.ellipse);
  
  // 添加背景网格以便观察相机移动效果
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x333333, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 3000; x += 100) {
    graphics.lineBetween(x, 0, x, 3000);
  }
  for (let y = 0; y <= 3000; y += 100) {
    graphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加文字提示
  const text = this.add.text(10, 10, '相机跟随椭圆移动', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 让文字固定在相机视图上
  text.setScrollFactor(0);
}

function update(time, delta) {
  // 可选：如果椭圆移出世界边界，可以重置位置
  if (this.ellipse.x > 2900 || this.ellipse.y < 100) {
    this.ellipse.setPosition(400, 300);
  }
}

new Phaser.Game(config);