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
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制网格线（扩大范围以便移动时可见）
  for (let x = 0; x <= 3000; x += 100) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y <= 600; y += 100) {
    graphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加坐标标记
  const style = { font: '16px Arial', fill: '#00ff00' };
  for (let x = 0; x <= 3000; x += 200) {
    this.add.text(x + 5, 5, `x:${x}`, style);
  }
  
  // 使用 Graphics 创建圆形纹理
  const circleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  circleGraphics.fillStyle(0xff0000, 1);
  circleGraphics.fillCircle(25, 25, 25); // 圆心在 (25, 25)，半径 25
  circleGraphics.generateTexture('circle', 50, 50);
  circleGraphics.destroy();
  
  // 创建物理精灵对象
  this.player = this.physics.add.sprite(400, 300, 'circle');
  
  // 设置精灵向右移动
  this.player.setVelocityX(150);
  
  // 设置物理边界（扩大世界范围）
  this.physics.world.setBounds(0, 0, 3000, 600);
  
  // 设置相机边界
  this.cameras.main.setBounds(0, 0, 3000, 600);
  
  // 相机跟随玩家对象，居中显示
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  
  // 添加说明文字（固定在相机上）
  const infoText = this.add.text(10, 10, '相机跟随红色圆形', {
    font: '20px Arial',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 可选：当圆形到达边界时停止
  if (this.player.x >= 2950) {
    this.player.setVelocityX(0);
  }
}

new Phaser.Game(config);