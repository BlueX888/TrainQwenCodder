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

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();

  // 创建一个更大的世界边界，让相机有空间跟随
  this.physics.world.setBounds(0, 0, 3000, 600);

  // 创建玩家精灵（圆形）
  this.player = this.physics.add.sprite(1500, 300, 'circle');
  
  // 设置精灵向左移动
  this.player.setVelocityX(-150);

  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 3000, 600);
  
  // 让相机跟随玩家
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

  // 添加一些参考网格线，方便观察相机跟随效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直网格线
  for (let x = 0; x <= 3000; x += 100) {
    gridGraphics.moveTo(x, 0);
    gridGraphics.lineTo(x, 600);
  }
  
  // 绘制水平网格线
  for (let y = 0; y <= 600; y += 100) {
    gridGraphics.moveTo(0, y);
    gridGraphics.lineTo(3000, y);
  }
  
  gridGraphics.strokePath();

  // 添加文字提示
  const text = this.add.text(400, 50, '相机跟随圆形对象', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在屏幕上，不随相机移动
}

function update(time, delta) {
  // 当圆形移动到世界边界左侧时，重置到右侧
  if (this.player.x < 0) {
    this.player.x = 3000;
  }
  
  // 当圆形移动到世界边界右侧时，重置到左侧
  if (this.player.x > 3000) {
    this.player.x = 0;
  }
}

new Phaser.Game(config);