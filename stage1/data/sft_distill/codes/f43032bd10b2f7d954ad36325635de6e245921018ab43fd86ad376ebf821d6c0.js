// 完整的 Phaser3 代码 - 空格键触发相机抖动
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 初始化验证信号
window.__signals__ = {
  shakeCount: 0,
  lastShakeTime: 0,
  isShaking: false
};

function preload() {
  // 无需加载外部资源
}

function create() {
  // 绘制背景网格作为参考（便于观察抖动效果）
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制中心参考物体
  const centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0x00ff00, 1);
  centerGraphics.fillCircle(400, 300, 30);
  
  // 绘制四个角的标记点
  const cornerGraphics = this.add.graphics();
  cornerGraphics.fillStyle(0xff0000, 1);
  cornerGraphics.fillCircle(50, 50, 10);
  cornerGraphics.fillCircle(750, 50, 10);
  cornerGraphics.fillCircle(50, 550, 10);
  cornerGraphics.fillCircle(750, 550, 10);
  
  // 添加提示文本
  const instructionText = this.add.text(400, 100, 'Press SPACE to shake camera', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructionText.setOrigin(0.5);
  
  // 添加状态显示文本
  this.statusText = this.add.text(400, 500, 'Shake Count: 0', {
    fontSize: '20px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.statusText.setOrigin(0.5);
  
  // 获取主相机
  const camera = this.cameras.main;
  
  // 监听空格键
  this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 空格键按下事件
  this.spaceKey.on('down', () => {
    // 触发相机抖动效果
    // 参数: duration(ms), intensity(抖动强度), force(是否强制重新开始), callback, context
    camera.shake(1500, 0.01);
    
    // 更新验证信号
    window.__signals__.shakeCount++;
    window.__signals__.lastShakeTime = Date.now();
    window.__signals__.isShaking = true;
    
    // 更新状态文本
    this.statusText.setText(`Shake Count: ${window.__signals__.shakeCount}`);
    
    // 控制台输出验证信息
    console.log(JSON.stringify({
      event: 'camera_shake_triggered',
      shakeCount: window.__signals__.shakeCount,
      duration: 1500,
      timestamp: window.__signals__.lastShakeTime
    }));
  });
  
  // 监听相机抖动完成事件
  camera.on('camerashakecomplete', () => {
    window.__signals__.isShaking = false;
    console.log(JSON.stringify({
      event: 'camera_shake_complete',
      shakeCount: window.__signals__.shakeCount,
      timestamp: Date.now()
    }));
  });
  
  // 添加说明文本
  const helpText = this.add.text(10, 10, 
    'Watch the grid lines and corner markers\nto see the shake effect clearly', {
    fontSize: '14px',
    color: '#aaaaaa',
    backgroundColor: '#000000',
    padding: { x: 5, y: 3 }
  });
}

function update(time, delta) {
  // 可选：显示实时抖动状态
  if (window.__signals__.isShaking) {
    // 抖动进行中的逻辑（如果需要）
  }
}

// 启动游戏
new Phaser.Game(config);