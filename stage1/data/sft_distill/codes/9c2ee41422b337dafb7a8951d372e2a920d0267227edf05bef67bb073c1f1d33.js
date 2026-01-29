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
  // 扩展世界边界，使对象可以移动更远
  this.physics.world.setBounds(0, 0, 3000, 600);
  
  // 使用 Graphics 绘制背景网格，方便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 3000; x += 100) {
    graphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 600; y += 100) {
    graphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加网格标签
  for (let x = 0; x <= 3000; x += 200) {
    this.add.text(x + 5, 5, x.toString(), {
      fontSize: '12px',
      color: '#666666'
    }).setScrollFactor(1);
  }
  
  // 创建圆形纹理
  const circle = this.add.graphics();
  circle.fillStyle(0x00ff00, 1);
  circle.fillCircle(25, 25, 25); // 中心点(25,25)，半径25
  circle.generateTexture('playerCircle', 50, 50);
  circle.destroy();
  
  // 创建物理精灵
  player = this.physics.add.sprite(100, 300, 'playerCircle');
  player.setCollideWorldBounds(true);
  
  // 设置自动向右移动的速度
  player.setVelocityX(150);
  
  // 设置相机跟随玩家
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 3000, 600);
  
  // 添加提示文本（固定在相机上）
  const infoText = this.add.text(10, 10, '相机跟随圆形对象', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setScrollFactor(0); // 固定在相机上，不随世界滚动
  
  // 添加坐标显示
  this.coordText = this.add.text(10, 40, '', {
    fontSize: '14px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.coordText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新坐标显示
  if (this.coordText && player) {
    this.coordText.setText(
      `对象位置: (${Math.round(player.x)}, ${Math.round(player.y)})\n` +
      `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
    );
  }
  
  // 当对象到达边界时，可以选择停止或反向
  if (player.x >= 2950) {
    player.setVelocityX(0);
  }
}

new Phaser.Game(config);