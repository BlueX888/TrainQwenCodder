class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建游戏状态变量（可验证）
    this.score = 0;
    
    // 创建分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 创建移动的方块（用于展示游戏运行状态）
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 50, 50);
    graphics.generateTexture('playerBox', 50, 50);
    graphics.destroy();

    this.player = this.add.sprite(400, 300, 'playerBox');
    this.player.setVelocity = { x: 2, y: 1.5 }; // 模拟速度

    // 创建暂停覆盖层（初始隐藏）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x00ffff, 0.7); // 青色半透明
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建暂停文字
    this.pauseText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setDepth(101);
    this.pauseText.setVisible(false);

    // 监听WASD按键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 为每个按键添加按下事件监听
    this.keyW.on('down', () => this.togglePause());
    this.keyA.on('down', () => this.togglePause());
    this.keyS.on('down', () => this.togglePause());
    this.keyD.on('down', () => this.togglePause());

    // 添加提示文字
    this.add.text(16, 560, 'Press W/A/S/D to Pause/Resume', {
      fontSize: '18px',
      color: '#ffff00'
    });

    // 计时器用于增加分数（验证游戏是否真正暂停）
    this.time.addEvent({
      delay: 1000,
      callback: this.incrementScore,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    // 只有在非暂停状态下才更新游戏逻辑
    if (!this.isPaused) {
      // 移动方块
      this.player.x += this.player.setVelocity.x;
      this.player.y += this.player.setVelocity.y;

      // 边界检测和反弹
      if (this.player.x > 775 || this.player.x < 25) {
        this.player.setVelocity.x *= -1;
      }
      if (this.player.y > 575 || this.player.y < 25) {
        this.player.setVelocity.y *= -1;
      }
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.scene.pause();
      
      // 显示覆盖层和文字
      this.pauseOverlay.setVisible(true);
      this.pauseText.setVisible(true);
      
      console.log('Game Paused - Score:', this.score);
    } else {
      // 继续游戏
      this.scene.resume();
      
      // 隐藏覆盖层和文字
      this.pauseOverlay.setVisible(false);
      this.pauseText.setVisible(false);
      
      console.log('Game Resumed - Score:', this.score);
    }
  }

  incrementScore() {
    // 只有在非暂停状态下才增加分数
    if (!this.isPaused) {
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);