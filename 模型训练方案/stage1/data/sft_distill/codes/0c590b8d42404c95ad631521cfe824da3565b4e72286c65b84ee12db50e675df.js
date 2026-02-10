// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false; // 可验证的状态变量
    this.score = 0; // 可验证的游戏状态
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建移动的小球（用于验证游戏是否暂停）
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0xff6b6b, 1);
    ballGraphics.fillCircle(0, 0, 20);
    ballGraphics.generateTexture('ball', 40, 40);
    ballGraphics.destroy();

    this.ball = this.physics.add.sprite(400, 300, 'ball');
    this.ball.setVelocity(200, 150);
    this.ball.setBounce(1, 1);
    this.ball.setCollideWorldBounds(true);

    // 显示分数（用于验证游戏状态）
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 显示提示文字
    this.add.text(400, 550, 'Click Left Mouse Button to Pause/Resume', {
      fontSize: '18px',
      fill: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 显示状态指示器
    this.statusText = this.add.text(400, 50, 'RUNNING', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.togglePause();
      }
    });

    // 启动暂停覆盖层场景（初始隐藏）
    this.scene.launch('PauseScene');
    this.scene.get('PauseScene').setVisible(false);
  }

  update(time, delta) {
    // 更新分数（基于时间，用于验证游戏是否在运行）
    if (!this.isPaused) {
      this.score += delta * 0.01;
      this.scoreText.setText('Score: ' + Math.floor(this.score));
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.scene.pause();
      this.scene.get('PauseScene').setVisible(true);
      console.log('Game Paused - isPaused:', this.isPaused);
    } else {
      // 恢复游戏
      this.scene.resume();
      this.scene.get('PauseScene').setVisible(false);
      console.log('Game Resumed - isPaused:', this.isPaused);
    }
  }
}

// 暂停覆盖层场景
class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建半透明绿色覆盖层
    const overlay = this.add.graphics();
    overlay.fillStyle(0x00ff00, 0.3);
    overlay.fillRect(0, 0, 800, 600);

    // 创建暂停文字背景
    const textBg = this.add.graphics();
    textBg.fillStyle(0x00aa00, 0.8);
    textBg.fillRoundedRect(250, 250, 300, 100, 20);

    // 创建 "PAUSED" 文字
    this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文字
    this.add.text(400, 370, 'Click to Resume', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 监听鼠标点击以恢复游戏
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
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [GameScene, PauseScene]
};

// 创建游戏实例
const game = new Phaser.Game(config);