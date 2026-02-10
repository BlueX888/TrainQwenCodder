class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentZoomTarget = 1; // 状态信号：当前缩放目标值
    this.zoomCount = 0; // 状态信号：缩放触发次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 绘制背景网格，便于观察缩放效果
    const graphics = this.add.graphics();
    
    // 绘制网格线
    graphics.lineStyle(1, 0x333333, 0.5);
    const gridSize = 50;
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制中心标记
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(width / 2, height / 2, 20);
    
    // 绘制四个角的参考方块
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(50, 50, 40, 40);
    graphics.fillRect(width - 90, 50, 40, 40);
    graphics.fillRect(50, height - 90, 40, 40);
    graphics.fillRect(width - 90, height - 90, 40, 40);

    // 添加提示文本
    const style = {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    };
    
    this.instructionText = this.add.text(10, 10, 
      'W: Zoom In (2x)\nS: Zoom Out (0.5x)\nA/D: Reset (1x)', 
      style
    ).setScrollFactor(0); // 固定在相机上

    this.statusText = this.add.text(10, 120,
      `Zoom Target: ${this.currentZoomTarget.toFixed(2)}\nZoom Count: ${this.zoomCount}`,
      style
    ).setScrollFactor(0);

    // 创建键盘按键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    this.keyW.on('down', () => this.triggerZoom(2, 'Zoom In'));
    this.keyS.on('down', () => this.triggerZoom(0.5, 'Zoom Out'));
    this.keyA.on('down', () => this.triggerZoom(1, 'Reset (A)'));
    this.keyD.on('down', () => this.triggerZoom(1, 'Reset (D)'));

    // 添加当前缩放值显示
    this.currentZoomText = this.add.text(10, 200,
      `Current Zoom: ${this.cameras.main.zoom.toFixed(2)}`,
      style
    ).setScrollFactor(0);
  }

  triggerZoom(targetZoom, action) {
    // 更新状态信号
    this.currentZoomTarget = targetZoom;
    this.zoomCount++;

    // 触发相机缩放效果，持续3000毫秒（3秒）
    this.cameras.main.zoomTo(targetZoom, 3000, 'Sine.easeInOut');

    // 更新状态文本
    this.statusText.setText(
      `Zoom Target: ${this.currentZoomTarget.toFixed(2)}\nZoom Count: ${this.zoomCount}\nAction: ${action}`
    );

    // 在控制台输出状态
    console.log(`[Zoom Effect] Target: ${targetZoom}, Count: ${this.zoomCount}, Action: ${action}`);
  }

  update(time, delta) {
    // 实时更新当前缩放值
    if (this.currentZoomText) {
      this.currentZoomText.setText(
        `Current Zoom: ${this.cameras.main.zoom.toFixed(2)}`
      );
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