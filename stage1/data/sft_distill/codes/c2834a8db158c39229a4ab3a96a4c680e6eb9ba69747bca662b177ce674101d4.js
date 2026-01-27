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
  // 无需预加载外部资源
}

function create() {
  // 场景实际大小
  const WORLD_WIDTH = 1600;
  const WORLD_HEIGHT = 1200;
  
  // 设置世界边界
  this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  
  // 获取主相机
  const camera = this.cameras.main;
  
  // 设置相机边界，限制相机只能在场景范围内移动
  camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  
  // 绘制背景网格以便观察相机移动
  const graphics = this.add.graphics();
  
  // 绘制网格
  graphics.lineStyle(1, 0x444444, 0.8);
  for (let x = 0; x <= WORLD_WIDTH; x += 100) {
    graphics.lineBetween(x, 0, x, WORLD_HEIGHT);
  }
  for (let y = 0; y <= WORLD_HEIGHT; y += 100) {
    graphics.lineBetween(0, y, WORLD_WIDTH, y);
  }
  
  // 绘制场景边界（红色边框）
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.strokeRect(2, 2, WORLD_WIDTH - 4, WORLD_HEIGHT - 4);
  
  // 在四个角落添加标记
  const cornerSize = 50;
  graphics.fillStyle(0xff0000, 0.8);
  // 左上角
  graphics.fillRect(10, 10, cornerSize, cornerSize);
  // 右上角
  graphics.fillRect(WORLD_WIDTH - cornerSize - 10, 10, cornerSize, cornerSize);
  // 左下角
  graphics.fillRect(10, WORLD_HEIGHT - cornerSize - 10, cornerSize, cornerSize);
  // 右下角
  graphics.fillRect(WORLD_WIDTH - cornerSize - 10, WORLD_HEIGHT - cornerSize - 10, cornerSize, cornerSize);
  
  // 添加中心标记
  graphics.fillStyle(0x00ff00, 0.8);
  graphics.fillCircle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 30);
  
  // 添加文字说明（固定在相机视口上）
  const instructionText = this.add.text(10, 10, 
    'Use Arrow Keys to move camera\nCamera bounds: 1600x1200\nRed corners mark scene boundaries', 
    {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );
  instructionText.setScrollFactor(0); // 固定在相机上，不随相机移动
  
  // 显示相机位置信息
  this.positionText = this.add.text(10, 100, '', {
    fontSize: '14px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
  
  // 创建键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 相机移动速度
  this.cameraSpeed = 5;
}

function update(time, delta) {
  const camera = this.cameras.main;
  
  // 使用方向键控制相机移动
  if (this.cursors.left.isDown) {
    camera.scrollX -= this.cameraSpeed;
  }
  if (this.cursors.right.isDown) {
    camera.scrollX += this.cameraSpeed;
  }
  if (this.cursors.up.isDown) {
    camera.scrollY -= this.cameraSpeed;
  }
  if (this.cursors.down.isDown) {
    camera.scrollY += this.cameraSpeed;
  }
  
  // 更新相机位置显示
  this.positionText.setText(
    `Camera Position: (${Math.round(camera.scrollX)}, ${Math.round(camera.scrollY)})\n` +
    `Camera Bounds: 0-${camera.getBounds().width - camera.width}, 0-${camera.getBounds().height - camera.height}`
  );
}

new Phaser.Game(config);