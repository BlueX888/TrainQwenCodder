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

// 状态变量
let currentZoomLevel = 1.0;
const zoomLevels = [0.5, 1.0, 1.5, 2.0];
let currentZoomIndex = 1; // 从1.0开始
let statusText;
let camera;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 获取主相机
  camera = this.cameras.main;
  
  // 创建网格背景用于观察缩放效果
  const graphics = this.add.graphics();
  
  // 绘制网格
  graphics.lineStyle(1, 0x444444, 1);
  const gridSize = 50;
  const gridWidth = 1600;
  const gridHeight = 1200;
  
  for (let x = 0; x <= gridWidth; x += gridSize) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, gridHeight);
  }
  
  for (let y = 0; y <= gridHeight; y += gridSize) {
    graphics.moveTo(0, y);
    graphics.lineTo(gridWidth, y);
  }
  
  graphics.strokePath();
  
  // 在中心绘制一个参考圆形
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillCircle(400, 300, 50);
  
  // 绘制一些矩形作为参考对象
  const colors = [0x4ecdc4, 0xffe66d, 0xa8e6cf, 0xff8b94];
  for (let i = 0; i < 4; i++) {
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(
      200 + i * 150,
      150,
      100,
      100
    );
  }
  
  // 绘制一些小圆圈作为参考点
  graphics.fillStyle(0xffffff, 1);
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 / 8) * i;
    const x = 400 + Math.cos(angle) * 200;
    const y = 300 + Math.sin(angle) * 200;
    graphics.fillCircle(x, y, 15);
  }
  
  // 创建状态文本（固定在屏幕上）
  statusText = this.add.text(16, 16, '', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setScrollFactor(0); // 固定在相机上，不随相机移动
  statusText.setDepth(1000); // 确保在最上层
  
  // 添加说明文本
  const instructionText = this.add.text(16, 60, 'Right Click: Zoom In/Out', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 }
  });
  instructionText.setScrollFactor(0);
  instructionText.setDepth(1000);
  
  // 监听鼠标右键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      // 切换到下一个缩放级别
      currentZoomIndex = (currentZoomIndex + 1) % zoomLevels.length;
      currentZoomLevel = zoomLevels[currentZoomIndex];
      
      // 应用缩放
      camera.setZoom(currentZoomLevel);
      
      // 更新状态文本
      updateStatusText();
      
      // 添加视觉反馈
      this.cameras.main.flash(100, 255, 255, 255, false, 0.3);
    }
  });
  
  // 禁用右键菜单
  this.input.mouse.disableContextMenu();
  
  // 初始化状态文本
  updateStatusText();
}

function update(time, delta) {
  // 可以在这里添加其他更新逻辑
}

function updateStatusText() {
  const zoomPercentage = (currentZoomLevel * 100).toFixed(0);
  statusText.setText([
    `Zoom Level: ${currentZoomLevel.toFixed(1)}x (${zoomPercentage}%)`,
    `Index: ${currentZoomIndex + 1}/${zoomLevels.length}`
  ]);
}

// 启动游戏
new Phaser.Game(config);