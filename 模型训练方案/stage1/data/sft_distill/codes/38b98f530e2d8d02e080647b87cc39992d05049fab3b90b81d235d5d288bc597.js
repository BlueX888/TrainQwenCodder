class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.zoomCount = 0;
    this.isZooming = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      zoomCount: 0,
      isZooming: false,
      events: []
    };

    // 创建背景网格作为缩放参考
    const graphics = this.add.graphics();
    
    // 绘制网格
    graphics.lineStyle(1, 0x00ff00, 0.3);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心参考点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);

    // 绘制四个角的标记
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillCircle(100, 100, 15);
    graphics.fillCircle(700, 100, 15);
    graphics.fillCircle(100, 500, 15);
    graphics.fillCircle(700, 500, 15);

    // 添加文字提示
    const instructionText = this.add.text(400, 50, 'Right Click to Zoom', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 状态文字
    this.statusText = this.add.text(400, 550, 'Zoom Count: 0 | Status: Ready', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setScrollFactor(0); // 固定在屏幕上

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 检查是否为右键（button === 2）
      if (pointer.rightButtonDown()) {
        this.handleRightClick(pointer);
      }
    });

    // 禁用浏览器右键菜单
    this.input.mouse.disableContextMenu();

    console.log('Scene created. Right click to trigger zoom effect.');
  }

  handleRightClick(pointer) {
    // 如果正在缩放，忽略新的点击
    if (this.isZooming) {
      console.log('Zoom already in progress, ignoring click.');
      return;
    }

    this.isZooming = true;
    this.zoomCount++;

    // 更新信号
    window.__signals__.zoomCount = this.zoomCount;
    window.__signals__.isZooming = true;
    window.__signals__.events.push({
      type: 'zoom_start',
      timestamp: Date.now(),
      zoomCount: this.zoomCount,
      pointerX: pointer.x,
      pointerY: pointer.y,
      currentZoom: this.mainCamera.zoom
    });

    // 更新状态文字
    this.updateStatusText();

    console.log(JSON.stringify({
      event: 'zoom_triggered',
      zoomCount: this.zoomCount,
      pointerPosition: { x: pointer.x, y: pointer.y },
      timestamp: Date.now()
    }));

    // 执行缩放到 1.5 倍，持续 1000ms
    this.mainCamera.zoomTo(1.5, 1000, 'Sine.easeInOut', false, (camera, progress) => {
      // 缩放进行中的回调
      if (progress === 1) {
        // 缩放到目标值完成，开始恢复
        console.log(JSON.stringify({
          event: 'zoom_peak_reached',
          zoomCount: this.zoomCount,
          zoom: camera.zoom,
          timestamp: Date.now()
        }));

        // 记录峰值事件
        window.__signals__.events.push({
          type: 'zoom_peak',
          timestamp: Date.now(),
          zoomCount: this.zoomCount,
          zoom: camera.zoom
        });

        // 恢复到原始缩放值 1.0，持续 1000ms
        this.mainCamera.zoomTo(1.0, 1000, 'Sine.easeInOut', false, (camera, progress) => {
          if (progress === 1) {
            // 完全恢复完成
            this.isZooming = false;
            window.__signals__.isZooming = false;

            window.__signals__.events.push({
              type: 'zoom_complete',
              timestamp: Date.now(),
              zoomCount: this.zoomCount,
              finalZoom: camera.zoom
            });

            this.updateStatusText();

            console.log(JSON.stringify({
              event: 'zoom_complete',
              zoomCount: this.zoomCount,
              finalZoom: camera.zoom,
              timestamp: Date.now()
            }));
          }
        });
      }
    });
  }

  updateStatusText() {
    const status = this.isZooming ? 'Zooming...' : 'Ready';
    this.statusText.setText(`Zoom Count: ${this.zoomCount} | Status: ${status}`);
  }

  update(time, delta) {
    // 实时更新相机缩放值显示（可选）
    if (this.isZooming) {
      const currentZoom = this.mainCamera.zoom.toFixed(2);
      this.statusText.setText(`Zoom Count: ${this.zoomCount} | Status: Zooming (${currentZoom}x)`);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);