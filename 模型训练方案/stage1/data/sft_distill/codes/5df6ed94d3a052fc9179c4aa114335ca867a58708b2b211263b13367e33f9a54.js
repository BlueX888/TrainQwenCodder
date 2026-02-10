class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.flashCount = 0; // 状态信号：记录闪烁触发次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景网格，方便观察闪烁效果
    const graphics = this.add.graphics();
    
    // 绘制彩色方块作为背景
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const colorIndex = (row * 5 + col) % colors.length;
        graphics.fillStyle(colors[colorIndex], 1);
        graphics.fillRect(col * 160, row * 150, 150, 140);
      }
    }

    // 添加提示文本
    const instructionText = this.add.text(400, 50, 'Press W/A/S/D to Flash Camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 显示闪烁次数的文本
    this.flashCountText = this.add.text(400, 550, `Flash Count: ${this.flashCount}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.flashCountText.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 监听 W 键
    const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keyW.on('down', () => {
      this.triggerFlash(camera);
    });

    // 监听 A 键
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyA.on('down', () => {
      this.triggerFlash(camera);
    });

    // 监听 S 键
    const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyS.on('down', () => {
      this.triggerFlash(camera);
    });

    // 监听 D 键
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyD.on('down', () => {
      this.triggerFlash(camera);
    });

    // 添加按键状态显示
    this.keyStatusText = this.add.text(400, 100, 'Waiting for key press...', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    this.keyStatusText.setOrigin(0.5);
  }

  triggerFlash(camera) {
    // 触发相机闪烁效果
    // 参数：持续时间(ms), 红色强度, 绿色强度, 蓝色强度, 是否强制重启, 回调函数
    camera.flash(1000, 255, 255, 255, false, (cam, progress) => {
      if (progress === 1) {
        // 闪烁完成时的回调
        this.keyStatusText.setText('Flash completed!');
      }
    });

    // 更新闪烁计数
    this.flashCount++;
    this.flashCountText.setText(`Flash Count: ${this.flashCount}`);
    
    // 更新按键状态文本
    this.keyStatusText.setText('Flashing...');

    // 在控制台输出状态信息
    console.log(`Camera flash triggered! Total flashes: ${this.flashCount}`);
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要特殊更新）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  // 可选：使用 HEADLESS 模式进行无界面测试
  // type: Phaser.HEADLESS,
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态验证接口（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}