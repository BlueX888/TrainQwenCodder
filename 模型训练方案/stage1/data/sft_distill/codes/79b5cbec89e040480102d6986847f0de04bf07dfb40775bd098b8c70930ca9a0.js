// 完整的 Phaser3 游戏暂停功能实现
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.ball = null;
    this.pauseOverlay = null;
    this.pauseText = null;
    this.spaceKey = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      pauseCount: 0,
      resumeCount: 0,
      isPaused: false,
      ballPosition: { x: 0, y: 0 }
    };

    // 创建游戏背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建移动的小球（游戏内容）
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0xffff00, 1);
    ballGraphics.fillCircle(0, 0, 20);
    ballGraphics.generateTexture('ball', 40, 40);
    ballGraphics.destroy();

    this.ball = this.add.sprite(100, 300, 'ball');
    this.ball.setData('velocityX', 200);
    this.ball.setData('velocityY', 150);

    // 创建暂停覆盖层（初始隐藏）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x00ffff, 0.5); // 青色半透明
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建暂停文字（初始隐藏）
    this.pauseText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(101);
    this.pauseText.setVisible(false);

    // 添加提示文字
    const hintText = this.add.text(400, 550, 'Press SPACE to Pause/Resume', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    hintText.setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.togglePause();
    });

    console.log('[Game] Game started, press SPACE to pause');
  }

  update(time, delta) {
    // 更新小球位置（只在非暂停状态下）
    if (!this.isPaused && this.ball) {
      const velocityX = this.ball.getData('velocityX');
      const velocityY = this.ball.getData('velocityY');

      this.ball.x += velocityX * (delta / 1000);
      this.ball.y += velocityY * (delta / 1000);

      // 边界反弹
      if (this.ball.x <= 20 || this.ball.x >= 780) {
        this.ball.setData('velocityX', -velocityX);
      }
      if (this.ball.y <= 20 || this.ball.y >= 580) {
        this.ball.setData('velocityY', -velocityY);
      }

      // 更新信号
      window.__signals__.ballPosition = {
        x: Math.round(this.ball.x),
        y: Math.round(this.ball.y)
      };
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.pauseOverlay.setVisible(true);
      this.pauseText.setVisible(true);
      
      // 更新信号
      window.__signals__.pauseCount++;
      window.__signals__.isPaused = true;

      console.log('[Game] Game PAUSED', JSON.stringify({
        pauseCount: window.__signals__.pauseCount,
        ballPosition: window.__signals__.ballPosition
      }));
    } else {
      // 继续游戏
      this.pauseOverlay.setVisible(false);
      this.pauseText.setVisible(false);
      
      // 更新信号
      window.__signals__.resumeCount++;
      window.__signals__.isPaused = false;

      console.log('[Game] Game RESUMED', JSON.stringify({
        resumeCount: window.__signals__.resumeCount,
        ballPosition: window.__signals__.ballPosition
      }));
    }
  }
}

// 游戏配置
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