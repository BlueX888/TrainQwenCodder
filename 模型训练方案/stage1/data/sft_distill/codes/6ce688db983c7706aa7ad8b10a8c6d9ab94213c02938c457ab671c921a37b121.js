// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false; // 状态信号，用于验证暂停状态
    this.score = 0; // 额外的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建移动的小球（用于展示游戏运行状态）
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0xff6b6b, 1);
    ballGraphics.fillCircle(0, 0, 20);
    ballGraphics.generateTexture('ball', 40, 40);
    ballGraphics.destroy();

    this.ball = this.add.sprite(100, 300, 'ball');
    this.ball.setVelocity = { x: 200, y: 150 }; // 模拟速度

    // 创建分数显示
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 创建提示文字
    this.hintText = this.add.text(400, 550, 'Click to Pause/Resume', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.togglePause();
      }
    });

    // 启动暂停覆盖层场景（初始隐藏）
    this.scene.launch('PauseOverlay');
    this.scene.get('PauseOverlay').setVisible(false);
  }

  update(time, delta) {
    if (this.isPaused) {
      return; // 暂停时不更新
    }

    // 更新小球位置
    const velocity = this.ball.setVelocity;
    this.ball.x += velocity.x * delta / 1000;
    this.ball.y += velocity.y * delta / 1000;

    // 边界反弹
    if (this.ball.x <= 20 || this.ball.x >= 780) {
      velocity.x *= -1;
      this.ball.x = Phaser.Math.Clamp(this.ball.x, 20, 780);
    }
    if (this.ball.y <= 20 || this.ball.y >= 580) {
      velocity.y *= -1;
      this.ball.y = Phaser.Math.Clamp(this.ball.y, 20, 580);
    }

    // 更新分数（每秒增加1分）
    this.score += delta / 1000;
    this.scoreText.setText('Score: ' + Math.floor(this.score));
  }

  togglePause() {
    const pauseScene = this.scene.get('PauseOverlay');
    
    if (this.isPaused) {
      // 继续游戏
      this.isPaused = false;
      pauseScene.setVisible(false);
      console.log('Game Resumed - isPaused:', this.isPaused);
    } else {
      // 暂停游戏
      this.isPaused = true;
      pauseScene.setVisible(true);
      console.log('Game Paused - isPaused:', this.isPaused);
    }
  }
}

// 暂停覆盖层场景
class PauseOverlay extends Phaser.Scene {
  constructor() {
    super('PauseOverlay');
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建半透明绿色覆盖层
    const overlay = this.add.graphics();
    overlay.fillStyle(0x00ff00, 0.3); // 绿色，30%透明度
    overlay.fillRect(0, 0, 800, 600);

    // 创建深色背景框
    const boxWidth = 400;
    const boxHeight = 200;
    const boxX = (800 - boxWidth) / 2;
    const boxY = (600 - boxHeight) / 2;

    const box = this.add.graphics();
    box.fillStyle(0x003300, 0.8); // 深绿色背景
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 20);

    // 创建 "PAUSED" 文字
    this.pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '72px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#003300',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 创建提示文字
    this.hintText = this.add.text(400, 370, 'Click to Resume', {
      fontSize: '24px',
      color: '#88ff88'
    }).setOrigin(0.5);

    // 添加脉动效果
    this.tweens.add({
      targets: this.pausedText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 监听鼠标点击事件（传递给主场景）
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        const gameScene = this.scene.get('GameScene');
        gameScene.togglePause();
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: [GameScene, PauseOverlay],
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);