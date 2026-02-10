class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0;
    this.movingObject = null;
    this.scoreText = null;
    this.pauseOverlay = null;
    this.pauseText = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建移动的游戏对象（用于验证暂停效果）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.generateTexture('ball', 40, 40);
    graphics.destroy();

    this.movingObject = this.add.sprite(100, 300, 'ball');
    this.movingObject.setVelocity = function(x, y) {
      this.vx = x;
      this.vy = y;
    };
    this.movingObject.vx = 200;
    this.movingObject.vy = 150;
    this.movingObject.setVelocity(200, 150);

    // 创建分数显示
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建说明文字
    this.add.text(20, 60, 'Press SPACE to pause/resume', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });

    // 创建暂停覆盖层（初始隐藏）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x000000, 0.7);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建暂停文字
    this.pauseText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(101);
    this.pauseText.setVisible(false);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 使用 on 事件监听按键按下
    this.spaceKey.on('down', () => {
      this.togglePause();
    });

    // 添加边界碰撞增加分数
    this.time.addEvent({
      delay: 100,
      callback: this.updateScore,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    // 只在未暂停时更新游戏逻辑
    if (!this.isPaused && this.movingObject) {
      // 移动物体
      this.movingObject.x += this.movingObject.vx * (delta / 1000);
      this.movingObject.y += this.movingObject.vy * (delta / 1000);

      // 边界反弹
      if (this.movingObject.x <= 20 || this.movingObject.x >= 780) {
        this.movingObject.vx *= -1;
        this.score += 10;
        this.updateScoreDisplay();
      }
      if (this.movingObject.y <= 20 || this.movingObject.y >= 580) {
        this.movingObject.vy *= -1;
        this.score += 10;
        this.updateScoreDisplay();
      }
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.scene.pause();
      this.pauseOverlay.setVisible(true);
      this.pauseText.setVisible(true);
      
      // 输出状态用于验证
      console.log('Game PAUSED - Score:', this.score, 'Object position:', 
        Math.round(this.movingObject.x), Math.round(this.movingObject.y));
    } else {
      // 继续游戏
      this.scene.resume();
      this.pauseOverlay.setVisible(false);
      this.pauseText.setVisible(false);
      
      // 输出状态用于验证
      console.log('Game RESUMED - Score:', this.score, 'Object position:', 
        Math.round(this.movingObject.x), Math.round(this.movingObject.y));
    }
  }

  updateScore() {
    if (!this.isPaused) {
      this.score += 1;
      this.updateScoreDisplay();
    }
  }

  updateScoreDisplay() {
    if (this.scoreText) {
      this.scoreText.setText('Score: ' + this.score);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    isPaused: scene.isPaused,
    score: scene.score,
    objectX: Math.round(scene.movingObject.x),
    objectY: Math.round(scene.movingObject.y)
  };
};