class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.flashCount = 0; // 状态信号：记录闪烁触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景网格，方便观察相机效果
    const graphics = this.add.graphics();
    
    // 绘制棋盘格背景
    for (let x = 0; x < 800; x += 50) {
      for (let y = 0; y < 600; y += 50) {
        const color = ((x / 50) + (y / 50)) % 2 === 0 ? 0x2d2d2d : 0x3d3d3d;
        graphics.fillStyle(color, 1);
        graphics.fillRect(x, y, 50, 50);
      }
    }

    // 添加中心参考圆形
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(400, 300, 50);

    // 添加提示文本
    const instructionText = this.add.text(400, 100, 'Press W/A/S/D to trigger camera flash', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 状态显示文本
    this.statusText = this.add.text(400, 500, 'Flash Count: 0', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 创建WASD键盘监听
    const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = this.input.Keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // W键触发白色闪烁
    keyW.on('down', () => {
      camera.flash(2000, 255, 255, 255); // 持续2秒，白色闪烁
      this.flashCount++;
      this.updateStatus();
      console.log('W pressed - White flash triggered');
    });

    // A键触发红色闪烁
    keyA.on('down', () => {
      camera.flash(2000, 255, 0, 0); // 持续2秒，红色闪烁
      this.flashCount++;
      this.updateStatus();
      console.log('A pressed - Red flash triggered');
    });

    // S键触发绿色闪烁
    keyS.on('down', () => {
      camera.flash(2000, 0, 255, 0); // 持续2秒，绿色闪烁
      this.flashCount++;
      this.updateStatus();
      console.log('S pressed - Green flash triggered');
    });

    // D键触发蓝色闪烁
    keyD.on('down', () => {
      camera.flash(2000, 0, 0, 255); // 持续2秒，蓝色闪烁
      this.flashCount++;
      this.updateStatus();
      console.log('D pressed - Blue flash triggered');
    });

    // 添加闪烁完成事件监听（用于调试）
    camera.on('cameraflashcomplete', () => {
      console.log('Flash effect completed');
    });
  }

  updateStatus() {
    this.statusText.setText(`Flash Count: ${this.flashCount}`);
  }

  update(time, delta) {
    // 本示例无需每帧更新逻辑
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);