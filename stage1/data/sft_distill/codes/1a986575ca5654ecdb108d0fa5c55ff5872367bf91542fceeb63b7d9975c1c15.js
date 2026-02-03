// 游戏主场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.moveSpeed = 100;
    this.frameCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      isPaused: false,
      pauseCount: 0,
      frameCount: 0,
      ballPosition: { x: 400, y: 300 }
    };

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建移动的小球作为游戏运行的视觉反馈
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(0, 0, 20);
    ballGraphics.generateTexture('ball', 40, 40);
    ballGraphics.destroy();

    this.ball = this.add.sprite(400, 300, 'ball');
    this.ball.setVelocity = (vx, vy) => {
      this.ball.vx = vx;
      this.ball.vy = vy;
    };
    this.ball.vx = this.moveSpeed;
    this.ball.vy = this.moveSpeed;

    // 创建帧计数器文本
    this.frameText = this.add.text(10, 10, 'Frame: 0', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 创建暂停覆盖层（初始隐藏）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x9b59b6, 0.7); // 紫色半透明
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建PAUSED文本
    this.pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.pausedText.setOrigin(0.5);
    this.pausedText.setDepth(101);
    this.pausedText.setVisible(false);

    // 创建提示文本
    this.hintText = this.add.text(400, 380, 'Press W/A/S/D to pause/resume', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.hintText.setOrigin(0.5);
    this.hintText.setDepth(101);
    this.hintText.setVisible(false);

    // 监听WASD键
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 绑定按键事件
    this.wKey.on('down', () => this.togglePause());
    this.aKey.on('down', () => this.togglePause());
    this.sKey.on('down', () => this.togglePause());
    this.dKey.on('down', () => this.togglePause());

    console.log('[GameScene] Created - Press W/A/S/D to pause/resume');
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.pauseOverlay.setVisible(true);
      this.pausedText.setVisible(true);
      this.hintText.setVisible(true);
      
      // 暂停场景时间（停止update中的逻辑执行）
      this.scene.pause();
      
      window.__signals__.isPaused = true;
      window.__signals__.pauseCount++;
      
      console.log('[GameScene] PAUSED', {
        pauseCount: window.__signals__.pauseCount,
        frameCount: this.frameCount
      });
    } else {
      // 继续游戏
      this.pauseOverlay.setVisible(false);
      this.pausedText.setVisible(false);
      this.hintText.setVisible(false);
      
      // 恢复场景
      this.scene.resume();
      
      window.__signals__.isPaused = false;
      
      console.log('[GameScene] RESUMED', {
        pauseCount: window.__signals__.pauseCount,
        frameCount: this.frameCount
      });
    }
  }

  update(time, delta) {
    // 更新帧计数
    this.frameCount++;
    this.frameText.setText(`Frame: ${this.frameCount}`);
    window.__signals__.frameCount = this.frameCount;

    // 更新小球位置（模拟游戏运行）
    const deltaSeconds = delta / 1000;
    this.ball.x += this.ball.vx * deltaSeconds;
    this.ball.y += this.ball.vy * deltaSeconds;

    // 边界反弹
    if (this.ball.x <= 20 || this.ball.x >= 780) {
      this.ball.vx *= -1;
      this.ball.x = Phaser.Math.Clamp(this.ball.x, 20, 780);
    }
    if (this.ball.y <= 20 || this.ball.y >= 580) {
      this.ball.vy *= -1;
      this.ball.y = Phaser.Math.Clamp(this.ball.y, 20, 580);
    }

    // 更新信号
    window.__signals__.ballPosition = {
      x: Math.round(this.ball.x),
      y: Math.round(this.ball.y)
    };
  }
}

// Phaser游戏配置
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

// 导出游戏实例用于测试
window.__game__ = game;

console.log('[Game] Initialized - Press W/A/S/D to pause/resume the game');