class ZoomScene extends Phaser.Scene {
  constructor() {
    super('ZoomScene');
    // 可验证的状态信号
    this.currentZoom = 1.0;
    this.zoomLevels = [0.5, 1.0, 1.5, 2.0];
    this.zoomIndex = 1; // 初始为 1.0 倍
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 获取主相机
    this.mainCamera = this.cameras.main;
    this.mainCamera.setZoom(this.currentZoom);

    // 绘制网格背景，便于观察缩放效果
    this.drawGrid();

    // 创建一些参考物体
    this.createReferenceObjects();

    // 创建状态显示文本（固定在屏幕上，不受相机缩放影响）
    this.createStatusText();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加按键按下事件
    this.spaceKey.on('down', () => {
      this.toggleZoom();
    });

    // 创建提示文本
    this.createInstructionText();
  }

  drawGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    // 绘制垂直线
    for (let x = 0; x <= 800; x += 50) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 600);
    }

    // 绘制水平线
    for (let y = 0; y <= 600; y += 50) {
      graphics.moveTo(0, y);
      graphics.lineTo(800, y);
    }

    graphics.strokePath();

    // 绘制中心十字线（更粗）
    graphics.lineStyle(2, 0x666666, 1);
    graphics.moveTo(400, 0);
    graphics.lineTo(400, 600);
    graphics.moveTo(0, 300);
    graphics.lineTo(800, 300);
    graphics.strokePath();
  }

  createReferenceObjects() {
    // 创建中心圆形
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0xff0000, 1);
    centerCircle.fillCircle(400, 300, 30);
    centerCircle.lineStyle(3, 0xffffff, 1);
    centerCircle.strokeCircle(400, 300, 30);

    // 创建四角的矩形
    const corners = [
      { x: 100, y: 100, color: 0x00ff00 },
      { x: 700, y: 100, color: 0x0000ff },
      { x: 100, y: 500, color: 0xffff00 },
      { x: 700, y: 500, color: 0xff00ff }
    ];

    corners.forEach(corner => {
      const rect = this.add.graphics();
      rect.fillStyle(corner.color, 1);
      rect.fillRect(corner.x - 25, corner.y - 25, 50, 50);
      rect.lineStyle(2, 0xffffff, 1);
      rect.strokeRect(corner.x - 25, corner.y - 25, 50, 50);
    });

    // 添加一些随机分布的小圆点
    for (let i = 0; i < 20; i++) {
      const dot = this.add.graphics();
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      dot.fillStyle(0xffffff, 0.6);
      dot.fillCircle(x, y, 5);
    }
  }

  createStatusText() {
    // 创建固定在屏幕上的状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0); // 固定在屏幕上，不随相机移动
    this.statusText.setDepth(1000); // 确保在最上层
    this.updateStatusText();
  }

  createInstructionText() {
    const instruction = this.add.text(10, 50, 'Press SPACE to toggle zoom', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instruction.setScrollFactor(0);
    instruction.setDepth(1000);
  }

  toggleZoom() {
    // 切换到下一个缩放级别
    this.zoomIndex = (this.zoomIndex + 1) % this.zoomLevels.length;
    this.currentZoom = this.zoomLevels[this.zoomIndex];

    // 应用缩放（使用动画过渡效果）
    this.mainCamera.zoomTo(this.currentZoom, 300); // 300ms 过渡时间

    // 更新状态文本
    this.updateStatusText();

    // 输出日志便于验证
    console.log(`Camera zoom changed to: ${this.currentZoom}x`);
  }

  updateStatusText() {
    this.statusText.setText(`Zoom Level: ${this.currentZoom.toFixed(1)}x`);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 例如：实时显示相机的实际缩放值（在动画过渡期间）
    const actualZoom = this.mainCamera.zoom.toFixed(2);
    if (Math.abs(actualZoom - this.currentZoom) > 0.01) {
      this.statusText.setText(`Zoom Level: ${this.currentZoom.toFixed(1)}x (transitioning: ${actualZoom}x)`);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: ZoomScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);