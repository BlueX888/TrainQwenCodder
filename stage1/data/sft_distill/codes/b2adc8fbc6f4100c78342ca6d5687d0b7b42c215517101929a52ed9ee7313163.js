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
  // 设置世界边界，让对象有足够的移动空间
  this.physics.world.setBounds(0, 0, 3000, 3000);
  
  // 创建物理精灵对象（椭圆）
  this.ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置椭圆向右上方移动的速度
  // velocityX 为正值向右，velocityY 为负值向上
  this.ellipse.setVelocity(150, -150);
  
  // 设置椭圆的碰撞边界
  this.ellipse.setCollideWorldBounds(false);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 3000, 3000);
  
  // 相机跟随椭圆对象，保持居中
  this.cameras.main.startFollow(this.ellipse, true, 0.1, 0.1);
  
  // 添加一些背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x333333, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 3000; x += 100) {
    graphics.lineBetween(x, 0, x, 3000);
  }
  for (let y = 0; y <= 3000; y += 100) {
    graphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加文本提示
  const text = this.add.text(10, 10, 'Camera following the ellipse', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 固定文本到相机，使其始终显示在屏幕上
  text.setScrollFactor(0);
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前椭圆会自动移动，相机会自动跟随
}

new Phaser.Game(config);