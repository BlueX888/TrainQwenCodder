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
  // 获取主相机
  const camera = this.cameras.main;
  
  // 设置相机边界为 1600x1200 的场景大小
  camera.setBounds(0, 0, 1600, 1200);
  
  // 绘制场景背景 - 使用网格便于观察
  const graphics = this.add.graphics();
  
  // 绘制浅色背景
  graphics.fillStyle(0x404040, 1);
  graphics.fillRect(0, 0, 1600, 1200);
  
  // 绘制网格线
  graphics.lineStyle(1, 0x606060, 0.5);
  
  // 垂直网格线
  for (let x = 0; x <= 1600; x += 100) {
    graphics.beginPath();
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 1200);
    graphics.strokePath();
  }
  
  // 水平网格线
  for (let y = 0; y <= 1200; y += 100) {
    graphics.beginPath();
    graphics.moveTo(0, y);
    graphics.lineTo(1600, y);
    graphics.strokePath();
  }
  
  // 绘制场景边界标记
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.strokeRect(2, 2, 1596, 1196);
  
  // 在四个角落添加标记文字
  const textStyle = {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000'
  };
  
  this.add.text(20, 20, 'TOP-LEFT (0, 0)', textStyle);
  this.add.text(1600 - 220, 20, 'TOP-RIGHT (1600, 0)', textStyle);
  this.add.text(20, 1200 - 50, 'BOTTOM-LEFT (0, 1200)', textStyle);
  this.add.text(1600 - 280, 1200 - 50, 'BOTTOM-RIGHT (1600, 1200)', textStyle);
  
  // 在场景中心添加标记
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(800, 600, 20);
  this.add.text(800 - 80, 600 - 50, 'CENTER\n(800, 600)', {
    fontSize: '20px',
    fill: '#00ff00',
    align: 'center'
  });
  
  // 添加控制说明
  this.add.text(10, 10, 'Use Arrow Keys to Move Camera\nCamera is bounded to 1600x1200', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setScrollFactor(0); // 固定在屏幕上，不随相机移动
  
  // 创建键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 添加相机位置显示（固定在屏幕上）
  this.cameraInfo = this.add.text(10, 560, '', {
    fontSize: '14px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 3 }
  }).setScrollFactor(0);
  
  // 相机移动速度
  this.cameraSpeed = 5;
}

function update(time, delta) {
  const camera = this.cameras.main;
  
  // 使用方向键控制相机移动
  if (this.cursors.left.isDown) {
    camera.scrollX -= this.cameraSpeed;
  } else if (this.cursors.right.isDown) {
    camera.scrollX += this.cameraSpeed;
  }
  
  if (this.cursors.up.isDown) {
    camera.scrollY -= this.cameraSpeed;
  } else if (this.cursors.down.isDown) {
    camera.scrollY += this.cameraSpeed;
  }
  
  // 更新相机位置信息显示
  this.cameraInfo.setText(
    `Camera Position: (${Math.round(camera.scrollX)}, ${Math.round(camera.scrollY)})\n` +
    `Camera Bounds: 0-${camera.bounds.width}, 0-${camera.bounds.height}`
  );
}

// 启动游戏
new Phaser.Game(config);