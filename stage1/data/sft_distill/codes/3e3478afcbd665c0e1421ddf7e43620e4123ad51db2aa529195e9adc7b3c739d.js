// 相机缩放游戏场景
class CameraZoomScene extends Phaser.Scene {
  constructor() {
    super('CameraZoomScene');
    this.currentZoom = 1.0;
    this.zoomSpeed = 0.02;
    this.minZoom = 0.5;
    this.maxZoom = 2.0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      zoom: this.currentZoom,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      zoomHistory: []
    };

    // 绘制网格背景，便于观察缩放效果
    this.drawGrid();

    // 绘制中心参考物体
    this.drawReferenceObjects();

    // 创建键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 创建UI文本显示当前缩放值
    this.zoomText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomText.setScrollFactor(0); // 固定在屏幕上，不随相机移动

    // 创建提示文本
    this.instructionText = this.add.text(16, 60, 
      'W/A: Zoom In (放大)\nS/D: Zoom Out (缩小)\nRange: 0.5x - 2.0x', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setScrollFactor(0);

    this.updateZoomDisplay();

    console.log('CameraZoomScene created - Use WASD to control zoom');
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
    graphics.lineStyle(2, 0x00ff00, 1);
    graphics.moveTo(400, 0);
    graphics.lineTo(400, 600);
    graphics.moveTo(0, 300);
    graphics.lineTo(800, 300);
    graphics.strokePath();
  }

  drawReferenceObjects() {
    // 中心圆形
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0xff0000, 1);
    centerCircle.fillCircle(400, 300, 50);

    // 四个角的矩形
    const corners = [
      { x: 100, y: 100, color: 0xff6600 },
      { x: 700, y: 100, color: 0x00ff00 },
      { x: 100, y: 500, color: 0x0066ff },
      { x: 700, y: 500, color: 0xff00ff }
    ];

    corners.forEach(corner => {
      const rect = this.add.graphics();
      rect.fillStyle(corner.color, 1);
      rect.fillRect(corner.x - 30, corner.y - 30, 60, 60);
    });

    // 添加文字标签
    this.add.text(400, 300, 'CENTER', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000'
    }).setOrigin(0.5);

    this.add.text(100, 100, 'TL', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(700, 100, 'TR', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(100, 500, 'BL', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(700, 500, 'BR', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    let zoomChanged = false;

    // W 或 A 键：放大（增加zoom值）
    if (this.keys.W.isDown || this.keys.A.isDown) {
      this.currentZoom += this.zoomSpeed;
      zoomChanged = true;
    }

    // S 或 D 键：缩小（减少zoom值）
    if (this.keys.S.isDown || this.keys.D.isDown) {
      this.currentZoom -= this.zoomSpeed;
      zoomChanged = true;
    }

    // 限制缩放范围
    if (this.currentZoom < this.minZoom) {
      this.currentZoom = this.minZoom;
    }
    if (this.currentZoom > this.maxZoom) {
      this.currentZoom = this.maxZoom;
    }

    // 应用缩放到相机
    if (zoomChanged) {
      this.mainCamera.setZoom(this.currentZoom);
      this.updateZoomDisplay();
      this.updateSignals();
    }
  }

  updateZoomDisplay() {
    const percentage = (this.currentZoom * 100).toFixed(0);
    this.zoomText.setText(`Zoom: ${this.currentZoom.toFixed(2)}x (${percentage}%)`);
  }

  updateSignals() {
    // 更新验证信号
    window.__signals__.zoom = parseFloat(this.currentZoom.toFixed(2));
    window.__signals__.zoomHistory.push({
      time: Date.now(),
      zoom: parseFloat(this.currentZoom.toFixed(2))
    });

    // 只保留最近10条记录
    if (window.__signals__.zoomHistory.length > 10) {
      window.__signals__.zoomHistory.shift();
    }

    // 输出日志JSON
    console.log(JSON.stringify({
      type: 'zoom_change',
      zoom: this.currentZoom.toFixed(2),
      min: this.minZoom,
      max: this.maxZoom,
      timestamp: Date.now()
    }));
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: CameraZoomScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);