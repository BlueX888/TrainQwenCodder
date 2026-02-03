// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      pauseCount: 0,
      resumeCount: 0,
      currentState: 'running',
      events: []
    };

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建移动的小球（用于验证游戏是否在运行）
    this.ball = this.add.graphics();
    this.ball.fillStyle(0x00ff00, 1);
    this.ball.fillCircle(0, 0, 20);
    this.ball.x = 100;
    this.ball.y = 300;
    this.ballVelocity = { x: 3, y: 2 };

    // 添加说明文本
    this.add.text(10, 10, 'Click Left Mouse Button to Pause/Resume', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 创建暂停覆盖层（初始隐藏）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0xffff00, 0.7); // 黄色半透明
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setVisible(false);
    this.pauseOverlay.setDepth(100); // 确保在最上层

    // 创建暂停文本（初始隐藏）
    this.pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      color: '#000000',
      fontStyle: 'bold'
    });
    this.pausedText.setOrigin(0.5);
    this.pausedText.setVisible(false);
    this.pausedText.setDepth(101); // 确保在覆盖层之上

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.togglePause();
      }
    });

    console.log('[GameScene] Game started - running');
  }

  update(time, delta) {
    // 更新小球位置（只有在游戏运行时才会执行）
    this.ball.x += this.ballVelocity.x;
    this.ball.y += this.ballVelocity.y;

    // 边界检测和反弹
    if (this.ball.x <= 20 || this.ball.x >= 780) {
      this.ballVelocity.x *= -1;
    }
    if (this.ball.y <= 20 || this.ball.y >= 580) {
      this.ballVelocity.y *= -1;
    }
  }

  togglePause() {
    if (this.isPaused) {
      // 继续游戏
      this.scene.resume();
      this.pauseOverlay.setVisible(false);
      this.pausedText.setVisible(false);
      this.isPaused = false;

      // 记录信号
      window.__signals__.resumeCount++;
      window.__signals__.currentState = 'running';
      window.__signals__.events.push({
        type: 'resume',
        timestamp: Date.now()
      });

      console.log('[GameScene] Game resumed');
    } else {
      // 暂停游戏
      this.scene.pause();
      this.pauseOverlay.setVisible(true);
      this.pausedText.setVisible(true);
      this.isPaused = true;

      // 记录信号
      window.__signals__.pauseCount++;
      window.__signals__.currentState = 'paused';
      window.__signals__.events.push({
        type: 'pause',
        timestamp: Date.now(),
        ballPosition: { x: this.ball.x, y: this.ball.y }
      });

      console.log('[GameScene] Game paused');
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出游戏实例供测试使用
window.__game__ = game;