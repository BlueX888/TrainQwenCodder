const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

// 初始化信号对象
window.__signals__ = {
  shakeCount: 0,
  isShaking: false,
  lastShakeTime: 0,
  logs: []
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建背景网格，便于观察弹跳效果
  const graphics = this.add.graphics();
  
  // 绘制网格线
  graphics.lineStyle(1, 0x444444, 0.5);
  for (let x = 0; x <= 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y <= 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制中心参考点
  graphics.fillStyle(0xff6600, 1);
  graphics.fillCircle(400, 300, 20);
  
  // 绘制四个角的标记
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(50, 50, 15);
  graphics.fillCircle(750, 50, 15);
  graphics.fillCircle(50, 550, 15);
  graphics.fillCircle(750, 550, 15);
  
  // 添加提示文本
  const text = this.add.text(400, 50, 'Click Left Mouse Button to Shake Camera', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setOrigin(0.5, 0);
  
  // 状态文本
  const statusText = this.add.text(400, 550, 'Shake Count: 0', {
    fontSize: '20px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setOrigin(0.5, 1);
  statusText.setScrollFactor(0); // 固定在屏幕上，不受相机影响
  
  // 获取主相机
  const camera = this.cameras.main;
  
  // 监听鼠标按下事件
  this.input.on('pointerdown', (pointer) => {
    // 检查是否为鼠标左键（button 0）
    if (pointer.leftButtonDown()) {
      // 触发相机弹跳效果
      // shake(duration, intensity, force, callback, context)
      // duration: 1500ms (1.5秒)
      // intensity: 0.01 (弹跳强度)
      camera.shake(1500, 0.01);
      
      // 更新信号状态
      window.__signals__.shakeCount++;
      window.__signals__.isShaking = true;
      window.__signals__.lastShakeTime = Date.now();
      
      const logEntry = {
        timestamp: Date.now(),
        shakeCount: window.__signals__.shakeCount,
        position: { x: pointer.x, y: pointer.y }
      };
      window.__signals__.logs.push(logEntry);
      
      // 更新状态文本
      statusText.setText(`Shake Count: ${window.__signals__.shakeCount}`);
      
      // 输出日志
      console.log(JSON.stringify(logEntry));
      
      // 监听弹跳完成事件
      camera.once('camerashakecomplete', () => {
        window.__signals__.isShaking = false;
        console.log(JSON.stringify({
          timestamp: Date.now(),
          event: 'shake_complete',
          shakeCount: window.__signals__.shakeCount
        }));
      });
    }
  });
  
  // 添加键盘快捷键（可选）
  this.input.keyboard.on('keydown-SPACE', () => {
    camera.shake(1500, 0.01);
    window.__signals__.shakeCount++;
    window.__signals__.isShaking = true;
    statusText.setText(`Shake Count: ${window.__signals__.shakeCount} (Space)`);
    
    console.log(JSON.stringify({
      timestamp: Date.now(),
      shakeCount: window.__signals__.shakeCount,
      trigger: 'keyboard'
    }));
  });
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 例如检查弹跳状态等
}

new Phaser.Game(config);