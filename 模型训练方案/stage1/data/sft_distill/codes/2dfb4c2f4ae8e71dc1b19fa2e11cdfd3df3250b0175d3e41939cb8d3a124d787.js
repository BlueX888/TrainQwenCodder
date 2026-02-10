const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 设置世界边界，使场景更大以便观察相机跟随
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  this.physics.world.setBounds(0, 0, 2000, 2000);

  // 创建背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 2000; x += 100) {
    graphics.lineBetween(x, 0, x, 2000);
  }
  for (let y = 0; y <= 2000; y += 100) {
    graphics.lineBetween(0, y, 2000, y);
  }

  // 创建移动的矩形对象
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(-25, -25, 50, 50); // 以中心点绘制
  
  // 生成纹理并创建精灵
  playerGraphics.generateTexture('player', 50, 50);
  playerGraphics.destroy(); // 销毁临时 graphics
  
  this.player = this.add.sprite(400, 1500, 'player');
  
  // 设置相机跟随玩家，并保持居中
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的偏移量（这里设为0保持完全居中）
  this.cameras.main.setFollowOffset(0, 0);
  
  // 添加说明文字（固定在相机上）
  const text = this.add.text(10, 10, '绿色方块自动向右上移动\n相机跟随并保持居中', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
  text.setScrollFactor(0); // 固定在相机视图上
  
  // 存储移动速度
  this.moveSpeed = 2;
}

function update(time, delta) {
  // 让矩形向右上方移动
  this.player.x += this.moveSpeed;
  this.player.y -= this.moveSpeed;
  
  // 可选：当矩形到达世界边界时重置位置
  if (this.player.x > 1900 || this.player.y < 100) {
    this.player.x = 100;
    this.player.y = 1900;
  }
}

new Phaser.Game(config);