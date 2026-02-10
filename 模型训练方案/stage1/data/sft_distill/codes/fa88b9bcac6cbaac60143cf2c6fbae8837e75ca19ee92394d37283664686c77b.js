class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentZoom = 1.0;
    this.zoomLevel = 1.0; // 状态信号：当前缩放级别
    this.isZooming = false; // 状态信号：是否正在缩放
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景网格，方便观察缩放效果
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制网格
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 创建一些参考物体
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(400, 300, 30);
    
    const cornerGraphics1 = this.add.graphics();
    cornerGraphics1.fillStyle(0x00ff00, 1);
    cornerGraphics1.fillRect(50, 50, 60, 60);
    
    const cornerGraphics2 = this.add.graphics();
    cornerGraphics2.fillStyle(0x0000ff, 1);
    cornerGraphics2.fillRect(690, 50, 60, 60);
    
    const cornerGraphics3 = this.add.graphics();
    cornerGraphics3.fillStyle(0xffff00, 1);
    cornerGraphics3.fillRect(50, 490, 60, 60);
    
    const cornerGraphics4 = this.add.graphics();
    cornerGraphics4.fillStyle(0xff00ff, 1);
    cornerGraphics4.fillRect(690, 490, 60, 60);

    // 设置键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 创建提示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.infoText.setScrollFactor(0); // 固定在屏幕上
    this.infoText.setDepth(100);

    // 创建状态文本
    this.statusText = this.add.text(10, 50, '', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(100);

    this.updateInfoText();
  }

  update(time, delta) {
    // 检测W键 - 放大到2倍
    if (Phaser.Input.Keyboard.JustDown(this.keyW)) {
      this.triggerZoom(2.0, 'W - Zoom In (2x)');
    }
    
    // 检测S键 - 缩小到0.5倍
    if (Phaser.Input.Keyboard.JustDown(this.keyS)) {
      this.triggerZoom(0.5, 'S - Zoom Out (0.5x)');
    }
    
    // 检测A键 - 恢复到1倍
    if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
      this.triggerZoom(1.0, 'A - Reset Zoom (1x)');
    }
    
    // 检测D键 - 放大到1.5倍
    if (Phaser.Input.Keyboard.JustDown(this.keyD)) {
      this.triggerZoom(1.5, 'D - Zoom Medium (1.5x)');
    }

    // 更新当前缩放级别
    this.zoomLevel = this.cameras.main.zoom;
    this.updateInfoText();
  }

  triggerZoom(targetZoom, actionText) {
    this.isZooming = true;
    
    // 使用zoomTo方法实现3秒缩放动画
    this.cameras.main.zoomTo(targetZoom, 3000, 'Sine.easeInOut', false, (camera, progress) => {
      // 缩放完成回调
      if (progress === 1) {
        this.isZooming = false;
        this.currentZoom = targetZoom;
      }
    });

    // 更新状态显示
    this.statusText.setText(`Action: ${actionText}\nZooming: Yes\nProgress: 0%`);
    
    // 创建进度更新定时器
    if (this.zoomTimer) {
      this.zoomTimer.remove();
    }
    
    let elapsed = 0;
    this.zoomTimer = this.time.addEvent({
      delay: 100,
      callback: () => {
        elapsed += 100;
        const progress = Math.min((elapsed / 3000) * 100, 100);
        this.statusText.setText(
          `Action: ${actionText}\n` +
          `Zooming: ${this.isZooming ? 'Yes' : 'No'}\n` +
          `Progress: ${progress.toFixed(0)}%`
        );
        
        if (progress >= 100) {
          this.zoomTimer.remove();
        }
      },
      loop: true
    });
  }

  updateInfoText() {
    this.infoText.setText(
      `Press WASD to trigger camera zoom (3 seconds):\n` +
      `W: Zoom In (2x) | S: Zoom Out (0.5x)\n` +
      `A: Reset (1x) | D: Medium (1.5x)\n` +
      `Current Zoom: ${this.zoomLevel.toFixed(2)}x`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

new Phaser.Game(config);