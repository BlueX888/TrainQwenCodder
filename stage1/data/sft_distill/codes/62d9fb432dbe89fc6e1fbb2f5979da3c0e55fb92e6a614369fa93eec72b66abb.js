// 完整的 Phaser3 代码
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  zoomCount: 0,
  isZooming: false,
  lastZoomTime: 0,
  zoomCompleteCount: 0
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 绘制背景网格作为缩放参考
  const graphics = this.add.graphics();
  
  // 绘制网格
  graphics.lineStyle(1, 0x00ff00, 0.3);
  for (let x = 0; x <= 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y <= 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制中心圆形作为焦点
  graphics.fillStyle(0xff6600, 1);
  graphics.fillCircle(400, 300, 50);
  
  // 绘制四个角的矩形
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillRect(50, 50, 80, 80);
  graphics.fillRect(670, 50, 80, 80);
  graphics.fillRect(50, 470, 80, 80);
  graphics.fillRect(670, 470, 80, 80);
  
  // 添加提示文本
  const text = this.add.text(400, 50, 'Press SPACE to Zoom', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setOrigin(0.5);
  text.setScrollFactor(0); // 固定在屏幕上，不受相机影响
  
  // 添加状态文本
  this.statusText = this.add.text(400, 550, 'Zoom Count: 0 | Status: Ready', {
    fontSize: '18px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.statusText.setOrigin(0.5);
  this.statusText.setScrollFactor(0);
  
  // 获取主相机
  const camera = this.cameras.main;
  
  // 监听空格键
  const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  spaceKey.on('down', () => {
    // 如果正在缩放，忽略新的输入
    if (window.__signals__.isZooming) {
      console.log(JSON.stringify({
        event: 'zoom_ignored',
        reason: 'already_zooming',
        timestamp: Date.now()
      }));
      return;
    }
    
    // 更新状态
    window.__signals__.isZooming = true;
    window.__signals__.zoomCount++;
    window.__signals__.lastZoomTime = Date.now();
    
    // 更新状态文本
    this.statusText.setText(
      `Zoom Count: ${window.__signals__.zoomCount} | Status: Zooming...`
    );
    
    // 记录开始缩放
    console.log(JSON.stringify({
      event: 'zoom_start',
      zoomCount: window.__signals__.zoomCount,
      timestamp: window.__signals__.lastZoomTime,
      currentZoom: camera.zoom
    }));
    
    // 触发缩放效果：从当前缩放级别放大到 2 倍，持续 4 秒
    camera.zoomTo(2, 4000, 'Sine.easeInOut', false, (cam, progress) => {
      // 缩放进行中的回调
      if (progress === 1) {
        // 缩放到目标值完成，开始缩小回原始大小
        camera.zoomTo(1, 4000, 'Sine.easeInOut', false, (cam2, progress2) => {
          if (progress2 === 1) {
            // 完全完成缩放循环
            window.__signals__.isZooming = false;
            window.__signals__.zoomCompleteCount++;
            
            // 更新状态文本
            this.statusText.setText(
              `Zoom Count: ${window.__signals__.zoomCount} | Status: Ready`
            );
            
            // 记录缩放完成
            console.log(JSON.stringify({
              event: 'zoom_complete',
              zoomCount: window.__signals__.zoomCount,
              zoomCompleteCount: window.__signals__.zoomCompleteCount,
              timestamp: Date.now(),
              duration: Date.now() - window.__signals__.lastZoomTime
            }));
          }
        });
      }
    });
  });
  
  // 添加键盘提示
  this.add.text(10, 10, 'Controls:\nSPACE - Trigger Zoom (4s duration)', {
    fontSize: '14px',
    color: '#aaaaaa',
    lineSpacing: 5
  }).setScrollFactor(0);
}

function update(time, delta) {
  // 每帧更新逻辑（如果需要）
}

// 启动游戏
new Phaser.Game(config);