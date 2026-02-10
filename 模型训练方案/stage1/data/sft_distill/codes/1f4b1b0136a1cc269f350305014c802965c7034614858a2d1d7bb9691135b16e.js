class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 可验证的状态信号
    this.isShaking = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景网格
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制网格线
    for (let i = 0; i <= 800; i += 50) {
      graphics.lineBetween(i, 0, i, 600);
    }
    for (let i = 0; i <= 600; i += 50) {
      graphics.lineBetween(0, i, 800, i);
    }

    // 创建中心对象
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff6600, 1);
    centerGraphics.fillCircle(400, 300, 40);
    centerGraphics.lineStyle(4, 0xffffff, 1);
    centerGraphics.strokeCircle(400, 300, 40);

    // 创建四个方向的参考点
    const refGraphics = this.add.graphics();
    refGraphics.fillStyle(0x00ff00, 1);
    refGraphics.fillRect(390, 100, 20, 20); // 上
    refGraphics.fillRect(390, 480, 20, 20); // 下
    refGraphics.fillRect(100, 290, 20, 20); // 左
    refGraphics.fillRect(680, 290, 20, 20); // 右

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 创建提示文本
    this.add.text(400, 550, 'Press Arrow Keys to Shake Camera', {
      fontSize: '18px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 监听相机抖动完成事件
    this.cameras.main.on('camerashakecomplete', () => {
      this.isShaking = false;
      this.updateStatusText();
    });
  }

  update(time, delta) {
    // 如果正在抖动，不重复触发
    if (this.isShaking) {
      return;
    }

    // 检测方向键按下
    let shakeTriggered = false;
    let direction = '';

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      shakeTriggered = true;
      direction = 'UP';
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      shakeTriggered = true;
      direction = 'DOWN';
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      shakeTriggered = true;
      direction = 'LEFT';
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      shakeTriggered = true;
      direction = 'RIGHT';
    }

    // 触发相机抖动
    if (shakeTriggered) {
      this.isShaking = true;
      this.shakeCount++;
      
      // shake(duration, intensity)
      // duration: 持续时间（毫秒）
      // intensity: 抖动强度（0.01 表示较强的抖动）
      this.cameras.main.shake(500, 0.01);
      
      this.updateStatusText(direction);
    }
  }

  updateStatusText(direction = '') {
    const status = this.isShaking ? 'SHAKING' : 'IDLE';
    const directionText = direction ? ` | Direction: ${direction}` : '';
    this.statusText.setText(
      `Shake Count: ${this.shakeCount} | Status: ${status}${directionText}`
    );
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);