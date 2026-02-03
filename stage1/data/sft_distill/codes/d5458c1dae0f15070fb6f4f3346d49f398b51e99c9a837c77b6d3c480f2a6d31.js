class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.flashCount = 0; // 状态信号：记录闪烁触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景网格以便观察闪烁效果
    const graphics = this.add.graphics();
    
    // 绘制彩色网格背景
    for (let x = 0; x < 800; x += 100) {
      for (let y = 0; y < 600; y += 100) {
        const color = ((x / 100) % 2 === (y / 100) % 2) ? 0x3498db : 0x2ecc71;
        graphics.fillStyle(color, 1);
        graphics.fillRect(x, y, 100, 100);
      }
    }

    // 添加中心圆形作为视觉参考
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillCircle(400, 300, 50);

    // 创建文本显示闪烁次数
    this.flashText = this.add.text(400, 50, 'Flash Count: 0', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.flashText.setOrigin(0.5);

    // 创建提示文本
    this.instructionText = this.add.text(400, 550, 'Press W/A/S/D to trigger camera flash (2 seconds)', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5);

    // 添加WASD键盘监听
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

    // 获取主相机
    this.camera = this.cameras.main;
  }

  triggerFlash(key) {
    // 如果正在闪烁，则不重复触发
    if (this.isFlashing) {
      return;
    }

    // 设置闪烁状态
    this.isFlashing = true;

    // 增加闪烁计数
    this.flashCount++;
    this.flashText.setText(`Flash Count: ${this.flashCount}`);

    console.log(`Key ${key} pressed - Triggering flash effect (Count: ${this.flashCount})`);

    // 触发相机闪烁效果
    // 参数：duration(持续时间), red, green, blue, force(是否强制), callback
    this.camera.flash(2000, 255, 255, 255, false, (camera, progress) => {
      // 闪烁完成回调
      if (progress === 1) {
        this.isFlashing = false;
        console.log('Flash effect completed');
      }
    });
  }

  update(time, delta) {
    // 更新逻辑（本例中不需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);