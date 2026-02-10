// 完整的 Phaser3 相机缩放示例
class CameraZoomScene extends Phaser.Scene {
  constructor() {
    super('CameraZoomScene');
    this.zoomLevels = [0.5, 1.0, 1.5, 2.0];
    this.currentZoomIndex = 1; // 默认从 1.0 开始
    this.clickCount = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      currentZoom: 1.0,
      clickCount: 0,
      zoomRange: { min: 0.5, max: 2.0 },
      zoomLevels: this.zoomLevels
    };

    // 绘制网格背景（用于观察缩放效果）
    this.createGrid();

    // 创建一些参考对象
    this.createReferenceObjects();

    // 显示提示文本（固定在相机上）
    this.instructionText = this.add.text(10, 10, 'Click Left Mouse Button to Zoom', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setScrollFactor(0); // 固定在相机上

    // 显示当前缩放值
    this.zoomText = this.add.text(10, 50, '', {
      fontSize: '24px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomText.setScrollFactor(0);

    // 显示点击次数
    this.clickText = this.add.text(10, 90, '', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.clickText.setScrollFactor(0);

    // 更新显示
    this.updateDisplay();

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.handleZoomToggle();
      }
    });

    // 输出初始状态日志
    console.log('[CAMERA_ZOOM_INIT]', JSON.stringify(window.__signals__));
  }

  createGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.8);

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

    // 绘制中心十字标记
    graphics.lineStyle(2, 0xff0000, 1);
    graphics.moveTo(400, 250);
    graphics.lineTo(400, 350);
    graphics.moveTo(350, 300);
    graphics.lineTo(450, 300);
    graphics.strokePath();
  }

  createReferenceObjects() {
    const graphics = this.add.graphics();

    // 绘制四个角的参考方块
    const positions = [
      { x: 100, y: 100, color: 0xff0000 },
      { x: 700, y: 100, color: 0x00ff00 },
      { x: 100, y: 500, color: 0x0000ff },
      { x: 700, y: 500, color: 0xffff00 }
    ];

    positions.forEach(pos => {
      graphics.fillStyle(pos.color, 1);
      graphics.fillRect(pos.x - 25, pos.y - 25, 50, 50);
    });

    // 绘制中心圆形
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillCircle(400, 300, 40);

    // 添加文本标签
    positions.forEach((pos, index) => {
      const label = this.add.text(pos.x, pos.y, `Corner ${index + 1}`, {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000'
      });
      label.setOrigin(0.5);
    });

    const centerLabel = this.add.text(400, 300, 'CENTER', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      fontStyle: 'bold'
    });
    centerLabel.setOrigin(0.5);
  }

  handleZoomToggle() {
    // 切换到下一个缩放级别
    this.currentZoomIndex = (this.currentZoomIndex + 1) % this.zoomLevels.length;
    const newZoom = this.zoomLevels[this.currentZoomIndex];
    
    // 增加点击次数
    this.clickCount++;

    // 设置相机缩放
    this.cameras.main.setZoom(newZoom);

    // 更新信号
    window.__signals__.currentZoom = newZoom;
    window.__signals__.clickCount = this.clickCount;

    // 更新显示
    this.updateDisplay();

    // 输出状态日志
    console.log('[CAMERA_ZOOM_CHANGE]', JSON.stringify({
      zoom: newZoom,
      clickCount: this.clickCount,
      zoomIndex: this.currentZoomIndex,
      timestamp: Date.now()
    }));
  }

  updateDisplay() {
    const currentZoom = this.cameras.main.zoom;
    this.zoomText.setText(`Zoom: ${currentZoom.toFixed(1)}x`);
    this.clickText.setText(`Clicks: ${this.clickCount}`);
  }

  update(time, delta) {
    // 可选：平滑过渡效果（当前使用即时切换）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: CameraZoomScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出游戏实例供测试使用
if (typeof window !== 'undefined') {
  window.__phaserGame__ = game;
}