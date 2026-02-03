class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformsPassed = 0;
    this.gameState = 'playing'; // playing, won, lost
    this.currentPlatformIndex = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x0000ff, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();

    // 创建终点纹理
    const goalGraphics = this.add.graphics();
    goalGraphics.fillStyle(0xffff00, 1);
    goalGraphics.fillRect(0, 0, 60, 60);
    goalGraphics.generateTexture('goal', 60, 60);
    goalGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(false);
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 创建10个移动平台
    const platformConfigs = [
      { x: 100, y: 200, direction: 1, minX: 50, maxX: 250 },
      { x: 300, y: 250, direction: -1, minX: 250, maxX: 450 },
      { x: 500, y: 200, direction: 1, minX: 450, maxX: 650 },
      { x: 700, y: 280, direction: -1, minX: 600, maxX: 750 },
      { x: 400, y: 350, direction: 1, minX: 300, maxX: 500 },
      { x: 200, y: 420, direction: -1, minX: 100, maxX: 300 },
      { x: 600, y: 400, direction: 1, minX: 500, maxX: 700 },
      { x: 350, y: 480, direction: -1, minX: 250, maxX: 450 },
      { x: 650, y: 520, direction: 1, minX: 550, maxX: 750 },
      { x: 400, y: 560, direction: -1, minX: 300, maxX: 500 }
    ];

    platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.x, config.y, 'platform');
      platform.body.setVelocityX(80 * config.direction);
      platform.setData('minX', config.minX);
      platform.setData('maxX', config.maxX);
      platform.setData('direction', config.direction);
      platform.setData('index', index);
    });

    // 创建终点
    this.goal = this.physics.add.sprite(400, 600, 'goal');
    this.goal.body.setAllowGravity(false);
    this.goal.body.setImmovable(true);

    // 碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollide, null, this);
    this.physics.add.overlap(this.player, this.goal, this.onGoalReached, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(100);

    // 游戏提示
    this.hintText = this.add.text(400, 50, 'Press SPACE or UP to Jump\nReach the yellow goal!', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      align: 'center'
    });
    this.hintText.setOrigin(0.5);
    this.hintText.setScrollFactor(0);

    this.updateStatusText();
  }

  update(time, delta) {
    if (this.gameState !== 'playing') {
      return;
    }

    // 更新平台移动
    this.platforms.children.entries.forEach(platform => {
      const minX = platform.getData('minX');
      const maxX = platform.getData('maxX');
      const direction = platform.getData('direction');

      if (platform.x <= minX && direction === -1) {
        platform.body.setVelocityX(80);
        platform.setData('direction', 1);
      } else if (platform.x >= maxX && direction === 1) {
        platform.body.setVelocityX(-80);
        platform.setData('direction', -1);
      }
    });

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if ((Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
         Phaser.Input.Keyboard.JustDown(this.spaceKey)) && 
        this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检查是否掉落
    if (this.player.y > 700) {
      this.gameOver(false);
    }

    this.updateStatusText();
  }

  onPlatformCollide(player, platform) {
    const platformIndex = platform.getData('index');
    if (platformIndex > this.currentPlatformIndex) {
      this.currentPlatformIndex = platformIndex;
      this.platformsPassed = this.currentPlatformIndex + 1;
    }
  }

  onGoalReached(player, goal) {
    if (this.gameState === 'playing') {
      this.gameOver(true);
    }
  }

  gameOver(won) {
    this.gameState = won ? 'won' : 'lost';
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    const message = won ? 
      'YOU WIN!\nPlatforms Passed: ' + this.platformsPassed : 
      'GAME OVER!\nYou fell off!';

    const resultText = this.add.text(400, 300, message, {
      fontSize: '32px',
      fill: won ? '#00ff00' : '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    });
    resultText.setOrigin(0.5);
    resultText.setScrollFactor(0);
    resultText.setDepth(101);

    // 重启提示
    this.time.delayedCall(1000, () => {
      const restartText = this.add.text(400, 380, 'Press R to Restart', {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      restartText.setOrigin(0.5);
      restartText.setScrollFactor(0);
      restartText.setDepth(101);

      this.input.keyboard.once('keydown-R', () => {
        this.scene.restart();
      });
    });
  }

  updateStatusText() {
    this.statusText.setText(
      `State: ${this.gameState.toUpperCase()}\n` +
      `Platforms Passed: ${this.platformsPassed}/10\n` +
      `Player Y: ${Math.floor(this.player.y)}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);