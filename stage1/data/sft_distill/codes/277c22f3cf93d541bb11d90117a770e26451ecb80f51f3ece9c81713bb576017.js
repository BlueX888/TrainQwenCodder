class FlashCameraScene extends Phaser.Scene {
  constructor() {
    super('FlashCameraScene');
    this.flashCount = 0; // 状态信号：记录闪烁触发次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建一些可视化元素（用于观察闪烁效果）
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    for (let i = 0; i < 5; i++) {
      const circle = this.add.graphics();
      circle.fillStyle(colors[i], 1);
      circle.fillCircle(150 + i * 150, 300, 50);
    }

    // 添加标题文本
    this.add.text(400, 100, 'Camera Flash Effect', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加提示文本
    this.add.text(400, 150, 'Press W, A, S, or D to trigger flash', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建闪烁计数显示文本
    this.flashCountText = this.add.text(400, 500, `Flash Count: ${this.flashCount}`, {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建状态提示文本
    this.statusText = this.add.text(400, 550, 'Ready', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 添加WASD键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 标记是否正在闪烁（防止重复触发）
    this.isFlashing = false;

    // 监听按键按下事件
    this.keyW.on('down', () => this.triggerFlash('W'));
    this.keyA.on('down', () => this.triggerFlash('A'));
    this.keyS.on('down', () => this.triggerFlash('S'));
    this.keyD.on('down', () => this.triggerFlash('D'));
  }

  triggerFlash(key) {
    // 如果正在闪烁，不重复触发
    if (this.isFlashing) {
      return;
    }

    // 设置闪烁状态
    this.isFlashing = true;
    this.flashCount++;

    // 更新显示文本
    this.flashCountText.setText(`Flash Count: ${this.flashCount}`);
    this.statusText.setText(`Flashing... (Key: ${key})`);

    // 触发相机闪烁效果
    // 参数：颜色(白色), 持续时间(1000ms)
    this.mainCamera.flash(1000, 255, 255, 255);

    // 监听闪烁完成事件
    this.mainCamera.once('cameraflashcomplete', () => {
      this.isFlashing = false;
      this.statusText.setText('Ready');
    });
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: FlashCameraScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);