class CameraZoomScene extends Phaser.Scene {
  constructor() {
    super('CameraZoomScene');
    this.zoomLevels = [0.5, 1.0, 2.0];
    this.currentZoomIndex = 1; // 默认从 1.0 开始
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      zoomLevel: 1.0,
      clickCount: 0,
      zoomHistory: []
    };

    // 绘制网格背景
    this.createGrid();

    // 创建一些参考对象
    this.createReferenceObjects();

    // 创建缩放提示文本
    this.zoomText = this.add.text(16, 16, 'Zoom: 1.0x (Click to change)', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomText.setScrollFactor(0); // 固定在屏幕上

    // 创建说明文本
    this.instructionText = this.add.text(16, 560, 'Left Click: Cycle zoom (0.5x → 1.0x → 2.0x)', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setScrollFactor(0);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.cycleZoom();
      }
    });

    // 获取主相机
    this.mainCamera = this.cameras.main;

    console.log('Game initialized. Click to zoom!');
  }

  createGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x444444, 0.8);

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

    // 添加坐标标注
    for (let x = 0; x <= 800; x += 100) {
      for (let y = 0; y <= 600; y += 100) {
        this.add.text(x + 5, y + 5, `${x},${y}`, {
          fontSize: '12px',
          fill: '#888888'
        });
      }
    }
  }

  createReferenceObjects() {
    // 创建中心圆形
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0xff0000, 1);
    centerCircle.fillCircle(400, 300, 50);
    centerCircle.lineStyle(3, 0xffffff, 1);
    centerCircle.strokeCircle(400, 300, 50);

    // 添加中心标签
    this.add.text(400, 300, 'CENTER', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 创建四角矩形
    const corners = [
      { x: 100, y: 100, color: 0x00ff00 },
      { x: 700, y: 100, color: 0x0000ff },
      { x: 100, y: 500, color: 0xffff00 },
      { x: 700, y: 500, color: 0xff00ff }
    ];

    corners.forEach((corner, index) => {
      const rect = this.add.graphics();
      rect.fillStyle(corner.color, 1);
      rect.fillRect(corner.x - 30, corner.y - 30, 60, 60);
      rect.lineStyle(2, 0xffffff, 1);
      rect.strokeRect(corner.x - 30, corner.y - 30, 60, 60);

      this.add.text(corner.x, corner.y, `#${index + 1}`, {
        fontSize: '20px',
        fill: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    });

    // 创建一些随机装饰圆
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(150, 650);
      const y = Phaser.Math.Between(150, 450);
      const radius = Phaser.Math.Between(10, 25);
      const color = Phaser.Display.Color.RandomRGB();

      const circle = this.add.graphics();
      circle.fillStyle(color.color, 0.6);
      circle.fillCircle(x, y, radius);
    }
  }

  cycleZoom() {
    // 循环切换缩放级别
    this.currentZoomIndex = (this.currentZoomIndex + 1) % this.zoomLevels.length;
    const newZoom = this.zoomLevels[this.currentZoomIndex];

    // 应用缩放
    this.mainCamera.setZoom(newZoom);

    // 更新文本提示
    this.zoomText.setText(`Zoom: ${newZoom.toFixed(1)}x (Click to change)`);

    // 更新信号
    window.__signals__.zoomLevel = newZoom;
    window.__signals__.clickCount++;
    window.__signals__.zoomHistory.push({
      timestamp: Date.now(),
      zoom: newZoom,
      index: this.currentZoomIndex
    });

    // 输出日志
    console.log(JSON.stringify({
      action: 'zoom_changed',
      zoomLevel: newZoom,
      clickCount: window.__signals__.clickCount,
      timestamp: Date.now()
    }));

    // 添加视觉反馈
    this.cameras.main.flash(200, 255, 255, 255, false, 0.3);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: CameraZoomScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证信号（便于测试）
console.log('Camera Zoom Demo Started');
console.log('Available signals: window.__signals__');