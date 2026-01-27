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
  // 设置场景大小
  const sceneWidth = 1600;
  const sceneHeight = 1200;
  
  // 绘制网格背景来标识场景范围
  const graphics = this.add.graphics();
  
  // 绘制背景
  graphics.fillStyle(0x1a1a1a, 1);
  graphics.fillRect(0, 0, sceneWidth, sceneHeight);
  
  // 绘制网格线
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 垂直网格线
  for (let x = 0; x <= sceneWidth; x += 100) {
    graphics.lineBetween(x, 0, x, sceneHeight);
  }
  
  // 水平网格线
  for (let y = 0; y <= sceneHeight; y += 100) {
    graphics.lineBetween(0, y, sceneWidth, y);
  }
  
  // 绘制场景边界
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.strokeRect(2, 2, sceneWidth - 4, sceneHeight - 4);
  
  // 在四个角落添加标记
  const cornerSize = 50;
  graphics.fillStyle(0xff0000, 1);
  
  // 左上角
  graphics.fillCircle(cornerSize, cornerSize, 10);
  
  // 右上角
  graphics.fillCircle(sceneWidth - cornerSize, cornerSize, 10);
  
  // 左下角
  graphics.fillCircle(cornerSize, sceneHeight - cornerSize, 10);
  
  // 右下角
  graphics.fillCircle(sceneWidth - cornerSize, sceneHeight - cornerSize, 10);
  
  // 添加中心标记
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(sceneWidth / 2, sceneHeight / 2, 15);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(sceneWidth / 2, sceneHeight / 2, 5);
  
  // 设置相机边界 - 关键API
  this.cameras.main.setBounds(0, 0, sceneWidth, sceneHeight);
  
  // 设置相机初始位置到场景中心
  this.cameras.main.centerOn(sceneWidth / 2, sceneHeight / 2);
  
  // 创建键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 添加 WASD 键控制
  this.keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 创建信息文本（固定在屏幕上）
  this.infoText = this.add.text(10, 10, '', {
    font: '16px Arial',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.infoText.setScrollFactor(0); // 固定在屏幕上，不随相机移动
  
  // 创建说明文本
  const instructions = this.add.text(10, 550, 
    '使用方向键或WASD移动相机\n相机被限制在场景边界内', 
    {
      font: '14px Arial',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );
  instructions.setScrollFactor(0);
  
  // 相机移动速度
  this.cameraSpeed = 5;
}

function update(time, delta) {
  const camera = this.cameras.main;
  
  // 键盘控制相机移动
  if (this.cursors.left.isDown || this.keys.a.isDown) {
    camera.scrollX -= this.cameraSpeed;
  }
  if (this.cursors.right.isDown || this.keys.d.isDown) {
    camera.scrollX += this.cameraSpeed;
  }
  if (this.cursors.up.isDown || this.keys.w.isDown) {
    camera.scrollY -= this.cameraSpeed;
  }
  if (this.cursors.down.isDown || this.keys.s.isDown) {
    camera.scrollY += this.cameraSpeed;
  }
  
  // 更新信息文本
  this.infoText.setText([
    `相机位置: (${Math.round(camera.scrollX)}, ${Math.round(camera.scrollY)})`,
    `相机中心: (${Math.round(camera.midPoint.x)}, ${Math.round(camera.midPoint.y)})`,
    `场景大小: 1600 x 1200`,
    `相机边界: ${camera.useBounds ? '已启用' : '未启用'}`
  ]);
}

// 启动游戏
new Phaser.Game(config);