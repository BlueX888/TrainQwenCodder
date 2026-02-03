// 完整的 Phaser3 相机缩放实现
class ZoomScene extends Phaser.Scene {
  constructor() {
    super('ZoomScene');
    this.zoomLevel = 1.0;
    this.zoomSpeed = 0.01;
    this.minZoom = 0.5;
    this.maxZoom = 2.0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      zoomLevel: this.zoomLevel,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      lastAction: 'init'
    };

    // 获取主相机
    this.camera = this.cameras.main;
    this.camera.setZoom(this.zoomLevel);

    // 创建背景网格，便于观察缩放效果
    this.createGrid();

    // 创建中心参考物体
    this.createReferenceObjects();

    // 创建UI文本显示当前缩放级别
    this.zoomText = this.add.text(16, 16, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomText.setScrollFactor(0); // 固定在屏幕上，不随相机移动
    this.updateZoomText();

    // 创建说明文本
    const instructions = this.add.text(16, 60, 
      'W/A: Zoom In (放大)\nS/D: Zoom Out (缩小)\nRange: 0.5x - 2.0x', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructions.setScrollFactor(0);

    // 设置键盘输入
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    console.log('Camera Zoom Demo initialized. Use W/A to zoom in, S/D to zoom out.');
  }

  createGrid() {
    // 创建网格背景
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    const gridSize = 50;
    const gridWidth = 1600;
    const gridHeight = 1200;

    // 绘制垂直线
    for (let x = 0; x <= gridWidth; x += gridSize) {
      graphics.lineBetween(x, 0, x, gridHeight);
    }

    // 绘制水平线
    for (let y = 0; y <= gridHeight; y += gridSize) {
      graphics.lineBetween(0, y, gridWidth, y);
    }

    // 绘制中心十字线（更粗）
    graphics.lineStyle(2, 0x666666, 1);
    const centerX = gridWidth / 2;
    const centerY = gridHeight / 2;
    graphics.lineBetween(centerX, 0, centerX, gridHeight);
    graphics.lineBetween(0, centerY, gridWidth, centerY);
  }

  createReferenceObjects() {
    // 在场景中心创建参考物体
    const centerX = 800;
    const centerY = 600;

    // 创建中心圆形
    const circle = this.add.graphics();
    circle.fillStyle(0xff0000, 1);
    circle.fillCircle(centerX, centerY, 50);

    // 创建四个角的矩形
    const positions = [
      { x: 200, y: 150, color: 0x00ff00 },
      { x: 1400, y: 150, color: 0x0000ff },
      { x: 200, y: 1050, color: 0xffff00 },
      { x: 1400, y: 1050, color: 0xff00ff }
    ];

    positions.forEach(pos => {
      const rect = this.add.graphics();
      rect.fillStyle(pos.color, 1);
      rect.fillRect(pos.x - 40, pos.y - 40, 80, 80);
    });

    // 添加文字标签
    this.add.text(centerX, centerY, 'CENTER', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  updateZoomText() {
    this.zoomText.setText(`Zoom: ${this.zoomLevel.toFixed(2)}x`);
  }

  update(time, delta) {
    let zoomChanged = false;
    let action = '';

    // 检查放大键（W或A）
    if (this.keys.w.isDown || this.keys.a.isDown) {
      this.zoomLevel += this.zoomSpeed;
      if (this.zoomLevel > this.maxZoom) {
        this.zoomLevel = this.maxZoom;
      }
      zoomChanged = true;
      action = 'zoom_in';
    }

    // 检查缩小键（S或D）
    if (this.keys.s.isDown || this.keys.d.isDown) {
      this.zoomLevel -= this.zoomSpeed;
      if (this.zoomLevel < this.minZoom) {
        this.zoomLevel = this.minZoom;
      }
      zoomChanged = true;
      action = 'zoom_out';
    }

    // 如果缩放级别改变，更新相机和UI
    if (zoomChanged) {
      this.camera.setZoom(this.zoomLevel);
      this.updateZoomText();

      // 更新信号
      window.__signals__.zoomLevel = parseFloat(this.zoomLevel.toFixed(2));
      window.__signals__.lastAction = action;
      window.__signals__.timestamp = time;

      // 输出日志JSON
      console.log(JSON.stringify({
        event: 'zoom_change',
        zoomLevel: this.zoomLevel.toFixed(2),
        action: action,
        time: time
      }));
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
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化全局信号对象
window.__signals__ = {
  zoomLevel: 1.0,
  minZoom: 0.5,
  maxZoom: 2.0,
  lastAction: 'pending'
};