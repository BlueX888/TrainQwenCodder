class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.flashCount = 0; // 状态信号：记录闪烁触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景图形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 添加一些装饰性的矩形
    graphics.fillStyle(0x4a4a4a, 1);
    graphics.fillRect(100, 100, 200, 150);
    graphics.fillRect(500, 100, 200, 150);
    graphics.fillRect(100, 350, 200, 150);
    graphics.fillRect(500, 350, 200, 150);

    // 添加中心圆形
    graphics.fillStyle(0x6a6a6a, 1);
    graphics.fillCircle(400, 300, 80);

    // 创建提示文本
    this.instructionText = this.add.text(400, 50, '按方向键触发相机闪烁效果', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.instructionText.setOrigin(0.5);

    // 创建状态显示文本
    this.statusText = this.add.text(400, 550, `闪烁次数: ${this.flashCount}`, {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });
    this.statusText.setOrigin(0.5);

    // 创建当前状态文本
    this.currentStateText = this.add.text(400, 500, '等待输入...', {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });
    this.currentStateText.setOrigin(0.5);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 标记是否正在闪烁（防止重复触发）
    this.isFlashing = false;

    // 获取主相机
    this.camera = this.cameras.main;
  }

  update(time, delta) {
    // 如果已经在闪烁中，不处理新的按键
    if (this.isFlashing) {
      return;
    }

    // 检测方向键按下
    let keyPressed = false;
    let direction = '';

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      keyPressed = true;
      direction = '上';
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      keyPressed = true;
      direction = '下';
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      keyPressed = true;
      direction = '左';
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      keyPressed = true;
      direction = '右';
    }

    // 如果有方向键按下，触发闪烁效果
    if (keyPressed) {
      this.isFlashing = true;
      this.flashCount++;

      // 更新状态文本
      this.statusText.setText(`闪烁次数: ${this.flashCount}`);
      this.currentStateText.setText(`触发闪烁: ${direction}方向键 (3秒)`);

      // 触发相机闪烁效果
      // 参数：持续时间(ms), 红色强度, 绿色强度, 蓝色强度, 是否强制, 回调, 上下文
      this.camera.flash(3000, 255, 255, 255, false, (camera, progress) => {
        // 闪烁完成回调
        if (progress === 1) {
          this.isFlashing = false;
          this.currentStateText.setText('等待输入...');
        }
      });

      // 打印调试信息
      console.log(`Flash triggered by ${direction} key. Total flashes: ${this.flashCount}`);
    }
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