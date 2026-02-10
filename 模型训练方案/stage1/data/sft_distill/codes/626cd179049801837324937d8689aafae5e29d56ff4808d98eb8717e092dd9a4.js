class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.zoomCount = 0; // 状态信号：记录缩放触发次数
    this.currentZoomLevel = 1; // 当前缩放级别
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建网格背景用于观察缩放效果
    this.createGrid();
    
    // 创建中心参考点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(400, 300, 20);
    
    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0); // 固定在屏幕上，不随相机移动
    this.updateStatusText();
    
    // 设置键盘输入
    this.setupKeyboardInput();
    
    // 添加提示文本
    const hintText = this.add.text(400, 550, 
      'Press W (Zoom In) | S (Zoom Out) | A (Zoom 0.5x) | D (Zoom 2x)', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    });
    hintText.setOrigin(0.5);
    hintText.setScrollFactor(0);
  }

  createGrid() {
    // 创建网格背景
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x00ff00, 0.3);
    
    // 绘制垂直线
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    
    // 绘制水平线
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }
    
    // 添加一些参考方块
    graphics.fillStyle(0x0000ff, 0.5);
    graphics.fillRect(100, 100, 100, 100);
    graphics.fillRect(600, 100, 100, 100);
    graphics.fillRect(100, 400, 100, 100);
    graphics.fillRect(600, 400, 100, 100);
  }

  setupKeyboardInput() {
    // 创建WASD键
    const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
    // W键：放大到1.5倍
    keyW.on('down', () => {
      this.triggerZoom(1.5, 'W - Zoom In (1.5x)');
    });
    
    // S键：缩小到0.8倍
    keyS.on('down', () => {
      this.triggerZoom(0.8, 'S - Zoom Out (0.8x)');
    });
    
    // A键：缩放到0.5倍
    keyA.on('down', () => {
      this.triggerZoom(0.5, 'A - Zoom to 0.5x');
    });
    
    // D键：放大到2倍
    keyD.on('down', () => {
      this.triggerZoom(2.0, 'D - Zoom to 2x');
    });
  }

  triggerZoom(zoomLevel, actionName) {
    // 增加缩放计数
    this.zoomCount++;
    this.currentZoomLevel = zoomLevel;
    
    // 更新状态文本
    this.updateStatusText(actionName);
    
    // 触发相机缩放效果，持续3000毫秒（3秒）
    this.cameras.main.zoomTo(zoomLevel, 3000, 'Sine.easeInOut');
    
    // 打印调试信息
    console.log(`Zoom triggered: ${actionName}, Count: ${this.zoomCount}, Target: ${zoomLevel}x`);
  }

  updateStatusText(lastAction = 'None') {
    this.statusText.setText([
      `Zoom Count: ${this.zoomCount}`,
      `Current Zoom: ${this.currentZoomLevel.toFixed(2)}x`,
      `Last Action: ${lastAction}`
    ]);
  }

  update(time, delta) {
    // 实时更新当前相机缩放值
    const actualZoom = this.cameras.main.zoom;
    if (Math.abs(actualZoom - this.currentZoomLevel) > 0.01) {
      // 缩放动画进行中，显示实时值
      this.statusText.setText([
        `Zoom Count: ${this.zoomCount}`,
        `Current Zoom: ${actualZoom.toFixed(2)}x (animating...)`,
        `Target Zoom: ${this.currentZoomLevel.toFixed(2)}x`
      ]);
    }
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
new Phaser.Game(config);