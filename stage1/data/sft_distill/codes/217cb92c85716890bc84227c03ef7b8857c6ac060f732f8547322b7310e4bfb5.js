// 游戏暂停功能实现
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.ball = null;
    this.pauseOverlay = null;
    this.pauseText = null;
    this.spaceKey = null;
    this.ballVelocity = { x: 200, y: 150 };
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      pauseCount: 0,
      resumeCount: 0,
      events: [],
      isPaused: false
    };

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建移动的小球（使用 Graphics 绘制）
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0xffff00, 1);
    ballGraphics.fillCircle(0, 0, 20);
    ballGraphics.generateTexture('ball', 40, 40);
    ballGraphics.destroy();

    this.ball = this.add.sprite(400, 300, 'ball');
    this.ball.setData('velocity', { x: this.ballVelocity.x, y: this.ballVelocity.y });

    // 创建暂停覆盖层（青色半透明）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x00ffff, 0.5);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建 "PAUSED" 文本
    this.pauseText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(101);
    this.pauseText.setVisible(false);

    // 添加提示文本
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

    // 添加边界碰撞检测用的墙壁（视觉反馈）
    const walls = this.add.graphics();
    walls.lineStyle(4, 0x00ff00, 1);
    walls.strokeRect(2, 2, 796, 596);

    console.log('Game started - Press SPACE to pause');
  }

  update(time, delta) {
    // 只有在未暂停时才更新小球位置
    if (!this.isPaused && this.ball) {
      const velocity = this.ball.getData('velocity');
      
      // 更新位置
      this.ball.x += velocity.x * (delta / 1000);
      this.ball.y += velocity.y * (delta / 1000);

      // 边界碰撞检测
      if (this.ball.x <= 20 || this.ball.x >= 780) {
        velocity.x *= -1;
        this.ball.x = Phaser.Math.Clamp(this.ball.x, 20, 780);
      }
      if (this.ball.y <= 20 || this.ball.y >= 580) {
        velocity.y *= -1;
        this.ball.y = Phaser.Math.Clamp(this.ball.y, 20, 580);
      }

      this.ball.setData('velocity', velocity);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.pauseOverlay.setVisible(true);
      this.pauseText.setVisible(true);
      
      // 记录暂停事件
      window.__signals__.pauseCount++;
      window.__signals__.isPaused = true;
      window.__signals__.events.push({
        type: 'pause',
        timestamp: Date.now(),
        ballPosition: { x: this.ball.x, y: this.ball.y }
      });

      console.log('Game PAUSED', JSON.stringify({
        pauseCount: window.__signals__.pauseCount,
        ballPosition: { x: this.ball.x, y: this.ball.y }
      }));
    } else {
      // 继续游戏
      this.pauseOverlay.setVisible(false);
      this.pauseText.setVisible(false);
      
      // 记录继续事件
      window.__signals__.resumeCount++;
      window.__signals__.isPaused = false;
      window.__signals__.events.push({
        type: 'resume',
        timestamp: Date.now(),
        ballPosition: { x: this.ball.x, y: this.ball.y }
      });

      console.log('Game RESUMED', JSON.stringify({
        resumeCount: window.__signals__.resumeCount,
        ballPosition: { x: this.ball.x, y: this.ball.y }
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
if (typeof window !== 'undefined') {
  window.__game__ = game;
}