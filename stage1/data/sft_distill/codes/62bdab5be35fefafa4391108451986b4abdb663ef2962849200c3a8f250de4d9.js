class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformsPassed = 0;
    this.gameOver = false;
    this.totalPlatforms = 15;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(false);
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });

    // 创建15个移动平台，形成路径
    const platformConfigs = [
      { x: 100, y: 200, direction: 1, range: 100 },
      { x: 250, y: 250, direction: -1, range: 120 },
      { x: 400, y: 220, direction: 1, range: 80 },
      { x: 550, y: 280, direction: -1, range: 100 },
      { x: 700, y: 240, direction: 1, range: 90 },
      { x: 200, y: 340, direction: -1, range: 110 },
      { x: 350, y: 380, direction: 1, range: 100 },
      { x: 500, y: 350, direction: -1, range: 120 },
      { x: 650, y: 400, direction: 1, range: 80 },
      { x: 300, y: 460, direction: -1, range: 100 },
      { x: 450, y: 480, direction: 1, range: 90 },
      { x: 600, y: 450, direction: -1, range: 110 },
      { x: 250, y: 540, direction: 1, range: 100 },
      { x: 400, y: 560, direction: -1, range: 80 },
      { x: 550, y: 530, direction: 1, range: 100 }
    ];

    platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.x, config.y, 'platform');
      platform.body.immovable = true;
      platform.body.allowGravity = false;
      platform.setVelocityX(80 * config.direction);
      
      // 存储平台的移动参数
      platform.startX = config.x;
      platform.direction = config.direction;
      platform.range = config.range;
      platform.platformIndex = index;
      platform.touched = false;
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollision, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ff0000',
      backgroundColor: '#fff',
      padding: { x: 20, y: 10 }
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
  }

  onPlatformCollision(player, platform) {
    // 记录首次接触的平台
    if (!platform.touched) {
      platform.touched = true;
      this.platformsPassed = Math.max(this.platformsPassed, platform.platformIndex + 1);
      this.updateStatusText();

      // 检查是否通过所有平台
      if (this.platformsPassed >= this.totalPlatforms) {
        this.winGame();
      }
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Platforms Passed: ${this.platformsPassed}/${this.totalPlatforms}\n` +
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    );
  }

  winGame() {
    if (!this.gameOver) {
      this.gameOver = true;
      this.gameOverText.setText('YOU WIN!\nPassed all platforms!');
      this.gameOverText.setStyle({ fill: '#00ff00' });
      this.gameOverText.setVisible(true);
      this.physics.pause();
    }
  }

  loseGame() {
    if (!this.gameOver) {
      this.gameOver = true;
      this.gameOverText.setText('GAME OVER!\nFell off the platforms!');
      this.gameOverText.setVisible(true);
      this.physics.pause();
    }
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新平台移动（往返运动）
    this.platforms.children.entries.forEach(platform => {
      // 检查是否超出移动范围
      if (platform.direction > 0) {
        if (platform.x >= platform.startX + platform.range) {
          platform.direction = -1;
          platform.setVelocityX(-80);
        }
      } else {
        if (platform.x <= platform.startX - platform.range) {
          platform.direction = 1;
          platform.setVelocityX(80);
        }
      }
    });

    // 玩家左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只有在平台上时才能跳）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 检查玩家是否掉落
    if (this.player.y > 650) {
      this.loseGame();
    }

    // 更新状态文本
    this.updateStatusText();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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