// 游戏场景类
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.pauseOverlay = null;
    this.pauseText = null;
    this.ball = null;
    this.ballVelocity = { x: 200, y: 150 };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = window.__signals__ || [];
    window.__signals__.push({
      type: 'game_started',
      timestamp: Date.now(),
      isPaused: false
    });

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建移动的小球（使用 Graphics 绘制）
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0xff6b6b, 1);
    ballGraphics.fillCircle(0, 0, 20);
    ballGraphics.generateTexture('ball', 40, 40);
    ballGraphics.destroy();

    this.ball = this.add.sprite(400, 300, 'ball');

    // 添加提示文字
    this.add.text(10, 10, 'Press SPACE to Pause/Resume', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 监听空格键
    this.input.keyboard.on('keydown-SPACE', () => {
      this.togglePause();
    });

    // 创建暂停覆盖层（初始隐藏）
    this.createPauseOverlay();
  }

  createPauseOverlay() {
    // 创建青色半透明覆盖层
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x00CED1, 0.7); // 青色 (Cyan/Turquoise)
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建 PAUSED 文字
    this.pauseText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '72px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pauseText.setOrigin(0.5, 0.5);
    this.pauseText.setDepth(101);
    this.pauseText.setVisible(false);

    // 添加提示文字
    const resumeHint = this.add.text(400, 380, 'Press SPACE to Resume', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    resumeHint.setOrigin(0.5, 0.5);
    resumeHint.setDepth(101);
    resumeHint.setVisible(false);
    this.pauseResumeHint = resumeHint;
  }

  togglePause() {
    if (!this.isPaused) {
      // 暂停游戏
      this.isPaused = true;
      this.scene.pause();
      
      // 显示覆盖层
      if (this.pauseOverlay) {
        this.pauseOverlay.setVisible(true);
      }
      if (this.pauseText) {
        this.pauseText.setVisible(true);
      }
      if (this.pauseResumeHint) {
        this.pauseResumeHint.setVisible(true);
      }

      // 记录信号
      window.__signals__.push({
        type: 'game_paused',
        timestamp: Date.now(),
        isPaused: true,
        ballPosition: { x: this.ball.x, y: this.ball.y }
      });

      console.log('Game PAUSED');
    } else {
      // 继续游戏
      this.isPaused = false;
      
      // 隐藏覆盖层
      if (this.pauseOverlay) {
        this.pauseOverlay.setVisible(false);
      }
      if (this.pauseText) {
        this.pauseText.setVisible(false);
      }
      if (this.pauseResumeHint) {
        this.pauseResumeHint.setVisible(false);
      }

      this.scene.resume();

      // 记录信号
      window.__signals__.push({
        type: 'game_resumed',
        timestamp: Date.now(),
        isPaused: false,
        ballPosition: { x: this.ball.x, y: this.ball.y }
      });

      console.log('Game RESUMED');
    }
  }

  update(time, delta) {
    // 移动小球（只有在游戏未暂停时才会执行）
    if (this.ball) {
      this.ball.x += this.ballVelocity.x * (delta / 1000);
      this.ball.y += this.ballVelocity.y * (delta / 1000);

      // 边界反弹
      if (this.ball.x <= 20 || this.ball.x >= 780) {
        this.ballVelocity.x *= -1;
        this.ball.x = Phaser.Math.Clamp(this.ball.x, 20, 780);
      }
      if (this.ball.y <= 20 || this.ball.y >= 580) {
        this.ballVelocity.y *= -1;
        this.ball.y = Phaser.Math.Clamp(this.ball.y, 20, 580);
      }
    }
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

// 导出游戏实例供测试使用
window.__game__ = game;