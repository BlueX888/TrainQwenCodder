class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0;
    this.pauseOverlay = null;
    this.pauseText = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建移动的小球（游戏运行的视觉反馈）
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0x00ff00, 1);
    ballGraphics.fillCircle(0, 0, 20);
    ballGraphics.generateTexture('ball', 40, 40);
    ballGraphics.destroy();

    this.ball = this.add.sprite(100, 300, 'ball');
    this.ball.setVelocity = function(vx, vy) {
      this.vx = vx;
      this.vy = vy;
    };
    this.ball.vx = 200;
    this.ball.vy = 150;
    this.ball.setVelocity(200, 150);

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 显示操作提示
    this.add.text(16, 50, 'Press SPACE to Pause/Resume', {
      fontSize: '18px',
      color: '#aaaaaa'
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 使用 on 事件监听按键按下
    this.spaceKey.on('down', () => {
      this.togglePause();
    });

    // 分数计时器（每秒增加10分）
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      },
      loop: true
    });
  }

  update(time, delta) {
    if (this.isPaused) {
      return; // 暂停时不更新游戏逻辑
    }

    // 更新小球位置
    this.ball.x += this.ball.vx * delta / 1000;
    this.ball.y += this.ball.vy * delta / 1000;

    // 边界反弹
    if (this.ball.x <= 20 || this.ball.x >= 780) {
      this.ball.vx *= -1;
      this.ball.x = Phaser.Math.Clamp(this.ball.x, 20, 780);
    }
    if (this.ball.y <= 20 || this.ball.y >= 580) {
      this.ball.vy *= -1;
      this.ball.y = Phaser.Math.Clamp(this.ball.y, 20, 580);
    }
  }

  togglePause() {
    if (!this.isPaused) {
      // 暂停游戏
      this.isPaused = true;
      
      // 创建灰色半透明覆盖层
      this.pauseOverlay = this.add.graphics();
      this.pauseOverlay.fillStyle(0x000000, 0.7);
      this.pauseOverlay.fillRect(0, 0, 800, 600);
      this.pauseOverlay.setDepth(1000); // 确保在最上层

      // 创建 PAUSED 文字
      this.pauseText = this.add.text(400, 300, 'PAUSED', {
        fontSize: '64px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      this.pauseText.setOrigin(0.5, 0.5);
      this.pauseText.setDepth(1001);

      // 添加继续提示
      this.pauseHintText = this.add.text(400, 370, 'Press SPACE to Resume', {
        fontSize: '24px',
        color: '#aaaaaa'
      });
      this.pauseHintText.setOrigin(0.5, 0.5);
      this.pauseHintText.setDepth(1001);

      // 暂停场景（停止 update 和 timers）
      this.scene.pause();
      
      // 但保持输入监听活跃，所以立即恢复
      this.scene.resume();
      
      console.log('Game Paused - Score:', this.score);
    } else {
      // 继续游戏
      this.isPaused = false;
      
      // 移除覆盖层和文字
      if (this.pauseOverlay) {
        this.pauseOverlay.destroy();
        this.pauseOverlay = null;
      }
      if (this.pauseText) {
        this.pauseText.destroy();
        this.pauseText = null;
      }
      if (this.pauseHintText) {
        this.pauseHintText.destroy();
        this.pauseHintText = null;
      }

      console.log('Game Resumed - Score:', this.score);
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

// 导出状态用于验证（可选）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    isPaused: scene.isPaused,
    score: scene.score,
    ballPosition: {
      x: scene.ball.x,
      y: scene.ball.y
    }
  };
};