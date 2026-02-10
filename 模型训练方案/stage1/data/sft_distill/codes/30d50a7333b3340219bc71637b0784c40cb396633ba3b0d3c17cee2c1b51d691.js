class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录弹跳触发次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景网格，方便观察相机弹跳效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(1, 0x333333, 1);
    for (let x = 0; x <= 800; x += 50) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.moveTo(0, y);
      graphics.lineTo(800, y);
    }
    graphics.strokePath();

    // 绘制中心标记
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);

    // 绘制四角标记
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(100, 100, 15);
    graphics.fillCircle(700, 100, 15);
    graphics.fillCircle(100, 500, 15);
    graphics.fillCircle(700, 500, 15);

    // 添加提示文字
    const instructionText = this.add.text(400, 50, '按空格键触发相机弹跳', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 添加状态显示文字
    this.statusText = this.add.text(400, 550, '弹跳次数: 0', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加空格键按下事件
    this.spaceKey.on('down', () => {
      this.triggerCameraShake();
    });

    // 也可以使用 justDown 方式在 update 中检测
    // 这里为了演示两种方式，同时保留事件监听方式
  }

  triggerCameraShake() {
    // 触发相机弹跳效果
    // shake(duration, intensity, force, callback, context)
    // duration: 持续时间（毫秒）
    // intensity: 强度（默认 0.05）
    this.mainCamera.shake(1000, 0.01);

    // 更新状态
    this.shakeCount++;
    this.statusText.setText(`弹跳次数: ${this.shakeCount}`);

    // 输出到控制台用于验证
    console.log(`相机弹跳触发 #${this.shakeCount}`);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
    // 例如使用 justDown 检测空格键（备用方案）
    // if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
    //   this.triggerCameraShake();
    // }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  // 可选：添加像素艺术风格
  pixelArt: false,
  // 可选：抗锯齿
  antialias: true
};

// 创建游戏实例
const game = new Phaser.Game(config);