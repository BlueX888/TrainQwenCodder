class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.flashCount = 0; // 状态信号：记录闪烁触发次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景网格作为参考
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制网格
    for (let x = 0; x < 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心圆形作为视觉参考
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0x00ff00, 1);
    centerGraphics.fillCircle(400, 300, 50);

    // 绘制四个角的矩形
    const cornerGraphics = this.add.graphics();
    cornerGraphics.fillStyle(0xff0000, 1);
    cornerGraphics.fillRect(50, 50, 60, 60);
    cornerGraphics.fillRect(690, 50, 60, 60);
    cornerGraphics.fillRect(50, 490, 60, 60);
    cornerGraphics.fillRect(690, 490, 60, 60);

    // 添加提示文本
    this.instructionText = this.add.text(400, 50, 'Press W/A/S/D to trigger camera flash', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5, 0);

    // 添加闪烁计数显示
    this.flashCountText = this.add.text(400, 550, `Flash Count: ${this.flashCount}`, {
      fontSize: '24px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.flashCountText.setOrigin(0.5, 1);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听WASD按键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 为每个按键添加按下事件监听
    this.keyW.on('down', () => this.triggerFlash());
    this.keyA.on('down', () => this.triggerFlash());
    this.keyS.on('down', () => this.triggerFlash());
    this.keyD.on('down', () => this.triggerFlash());

    // 添加状态指示文本
    this.statusText = this.add.text(400, 100, '', {
      fontSize: '18px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5, 0);
  }

  triggerFlash() {
    // 触发相机闪烁效果，持续1000毫秒（1秒）
    // 参数：持续时间(ms), 红色强度, 绿色强度, 蓝色强度, 强制闪烁
    this.mainCamera.flash(1000, 255, 255, 255, false);
    
    // 更新闪烁计数
    this.flashCount++;
    this.flashCountText.setText(`Flash Count: ${this.flashCount}`);
    
    // 显示临时状态信息
    this.statusText.setText('Camera Flash Triggered!');
    
    // 1秒后清除状态文本
    this.time.delayedCall(1000, () => {
      this.statusText.setText('');
    });

    // 输出到控制台用于调试
    console.log(`Flash triggered! Total count: ${this.flashCount}`);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container' // 可选：指定父容器
};

// 创建游戏实例
const game = new Phaser.Game(config);