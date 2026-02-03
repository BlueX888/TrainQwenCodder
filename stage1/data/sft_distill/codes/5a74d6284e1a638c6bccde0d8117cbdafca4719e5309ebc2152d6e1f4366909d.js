// 初始化验证信号
window.__signals__ = {
  zoomLevel: 1.0,
  minZoom: 0.5,
  maxZoom: 2.0,
  keyPressed: null,
  timestamp: Date.now()
};

class CameraZoomScene extends Phaser.Scene {
  constructor() {
    super('CameraZoomScene');
    this.currentZoom = 1.0;
    this.zoomSpeed = 0.02; // 每帧缩放速度
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 绘制网格背景，便于观察缩放效果
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

    // 绘制中心参考点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 20);
    
    // 绘制四个角的标记
    const cornerGraphics = this.add.graphics();
    cornerGraphics.fillStyle(0x0000ff, 1);
    cornerGraphics.fillCircle(100, 100, 15);
    cornerGraphics.fillCircle(width - 100, 100, 15);
    cornerGraphics.fillCircle(100, height - 100, 15);
    cornerGraphics.fillCircle(width - 100, height - 100, 15);

    // 绘制一些装饰方块
    const decorGraphics = this.add.graphics();
    decorGraphics.fillStyle(0xffff00, 0.6);
    decorGraphics.fillRect(200, 200, 80, 80);
    decorGraphics.fillRect(500, 150, 100, 60);
    decorGraphics.fillRect(300, 400, 120, 90);

    // 创建键盘输入
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示提示信息
    const instructionText = this.add.text(10, 10, 
      'Camera Zoom Control:\nW - Zoom In (放大)\nS - Zoom Out (缩小)\nA/D - Alternative controls', 
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 }
      }
    );
    instructionText.setScrollFactor(0); // 固定在屏幕上，不随相机移动

    // 显示当前缩放级别
    this.zoomText = this.add.text(10, 120, '', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomText.setScrollFactor(0);

    // 显示缩放范围
    const rangeText = this.add.text(10, 160, 
      `Zoom Range: ${window.__signals__.minZoom}x - ${window.__signals__.maxZoom}x`, 
      {
        fontSize: '14px',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    rangeText.setScrollFactor(0);

    // 初始化相机
    this.cameras.main.setZoom(this.currentZoom);
    this.updateZoomDisplay();

    console.log(JSON.stringify({
      event: 'scene_created',
      initialZoom: this.currentZoom,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    let zoomChanged = false;
    let keyPressed = null;

    // W键 - 放大
    if (this.keys.W.isDown) {
      this.currentZoom += this.zoomSpeed;
      zoomChanged = true;
      keyPressed = 'W';
    }
    
    // S键 - 缩小
    if (this.keys.S.isDown) {
      this.currentZoom -= this.zoomSpeed;
      zoomChanged = true;
      keyPressed = 'S';
    }

    // A键 - 缩小（备选）
    if (this.keys.A.isDown) {
      this.currentZoom -= this.zoomSpeed;
      zoomChanged = true;
      keyPressed = 'A';
    }

    // D键 - 放大（备选）
    if (this.keys.D.isDown) {
      this.currentZoom += this.zoomSpeed;
      zoomChanged = true;
      keyPressed = 'D';
    }

    // 限制缩放范围
    this.currentZoom = Phaser.Math.Clamp(
      this.currentZoom, 
      window.__signals__.minZoom, 
      window.__signals__.maxZoom
    );

    // 应用缩放
    if (zoomChanged) {
      this.cameras.main.setZoom(this.currentZoom);
      this.updateZoomDisplay();
      
      // 更新信号
      window.__signals__.zoomLevel = parseFloat(this.currentZoom.toFixed(2));
      window.__signals__.keyPressed = keyPressed;
      window.__signals__.timestamp = Date.now();

      // 输出日志
      console.log(JSON.stringify({
        event: 'zoom_changed',
        zoom: window.__signals__.zoomLevel,
        key: keyPressed,
        timestamp: window.__signals__.timestamp
      }));
    }
  }

  updateZoomDisplay() {
    const zoomPercent = Math.round(this.currentZoom * 100);
    this.zoomText.setText(`Current Zoom: ${this.currentZoom.toFixed(2)}x (${zoomPercent}%)`);
    
    // 根据缩放级别改变文字颜色
    if (this.currentZoom >= window.__signals__.maxZoom) {
      this.zoomText.setColor('#ff0000'); // 最大缩放 - 红色
    } else if (this.currentZoom <= window.__signals__.minZoom) {
      this.zoomText.setColor('#0000ff'); // 最小缩放 - 蓝色
    } else {
      this.zoomText.setColor('#00ff00'); // 正常范围 - 绿色
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: CameraZoomScene,
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始化完成信号
console.log(JSON.stringify({
  event: 'game_initialized',
  config: {
    width: config.width,
    height: config.height,
    zoomRange: [window.__signals__.minZoom, window.__signals__.maxZoom]
  },
  timestamp: Date.now()
}));