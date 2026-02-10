const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 设置世界边界为更大的范围，方便观察相机跟随
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  this.physics.world.setBounds(0, 0, 2000, 2000);

  // 绘制背景网格，帮助观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 2000; x += 100) {
    graphics.lineBetween(x, 0, x, 2000);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 2000; y += 100) {
    graphics.lineBetween(0, y, 2000, y);
  }

  // 创建玩家矩形（使用 Rectangle 游戏对象）
  this.player = this.add.rectangle(1000, 1000, 50, 50, 0xff0000);
  
  // 添加一个文本标签跟随玩家
  this.playerLabel = this.add.text(0, 0, 'Player', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  });

  // 设置相机跟随玩家矩形
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  
  // 可选：设置相机跟随的平滑度
  // 参数说明：startFollow(target, roundPixels, lerpX, lerpY)
  // lerpX 和 lerpY 控制跟随的平滑度，值越小越平滑但延迟越大

  // 添加说明文字（固定在相机视口）
  this.infoText = this.add.text(10, 10, 'Camera following the red square\nMoving to upper-left', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
  this.infoText.setScrollFactor(0); // 固定在屏幕上，不随相机移动

  // 显示坐标信息
  this.coordText = this.add.text(10, 80, '', {
    fontSize: '14px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.coordText.setScrollFactor(0);

  // 移动速度
  this.moveSpeed = 2;
}

function update(time, delta) {
  // 让矩形向左上方移动
  this.player.x -= this.moveSpeed;
  this.player.y -= this.moveSpeed;

  // 边界检测：如果到达世界边界，则重置位置
  if (this.player.x < 50) {
    this.player.x = 1950;
  }
  if (this.player.y < 50) {
    this.player.y = 1950;
  }

  // 更新标签位置（显示在矩形上方）
  this.playerLabel.setPosition(
    this.player.x - this.playerLabel.width / 2,
    this.player.y - 40
  );

  // 更新坐标显示
  this.coordText.setText(
    `Player Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
    `Camera Position: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
  );
}

new Phaser.Game(config);