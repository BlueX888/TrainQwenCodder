const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建大场景背景 - 使用网格便于观察相机移动
  const graphics = this.add.graphics();
  
  // 绘制场景边界
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.strokeRect(0, 0, 1600, 1200);
  
  // 绘制网格背景
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 垂直线
  for (let x = 0; x <= 1600; x += 100) {
    graphics.lineBetween(x, 0, x, 1200);
  }
  
  // 水平线
  for (let y = 0; y <= 1200; y += 100) {
    graphics.lineBetween(0, y, 1600, y);
  }
  
  // 添加坐标标记
  const style = { 
    fontSize: '16px', 
    fill: '#ffffff',
    backgroundColor: '#000000'
  };
  
  for (let x = 0; x <= 1600; x += 200) {
    for (let y = 0; y <= 1200; y += 200) {
      this.add.text(x + 10, y + 10, `(${x},${y})`, style);
    }
  }
  
  // 创建玩家精灵（使用程序化生成的纹理）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();
  
  // 在场景中心创建玩家
  this.player = this.add.sprite(800, 600, 'player');
  
  // 设置相机边界 - 限制相机只能在场景范围内移动
  this.cameras.main.setBounds(0, 0, 1600, 1200);
  
  // 让相机跟随玩家
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  
  // 创建键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 添加WASD控制
  this.keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 显示提示信息
  const infoText = this.add.text(10, 10, 
    '使用方向键或WASD移动\n相机被限制在1600x1200范围内', 
    {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    }
  );
  infoText.setScrollFactor(0); // 固定在屏幕上
  
  // 显示相机位置信息
  this.cameraInfo = this.add.text(10, 100, '', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
  this.cameraInfo.setScrollFactor(0);
}

function update(time, delta) {
  const speed = 300;
  const velocity = { x: 0, y: 0 };
  
  // 处理玩家移动
  if (this.cursors.left.isDown || this.keys.a.isDown) {
    velocity.x = -speed;
  } else if (this.cursors.right.isDown || this.keys.d.isDown) {
    velocity.x = speed;
  }
  
  if (this.cursors.up.isDown || this.keys.w.isDown) {
    velocity.y = -speed;
  } else if (this.cursors.down.isDown || this.keys.s.isDown) {
    velocity.y = speed;
  }
  
  // 更新玩家位置
  this.player.x += velocity.x * (delta / 1000);
  this.player.y += velocity.y * (delta / 1000);
  
  // 限制玩家在场景范围内
  this.player.x = Phaser.Math.Clamp(this.player.x, 16, 1600 - 16);
  this.player.y = Phaser.Math.Clamp(this.player.y, 16, 1200 - 16);
  
  // 更新相机信息显示
  const cam = this.cameras.main;
  this.cameraInfo.setText(
    `相机位置: (${Math.round(cam.scrollX)}, ${Math.round(cam.scrollY)})\n` +
    `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
    `场景大小: 1600 x 1200\n` +
    `相机视口: ${cam.width} x ${cam.height}`
  );
}

new Phaser.Game(config);