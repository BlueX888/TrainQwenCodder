const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量：记录旋转触发次数
let rotationCount = 0;
let statusText;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const camera = this.cameras.main;
  
  // 绘制参考网格和中心点，便于观察旋转效果
  const graphics = this.add.graphics();
  
  // 绘制背景网格
  graphics.lineStyle(1, 0x444444, 0.5);
  for (let x = 0; x <= 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y <= 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制中心十字标记
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.lineBetween(400, 280, 400, 320);
  graphics.lineBetween(380, 300, 420, 300);
  
  // 绘制一些彩色方块作为参考物体
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i;
    const x = 400 + Math.cos(angle) * 200;
    const y = 300 + Math.sin(angle) * 200;
    
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(x - 25, y - 25, 50, 50);
  }
  
  // 绘制一个中心圆形
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(400, 300, 30);
  
  // 创建状态文本
  statusText = this.add.text(10, 10, 'Rotation Count: 0\nClick to rotate camera (4s)', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
  statusText.setScrollFactor(0); // 固定在屏幕上，不随相机移动
  
  // 创建提示文本
  const hintText = this.add.text(400, 500, 'Click anywhere to trigger camera rotation', {
    fontSize: '18px',
    color: '#ffff00'
  });
  hintText.setOrigin(0.5);
  hintText.setScrollFactor(0);
  
  // 监听鼠标左键按下事件
  this.input.on('pointerdown', (pointer) => {
    // 检查是否为左键
    if (pointer.leftButtonDown()) {
      // 增加旋转计数
      rotationCount++;
      
      // 触发相机旋转效果
      // rotateTo(radians, clockwise, duration, ease, force)
      // 旋转 360 度（2*PI），顺时针，持续 4000 毫秒
      camera.rotateTo(Math.PI * 2, true, 4000, 'Sine.easeInOut', true);
      
      // 更新状态文本
      statusText.setText(`Rotation Count: ${rotationCount}\nRotating... (4s)`);
      
      // 4 秒后更新文本提示
      this.time.delayedCall(4000, () => {
        statusText.setText(`Rotation Count: ${rotationCount}\nClick to rotate camera (4s)`);
      });
      
      console.log(`Camera rotation triggered! Count: ${rotationCount}`);
    }
  });
  
  // 添加键盘提示
  const keyText = this.add.text(400, 550, 'Press SPACE for instant rotation reset', {
    fontSize: '14px',
    color: '#aaaaaa'
  });
  keyText.setOrigin(0.5);
  keyText.setScrollFactor(0);
  
  // 添加空格键快速重置旋转（额外功能）
  this.input.keyboard.on('keydown-SPACE', () => {
    camera.setRotation(0);
    console.log('Camera rotation reset');
  });
}

function update(time, delta) {
  // 可以在这里添加其他更新逻辑
  // 当前示例不需要每帧更新
}

new Phaser.Game(config);