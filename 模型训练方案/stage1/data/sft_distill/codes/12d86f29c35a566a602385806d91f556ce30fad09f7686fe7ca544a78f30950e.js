class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.gameTime = 0; // 状态信号：游戏运行时间
  }

  preload() {
    // 创建简单的纹理用于游戏对象
    const graphics = this.add.graphics();
    
    // 玩家纹理（绿色方块）
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    
    // 敌人纹理（红色圆形）
    graphics.clear();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('enemy', 32, 32);
    
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（带物理效果）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setVelocity(100, 50);
    this.player.setBounce(1, 1);

    // 创建多个运动的敌人
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 5; i++) {
      const enemy = this.enemies.create(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(100, 500),
        'enemy'
      );
      enemy.setVelocity(
        Phaser.Math.Between(-150, 150),
        Phaser.Math.Between(-150, 150)
      );
      enemy.setBounce(1, 1);
      enemy.setCollideWorldBounds(true);
    }

    // 显示游戏时间（状态信号）
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.timeText.setDepth(100);

    // 创建暂停覆盖层（初始隐藏）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x0000ff, 0.6);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(1000);
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
    this.pauseText.setDepth(1001);
    this.pauseText.setVisible(false);

    // 添加提示文字
    this.instructionText = this.add.text(400, 550, 'Press W/A/S/D to Pause/Resume', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5);
    this.instructionText.setDepth(100);

    // 监听WASD键
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 为每个键添加按下事件监听
    this.wKey.on('down', () => this.togglePause());
    this.aKey.on('down', () => this.togglePause());
    this.sKey.on('down', () => this.togglePause());
    this.dKey.on('down', () => this.togglePause());

    console.log('Game started. Press W/A/S/D to pause/resume.');
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.physics.pause();
      this.pauseOverlay.setVisible(true);
      this.pauseText.setVisible(true);
      console.log('Game PAUSED at time:', this.gameTime.toFixed(2) + 's');
    } else {
      // 继续游戏
      this.physics.resume();
      this.pauseOverlay.setVisible(false);
      this.pauseText.setVisible(false);
      console.log('Game RESUMED at time:', this.gameTime.toFixed(2) + 's');
    }
  }

  update(time, delta) {
    // 只在非暂停状态更新游戏时间
    if (!this.isPaused) {
      this.gameTime += delta / 1000;
      this.timeText.setText('Time: ' + this.gameTime.toFixed(1) + 's');
    }

    // 暂停时让"PAUSED"文字闪烁
    if (this.isPaused) {
      const alpha = (Math.sin(time / 200) + 1) / 2 * 0.5 + 0.5;
      this.pauseText.setAlpha(alpha);
    } else {
      this.pauseText.setAlpha(1);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);