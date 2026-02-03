const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号对象，用于验证
window.__signals__ = {
  zoomCount: 0,
  isZooming: false,
  currentZoom: 1,
  lastZoomTime: 0,
  logs: []
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  const camera = this.cameras.main;
  
  // 绘制网格背景作为缩放参考
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制网格
  for (let x = 0; x <= 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y <= 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制中心标记
  graphics.lineStyle(2, 0xff0000, 1);
  graphics.strokeCircle(400, 300, 50);
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(400, 300, 10);
  
  // 绘制四个角的标记方块
  const cornerSize = 30;
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillRect(10, 10, cornerSize, cornerSize);
  graphics.fillRect(760, 10, cornerSize, cornerSize);
  graphics.fillRect(10, 560, cornerSize, cornerSize);
  graphics.fillRect(760, 560, cornerSize, cornerSize);
  
  // 添加文本提示
  const instructionText = this.add.text(400, 50, 'Press SPACE to zoom', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructionText.setOrigin(0.5);
  instructionText.setScrollFactor(0); // 固定在屏幕上
  
  // 状态显示文本
  const statusText = this.add.text(10, 100, '', {
    fontSize: '16px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  });
  statusText.setScrollFactor(0);
  scene.statusText = statusText;
  
  // 监听空格键
  const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  spaceKey.on('down', () => {
    // 如果正在缩放中，忽略
    if (window.__signals__.isZooming) {
      console.log('Zoom already in progress, ignoring...');
      return;
    }
    
    // 更新信号
    window.__signals__.zoomCount++;
    window.__signals__.isZooming = true;
    window.__signals__.lastZoomTime = Date.now();
    
    const logEntry = {
      event: 'zoom_started',
      timestamp: Date.now(),
      zoomCount: window.__signals__.zoomCount,
      initialZoom: camera.zoom
    };
    window.__signals__.logs.push(logEntry);
    console.log(JSON.stringify(logEntry));
    
    // 触发缩放效果：放大到 2 倍，持续 4 秒
    camera.zoomTo(2, 4000, 'Linear', false, (cam, progress) => {
      // 缩放进行中的回调
      window.__signals__.currentZoom = cam.zoom;
      
      // 当缩放完成时
      if (progress === 1) {
        // 缩放完成后，再缩回原始大小
        setTimeout(() => {
          camera.zoomTo(1, 4000, 'Linear', false, (cam2, progress2) => {
            window.__signals__.currentZoom = cam2.zoom;
            
            if (progress2 === 1) {
              window.__signals__.isZooming = false;
              
              const logEntry2 = {
                event: 'zoom_completed',
                timestamp: Date.now(),
                zoomCount: window.__signals__.zoomCount,
                finalZoom: cam2.zoom,
                duration: Date.now() - window.__signals__.lastZoomTime
              };
              window.__signals__.logs.push(logEntry2);
              console.log(JSON.stringify(logEntry2));
            }
          });
        }, 100);
      }
    });
  });
  
  // 添加说明文字
  const helpText = this.add.text(10, 10, 
    'SPACE: Trigger zoom effect (4s zoom in + 4s zoom out)', {
    fontSize: '14px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  });
  helpText.setScrollFactor(0);
}

function update(time, delta) {
  const camera = this.cameras.main;
  
  // 更新当前缩放值
  window.__signals__.currentZoom = camera.zoom;
  
  // 更新状态显示
  if (this.statusText) {
    const status = [
      `Zoom Count: ${window.__signals__.zoomCount}`,
      `Current Zoom: ${camera.zoom.toFixed(3)}`,
      `Is Zooming: ${window.__signals__.isZooming ? 'YES' : 'NO'}`,
      `Zoom Effect Active: ${camera.zoomEffect.isRunning ? 'YES' : 'NO'}`
    ].join('\n');
    
    this.statusText.setText(status);
  }
}

new Phaser.Game(config);