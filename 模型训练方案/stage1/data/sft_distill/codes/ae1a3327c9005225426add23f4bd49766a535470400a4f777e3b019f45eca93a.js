// 初始化信号记录
window.__signals__ = {
  pauseCount: 0,
  resumeCount: 0,
  isPaused: false,
  keyPresses: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.pauseOverlay = null;
    this.pauseText = null;
    this.ball = null;
    this.ballVelocity = { x: 2, y: 1.5 };
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建移动的小球作为游戏运行的视觉标志
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ballTex', 32, 32);
    graphics.destroy();

    this.ball = this.add.sprite(400, 300, 'ballTex');
    
    // 添加边界文字提示
    const instructionText = this.add.text(400, 50, 'Press W/A/S/D to Pause/Resume', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    });
    instructionText.setOrigin(0.5);

    // 添加状态文字
    this.statusText = this.add.text(400, 550, 'Status: Running', {
      fontSize: '20px',
      color: '#00ff00',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 监听WASD键
    const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 为每个键绑定事件
    keyW.on('down', () => this.togglePause('W'));
    keyA.on('down', () => this.togglePause('A'));
    keyS.on('down', () => this.togglePause('S'));
    keyD.on('down', () => this.togglePause('D'));

    console.log('Game created. Press W/A/S/D to pause/resume.');
  }

  update(time, delta) {
    // 只在非暂停状态下更新小球位置
    if (!this.isPaused && this.ball) {
      this.ball.x += this.ballVelocity.x;
      this.ball.y += this.ballVelocity.y;

      // 边界反弹
      if (this.ball.x <= 16 || this.ball.x >= 784) {
        this.ballVelocity.x *= -1;
      }
      if (this.ball.y <= 16 || this.ball.y >= 584) {
        this.ballVelocity.y *= -1;
      }

      // 限制在边界内
      this.ball.x = Phaser.Math.Clamp(this.ball.x, 16, 784);
      this.ball.y = Phaser.Math.Clamp(this.ball.y, 16, 584);
    }
  }

  togglePause(key) {
    // 记录按键
    window.__signals__.keyPresses.push({
      key: key,
      timestamp: Date.now()
    });

    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  pauseGame() {
    this.isPaused = true;
    window.__signals__.isPaused = true;
    window.__signals__.pauseCount++;

    // 创建紫色半透明覆盖层
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x800080, 0.7); // 紫色，70%透明度
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(1000); // 确保在最上层

    // 创建"PAUSED"文字
    this.pauseText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '72px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(1001); // 在覆盖层之上

    // 添加提示文字
    const resumeHint = this.add.text(400, 380, 'Press W/A/S/D to Resume', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    });
    resumeHint.setOrigin(0.5);
    resumeHint.setDepth(1001);
    this.pauseResumeHint = resumeHint;

    // 更新状态文字
    this.statusText.setText('Status: PAUSED');
    this.statusText.setColor('#ff00ff');

    console.log('Game paused. Pause count:', window.__signals__.pauseCount);
  }

  resumeGame() {
    this.isPaused = false;
    window.__signals__.isPaused = false;
    window.__signals__.resumeCount++;

    // 移除覆盖层和文字
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }
    if (this.pauseText) {
      this.pauseText.destroy();
      this.pauseText = null;
    }
    if (this.pauseResumeHint) {
      this.pauseResumeHint.destroy();
      this.pauseResumeHint = null;
    }

    // 更新状态文字
    this.statusText.setText('Status: Running');
    this.statusText.setColor('#00ff00');

    console.log('Game resumed. Resume count:', window.__signals__.resumeCount);
  }
}

// Phaser 游戏配置
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

// 输出初始信号状态
console.log('Initial signals:', JSON.stringify(window.__signals__, null, 2));