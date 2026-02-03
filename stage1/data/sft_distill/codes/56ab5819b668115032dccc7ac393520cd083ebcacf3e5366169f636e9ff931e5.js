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
  // 不需要加载外部资源
}

function create() {
  // 创建大场景背景 (1600x1200)
  const graphics = this.add.graphics();
  
  // 绘制场景背景 - 使用网格表示整个场景
  graphics.fillStyle(0x1a1a1a, 1);
  graphics.fillRect(0, 0, 1600, 1200);
  
  // 绘制网格线，帮助识别场景范围
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 垂直线
  for (let x = 0; x <= 1600; x += 100) {
    graphics.lineBetween(x, 0, x, 1200);
  }
  
  // 水平线
  for (let y = 0; y <= 1200; y += 100) {
    graphics.lineBetween(0, y, 1600, y);
  }
  
  // 绘制场景边界标识
  graphics.lineStyle(4, 0x00ff00, 1);
  graphics.strokeRect(2, 2, 1596, 1196);
  
  // 在四个角添加标记
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(50, 50, 20);
  graphics.fillCircle(1550, 50, 20);
  graphics.fillCircle(50, 1150, 20);
  graphics.fillCircle(1550, 1150, 20);
  
  // 添加坐标文本标识
  const style = { fontSize: '16px', fill: '#00ff00', backgroundColor: '#000000' };
  this.add.text(60, 40, '(0, 0)', style);
  this.add.text(1460, 40, '(1600, 0)', style);
  this.add.text(60, 1140, '(0, 1200)', style);
  this.add.text(1410, 1140, '(1600, 1200)', style);
  
  // 在中心添加标识
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(800, 600, 30);
  this.add.text(740, 590, 'CENTER\n(800, 600)', {
    fontSize: '18px',
    fill: '#ff0000',
    backgroundColor: '#000000',
    align: 'center'
  });
  
  // **关键：设置相机边界**
  // 限制相机只能在 1600x1200 的场景范围内移动
  this.cameras.main.setBounds(0, 0, 1600, 1200);
  
  // 设置世界边界（与相机边界一致）
  this.physics.world.setBounds(0, 0, 1600, 1200);
  
  // 创建键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // 添加WASD控制
  this.keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 创建固定在屏幕上的UI文本（不随相机移动）
  this.cameraInfo = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.cameraInfo.setScrollFactor(0); // 固定在屏幕上
  this.cameraInfo.setDepth(1000); // 确保在最上层
  
  // 添加操作说明
  this.instructions = this.add.text(10, 60, 
    'Controls:\n' +
    '← → ↑ ↓ or WASD: Move Camera\n' +
    'Camera is bounded to 1600x1200 scene',
    {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );
  this.instructions.setScrollFactor(0);
  this.instructions.setDepth(1000);
  
  // 相机移动速度
  this.cameraSpeed = 5;
}

function update(time, delta) {
  const camera = this.cameras.main;
  
  // 使用方向键或WASD控制相机移动
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
  
  // 更新相机信息显示
  const bounds = camera.getBounds();
  this.cameraInfo.setText(
    `Camera Position: (${Math.round(camera.scrollX)}, ${Math.round(camera.scrollY)})\n` +
    `Camera View: ${Math.round(bounds.x)}, ${Math.round(bounds.y)} to ` +
    `${Math.round(bounds.right)}, ${Math.round(bounds.bottom)}\n` +
    `World Bounds: 0, 0 to 1600, 1200`
  );
}

new Phaser.Game(config);