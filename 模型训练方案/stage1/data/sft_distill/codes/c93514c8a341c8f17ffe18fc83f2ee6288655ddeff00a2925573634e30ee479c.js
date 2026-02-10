class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.zoomCount = 0; // 状态信号：记录缩放触发次数
    this.isZooming = false; // 防止重复触发
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 绘制背景网格
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x00ff00, 0.3);
    
    // 绘制垂直线
    for (let x = 0; x <= width; x += 50) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    // 绘制水平线
    for (let y = 0; y <= height; y += 50) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制中心标记
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 20);
    
    centerGraphics.fillStyle(0xffffff, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 10);

    // 绘制四个角落的参考方块
    const cornerGraphics = this.add.graphics();
    cornerGraphics.fillStyle(0x0000ff, 1);
    cornerGraphics.fillRect(50, 50, 40, 40);
    cornerGraphics.fillRect(width - 90, 50, 40, 40);
    cornerGraphics.fillRect(50, height - 90, 40, 40);
    cornerGraphics.fillRect(width - 90, height - 90, 40, 40);

    // 添加状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0); // 固定在屏幕上，不受相机影响

    // 添加提示文本
    this.instructionText = this.add.text(width / 2, height - 50, 'Press SPACE to zoom camera', {
      fontSize: '24px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5);
    this.instructionText.setScrollFactor(0);

    // 更新状态显示
    this.updateStatus();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.spaceKey.on('down', () => {
      this.triggerZoom();
    });

    // 获取主相机
    this.mainCamera = this.cameras.main;
  }

  triggerZoom() {
    // 如果正在缩放中，忽略新的触发
    if (this.isZooming) {
      return;
    }

    this.isZooming = true;
    this.zoomCount++;
    this.updateStatus();

    // 缩放到 1.5 倍，持续 1000 毫秒
    this.mainCamera.zoomTo(1.5, 1000, 'Linear', false, (camera, progress) => {
      // 缩放完成回调
      if (progress === 1) {
        // 缩放完成后，再缩放回原始大小
        this.mainCamera.zoomTo(1.0, 1000, 'Linear', false, (cam, prog) => {
          if (prog === 1) {
            this.isZooming = false;
            this.updateStatus();
          }
        });
      }
    });
  }

  updateStatus() {
    const status = this.isZooming ? 'ZOOMING' : 'READY';
    this.statusText.setText([
      `Zoom Count: ${this.zoomCount}`,
      `Status: ${status}`,
      `Current Zoom: ${this.mainCamera.zoom.toFixed(2)}`
    ]);
  }

  update(time, delta) {
    // 实时更新当前缩放值
    if (this.isZooming) {
      this.updateStatus();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);