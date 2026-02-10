class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.zoomCount = 0; // 可验证的状态信号
    this.isZooming = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 绘制背景网格
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制垂直线
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    
    // 绘制水平线
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心标记
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);
    
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(350, 250, 100, 100);

    // 绘制四个角的标记
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillCircle(100, 100, 15);
    graphics.fillCircle(700, 100, 15);
    graphics.fillCircle(100, 500, 15);
    graphics.fillCircle(700, 500, 15);

    // 添加提示文本
    this.instructionText = this.add.text(400, 50, 'Press SPACE to Zoom', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5);
    this.instructionText.setScrollFactor(0); // 固定在屏幕上

    // 添加缩放次数显示
    this.zoomCountText = this.add.text(400, 100, `Zoom Count: ${this.zoomCount}`, {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomCountText.setOrigin(0.5);
    this.zoomCountText.setScrollFactor(0);

    // 添加状态显示
    this.statusText = this.add.text(400, 550, 'Status: Ready', {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setScrollFactor(0);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.spaceKey.on('down', () => {
      if (!this.isZooming) {
        this.triggerZoom();
      }
    });

    // 获取主相机
    this.mainCamera = this.cameras.main;
  }

  triggerZoom() {
    this.isZooming = true;
    this.zoomCount++;
    
    // 更新状态文本
    this.zoomCountText.setText(`Zoom Count: ${this.zoomCount}`);
    this.statusText.setText('Status: Zooming In...');
    this.statusText.setColor('#ff0000');

    // 缩放到2倍，持续1000毫秒
    this.mainCamera.zoomTo(2, 1000, 'Sine.easeInOut', false, (camera, progress) => {
      // 缩放进行中的回调
      if (progress === 1) {
        // 缩放完成后，缩小回原始大小
        this.statusText.setText('Status: Zooming Out...');
        this.statusText.setColor('#ffaa00');
        
        this.mainCamera.zoomTo(1, 1000, 'Sine.easeInOut', false, (camera, progress) => {
          if (progress === 1) {
            // 完全恢复后
            this.isZooming = false;
            this.statusText.setText('Status: Ready');
            this.statusText.setColor('#00ff00');
          }
        });
      }
    });
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
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

const game = new Phaser.Game(config);