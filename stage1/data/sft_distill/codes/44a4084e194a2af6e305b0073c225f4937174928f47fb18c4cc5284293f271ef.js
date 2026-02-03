class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false; // 暂停状态信号
    this.gameTime = 0; // 游戏运行时间（用于验证）
    this.ballMoveCount = 0; // 小球移动次数（用于验证）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, width, height);

    // 创建一个移动的小球（用于展示游戏运行状态）
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(0, 0, 20);
    ballGraphics.generateTexture('ball', 40, 40);
    ballGraphics.destroy();

    this.ball = this.physics.add.sprite(width / 2, height / 2, 'ball');
    this.ball.setVelocity(150, 100);
    this.ball.setBounce(1, 1);
    this.ball.setCollideWorldBounds(true);

    // 创建暂停覆盖层（蓝色半透明）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x0066cc, 0.7);
    this.pauseOverlay.fillRect(0, 0, width, height);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建 "PAUSED" 文字
    this.pausedText = this.add.text(width / 2, height / 2, 'PAUSED', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.pausedText.setOrigin(0.5);
    this.pausedText.setDepth(101);
    this.pausedText.setVisible(false);

    // 添加提示文字
    this.add.text(10, 10, 'Press W/A/S/D to Pause/Resume', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // 添加状态显示文字
    this.statusText = this.add.text(10, 40, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });

    // 监听 WASD 按键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    this.keyW.on('down', () => this.togglePause());
    this.keyA.on('down', () => this.togglePause());
    this.keyS.on('down', () => this.togglePause());
    this.keyD.on('down', () => this.togglePause());

    console.log('Game started. Press W/A/S/D to pause/resume.');
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.physics.pause();
      this.pauseOverlay.setVisible(true);
      this.pausedText.setVisible(true);
      console.log('Game PAUSED - Time:', this.gameTime.toFixed(2), 'Ball moves:', this.ballMoveCount);
    } else {
      // 继续游戏
      this.physics.resume();
      this.pauseOverlay.setVisible(false);
      this.pausedText.setVisible(false);
      console.log('Game RESUMED - Time:', this.gameTime.toFixed(2), 'Ball moves:', this.ballMoveCount);
    }
  }

  update(time, delta) {
    // 只在非暂停状态下更新游戏逻辑
    if (!this.isPaused) {
      this.gameTime += delta / 1000; // 累计游戏时间（秒）
      this.ballMoveCount++; // 累计移动帧数
    }

    // 更新状态显示（无论是否暂停都显示）
    this.statusText.setText(
      `Status: ${this.isPaused ? 'PAUSED' : 'RUNNING'}\n` +
      `Time: ${this.gameTime.toFixed(2)}s\n` +
      `Moves: ${this.ballMoveCount}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);