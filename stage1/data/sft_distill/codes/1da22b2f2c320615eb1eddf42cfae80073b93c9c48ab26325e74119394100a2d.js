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

let player;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy();

  // 扩展世界边界，允许对象移动更远
  this.physics.world.setBounds(0, 0, 4000, 600);

  // 创建物理精灵
  player = this.physics.add.sprite(400, 300, 'playerCircle');
  
  // 设置圆形向右移动的速度
  player.setVelocityX(150);

  // 设置相机跟随玩家
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 4000, 600);

  // 添加一些参考网格线，帮助观察相机跟随效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x555555, 0.5);
  
  // 绘制垂直网格线
  for (let x = 0; x <= 4000; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平网格线
  for (let y = 0; y <= 600; y += 100) {
    gridGraphics.lineBetween(0, y, 4000, y);
  }

  // 添加文本提示
  const text = this.add.text(16, 16, 'Camera following the green circle', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 让文本固定在相机视图上
  text.setScrollFactor(0);
}

function update(time, delta) {
  // 当圆形到达世界边界时，让它从左边重新开始
  if (player.x > 3900) {
    player.x = 100;
  }
}

new Phaser.Game(config);