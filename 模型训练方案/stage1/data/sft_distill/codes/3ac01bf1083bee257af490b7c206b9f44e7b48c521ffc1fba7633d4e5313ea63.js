// 游戏场景类
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.scale;

    // 创建移动的小球作为游戏运行的视觉反馈
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.generateTexture('ball', 40, 40);
    graphics.destroy();

    this.ball = this.physics.add.sprite(width / 2, height / 2, 'ball');
    this.ball.setVelocity(200, 150);
    this.ball.setBounce(1, 1);
    this.ball.setCollideWorldBounds(true);

    // 添加分数显示作为额外的状态信号
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 创建暂停覆盖层
    this.createPauseOverlay();

    // 监听WASD键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    this.keyW.on('down', () => this.togglePause());
    this.keyA.on('down', () => this.togglePause());
    this.keyS.on('down', () => this.togglePause());
    this.keyD.on('down', () => this.togglePause());

    // 添加提示文字
    this.add.text(width / 2, height - 40, 'Press W/A/S/D to Pause/Resume', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  createPauseOverlay() {
    const { width, height } = this.scale;

    // 创建蓝色半透明背景
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x0000ff, 0.7);
    this.pauseOverlay.fillRect(0, 0, width, height);
    this.pauseOverlay.setDepth(100); // 确保在最上层

    // 创建"PAUSED"文字
    this.pauseText = this.add.text(width / 2, height / 2, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(101);

    // 添加提示文字
    this.resumeHint = this.add.text(width / 2, height / 2 + 60, 'Press W/A/S/D to Resume', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.resumeHint.setOrigin(0.5);
    this.resumeHint.setDepth(101);

    // 初始隐藏覆盖层
    this.pauseOverlay.setVisible(false);
    this.pauseText.setVisible(false);
    this.resumeHint.setVisible(false);
  }

  togglePause() {
    if (this.isPaused) {
      // 继续游戏
      this.resumeGame();
    } else {
      // 暂停游戏
      this.pauseGame();
    }
  }

  pauseGame() {
    this.isPaused = true;

    // 显示暂停覆盖层
    this.pauseOverlay.setVisible(true);
    this.pauseText.setVisible(true);
    this.resumeHint.setVisible(true);

    // 暂停物理引擎
    this.physics.pause();

    console.log('Game Paused');
  }

  resumeGame() {
    this.isPaused = false;

    // 隐藏暂停覆盖层
    this.pauseOverlay.setVisible(false);
    this.pauseText.setVisible(false);
    this.resumeHint.setVisible(false);

    // 恢复物理引擎
    this.physics.resume();

    console.log('Game Resumed');
  }

  update(time, delta) {
    // 每秒增加分数（仅在未暂停时）
    if (!this.isPaused && time % 1000 < delta) {
      this.score++;
      this.scoreText.setText('Score: ' + this.score);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);