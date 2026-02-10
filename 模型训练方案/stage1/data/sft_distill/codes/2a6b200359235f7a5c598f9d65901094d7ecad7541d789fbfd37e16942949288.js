class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录弹跳触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景网格以便观察相机弹跳效果
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.5);
    
    // 绘制网格
    for (let i = 0; i <= 800; i += 50) {
      graphics.moveTo(i, 0);
      graphics.lineTo(i, 600);
    }
    for (let i = 0; i <= 600; i += 50) {
      graphics.moveTo(0, i);
      graphics.lineTo(800, i);
    }
    graphics.strokePath();

    // 绘制中心参考点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(400, 300, 20);

    // 绘制四个角的标记
    const cornerGraphics = this.add.graphics();
    cornerGraphics.fillStyle(0x0000ff, 1);
    cornerGraphics.fillCircle(100, 100, 15);
    cornerGraphics.fillCircle(700, 100, 15);
    cornerGraphics.fillCircle(100, 500, 15);
    cornerGraphics.fillCircle(700, 500, 15);

    // 添加提示文本
    this.instructionText = this.add.text(400, 50, 'Press W/A/S/D to shake camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(400, 550, `Shake Count: ${this.shakeCount}`, {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 设置键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    this.keyW.on('down', () => this.triggerShake('W'));
    this.keyA.on('down', () => this.triggerShake('A'));
    this.keyS.on('down', () => this.triggerShake('S'));
    this.keyD.on('down', () => this.triggerShake('D'));

    // 获取主相机
    this.mainCamera = this.cameras.main;
  }

  triggerShake(key) {
    // 触发相机弹跳效果，持续3000ms（3秒）
    // 参数：持续时间(ms), 强度(默认0.05), 是否强制重启
    this.mainCamera.shake(3000, 0.01);
    
    // 更新状态信号
    this.shakeCount++;
    this.statusText.setText(`Shake Count: ${this.shakeCount} (Last Key: ${key})`);
    
    // 在控制台输出日志
    console.log(`Camera shake triggered by key: ${key}, Total count: ${this.shakeCount}`);
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中无需特殊更新）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  // 如需在无头模式运行，改为 Phaser.HEADLESS
  // type: Phaser.HEADLESS,
};

// 创建游戏实例
new Phaser.Game(config);