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
  // 场景尺寸
  const sceneWidth = 1600;
  const sceneHeight = 1200;
  
  // 创建背景网格，显示整个场景范围
  const graphics = this.add.graphics();
  
  // 绘制背景
  graphics.fillStyle(0x1a1a1a, 1);
  graphics.fillRect(0, 0, sceneWidth, sceneHeight);
  
  // 绘制网格线
  graphics.lineStyle(1, 0x444444, 0.5);
  const gridSize = 100;
  
  // 垂直线
  for (let x = 0; x <= sceneWidth; x += gridSize) {
    graphics.lineBetween(x, 0, x, sceneHeight);
  }
  
  // 水平线
  for (let y = 0; y <= sceneHeight; y += gridSize) {
    graphics.lineBetween(0, y, sceneWidth, y);
  }
  
  // 绘制场景边界（红色粗线）
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.strokeRect(2, 2, sceneWidth - 4, sceneHeight - 4);
  
  // 在四个角落添加标记
  const cornerSize = 50;
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(cornerSize, cornerSize, 20); // 左上
  graphics.fillCircle(sceneWidth - cornerSize, cornerSize, 20); // 右上
  graphics.fillCircle(cornerSize, sceneHeight - cornerSize, 20); // 左下
  graphics.fillCircle(sceneWidth - cornerSize, sceneHeight - cornerSize, 20); // 右下
  
  // 添加坐标文字标记
  const style = { 
    fontSize: '16px', 
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  };
  
  this.add.text(cornerSize, cornerSize + 30, '(0, 0)', style).setOrigin(0.5);
  this.add.text(sceneWidth - cornerSize, cornerSize + 30, `(${sceneWidth}, 0)`, style).setOrigin(0.5);
  this.add.text(cornerSize, sceneHeight - cornerSize - 30, `(0, ${sceneHeight})`, style).setOrigin(0.5);
  this.add.text(sceneWidth - cornerSize, sceneHeight - cornerSize - 30, `(${sceneWidth}, ${sceneHeight})`, style).setOrigin(0.5);
  
  // 在场景中心添加一个标记
  const centerX = sceneWidth / 2;
  const centerY = sceneHeight / 2;
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(centerX, centerY, 30);
  this.add.text(centerX, centerY, 'CENTER', { 
    fontSize: '20px', 
    fill: '#000000',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 设置相机边界 - 关键API
  const camera = this.cameras.main;
  camera.setBounds(0, 0, sceneWidth, sceneHeight);
  
  // 设置相机初始位置到中心
  camera.centerOn(centerX, centerY);
  
  // 创建键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 添加WASD控制
  this.keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 创建固定在屏幕上的UI信息（不随相机移动）
  this.infoText = this.add.text(10, 10, '', {
    fontSize: '14px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  }).setScrollFactor(0).setDepth(1000);
  
  // 创建相机视口边界指示器（固定在屏幕边缘）
  this.viewportIndicator = this.add.graphics().setScrollFactor(0).setDepth(999);
  
  // 存储相机移动速度
  this.cameraSpeed = 300;
}

function update(time, delta) {
  const camera = this.cameras.main;
  const speed = this.cameraSpeed * (delta / 1000);
  
  // 键盘控制相机移动
  if (this.cursors.left.isDown || this.keys.a.isDown) {
    camera.scrollX -= speed;
  }
  if (this.cursors.right.isDown || this.keys.d.isDown) {
    camera.scrollX += speed;
  }
  if (this.cursors.up.isDown || this.keys.w.isDown) {
    camera.scrollY -= speed;
  }
  if (this.cursors.down.isDown || this.keys.s.isDown) {
    camera.scrollY += speed;
  }
  
  // 更新信息文本
  this.infoText.setText([
    '相机控制: 方向键 或 WASD',
    `相机位置: (${Math.round(camera.scrollX)}, ${Math.round(camera.scrollY)})`,
    `相机中心: (${Math.round(camera.midPoint.x)}, ${Math.round(camera.midPoint.y)})`,
    `场景边界: 0, 0, 1600, 1200`,
    `相机边界已限制: 相机无法移出场景范围`
  ]);
  
  // 绘制相机视口边界指示器
  this.viewportIndicator.clear();
  this.viewportIndicator.lineStyle(3, 0x00ff00, 1);
  this.viewportIndicator.strokeRect(1, 1, camera.width - 2, camera.height - 2);
  
  // 在视口四角绘制小三角形
  this.viewportIndicator.fillStyle(0x00ff00, 1);
  const triangleSize = 15;
  // 左上角
  this.viewportIndicator.fillTriangle(
    5, 5,
    5 + triangleSize, 5,
    5, 5 + triangleSize
  );
  // 右上角
  this.viewportIndicator.fillTriangle(
    camera.width - 5, 5,
    camera.width - 5 - triangleSize, 5,
    camera.width - 5, 5 + triangleSize
  );
  // 左下角
  this.viewportIndicator.fillTriangle(
    5, camera.height - 5,
    5 + triangleSize, camera.height - 5,
    5, camera.height - 5 - triangleSize
  );
  // 右下角
  this.viewportIndicator.fillTriangle(
    camera.width - 5, camera.height - 5,
    camera.width - 5 - triangleSize, camera.height - 5,
    camera.width - 5, camera.height - 5 - triangleSize
  );
}

new Phaser.Game(config);