const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let currentZoom = 1.0;
let targetZoom = 1.0;
let zoomText;
let camera;
let isZoomedIn = false;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 获取主相机
  camera = this.cameras.main;
  
  // 创建网格背景作为参照
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  const gridSize = 50;
  for (let x = 0; x <= 1600; x += gridSize) {
    graphics.lineBetween(x, 0, x, 1200);
  }
  for (let y = 0; y <= 1200; y += gridSize) {
    graphics.lineBetween(0, y, 1600, y);
  }
  
  // 创建多个彩色方块作为参照物
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  for (let i = 0; i < 20; i++) {
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    const size = Phaser.Math.Between(30, 80);
    const color = Phaser.Utils.Array.GetRandom(colors);
    
    const rect = this.add.graphics();
    rect.fillStyle(color, 1);
    rect.fillRect(x, y, size, size);
    
    // 添加边框
    rect.lineStyle(2, 0xffffff, 1);
    rect.strokeRect(x, y, size, size);
  }
  
  // 创建中心标记
  const centerGraphics = this.add.graphics();
  centerGraphics.lineStyle(3, 0xffffff, 1);
  centerGraphics.strokeCircle(400, 300, 20);
  centerGraphics.lineBetween(400, 280, 400, 320);
  centerGraphics.lineBetween(380, 300, 420, 300);
  
  // 创建UI文本显示缩放信息
  zoomText = this.add.text(10, 10, '', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  zoomText.setScrollFactor(0); // 固定在屏幕上
  zoomText.setDepth(1000);
  
  // 创建说明文本
  const instructionText = this.add.text(10, 50, '右键点击：切换缩放\n范围：0.5x - 2.0x', {
    fontSize: '16px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructionText.setScrollFactor(0);
  instructionText.setDepth(1000);
  
  // 监听鼠标右键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      // 切换缩放状态
      isZoomedIn = !isZoomedIn;
      
      if (isZoomedIn) {
        // 放大到2倍
        targetZoom = 2.0;
      } else {
        // 缩小到0.5倍
        targetZoom = 0.5;
      }
      
      // 每次点击在0.5和2.0之间循环
      if (currentZoom >= 2.0) {
        targetZoom = 0.5;
      } else if (currentZoom <= 0.5) {
        targetZoom = 2.0;
      }
    }
  });
  
  // 禁用右键菜单
  this.input.mouse.disableContextMenu();
  
  // 添加鼠标滚轮支持（可选）
  this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
    if (deltaY > 0) {
      // 向下滚动，缩小
      targetZoom = Math.max(0.5, targetZoom - 0.1);
    } else {
      // 向上滚动，放大
      targetZoom = Math.min(2.0, targetZoom + 0.1);
    }
  });
  
  // 更新初始文本
  updateZoomText();
}

function update(time, delta) {
  // 平滑过渡缩放
  if (Math.abs(currentZoom - targetZoom) > 0.01) {
    // 使用线性插值实现平滑过渡
    const lerpSpeed = 0.05;
    currentZoom = Phaser.Math.Linear(currentZoom, targetZoom, lerpSpeed);
    
    // 限制缩放范围
    currentZoom = Phaser.Math.Clamp(currentZoom, 0.5, 2.0);
    
    // 应用缩放到相机
    camera.setZoom(currentZoom);
    
    // 更新文本
    updateZoomText();
  }
}

function updateZoomText() {
  const zoomPercent = Math.round(currentZoom * 100);
  const status = currentZoom < 1 ? '缩小' : currentZoom > 1 ? '放大' : '正常';
  zoomText.setText(`缩放: ${currentZoom.toFixed(2)}x (${zoomPercent}%)\n状态: ${status}`);
}

new Phaser.Game(config);