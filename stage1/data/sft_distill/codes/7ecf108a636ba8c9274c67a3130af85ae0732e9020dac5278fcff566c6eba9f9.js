class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformsPassed = 0;
    this.totalPlatforms = 10;
    this.isGameOver = false;
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
    platformGraphics.fillStyle(0x8B4513, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();

    // 创建终点纹理
    const goalGraphics = this.add.graphics();
    goalGraphics.fillStyle(0xFFD700, 1);
    goalGraphics.fillRect(0, 0, 80, 80);
    goalGraphics.generateTexture('goal', 80, 80);
    goalGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravity(0, 800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 创建起始平台（静止）
    const startPlatform = this.platforms.create(100, 550, 'platform');
    startPlatform.body.setVelocityX(0);
    startPlatform.setData('minX', 50);
    startPlatform.setData('maxX', 150);
    startPlatform.setData('direction', 0);

    // 创建10个移动平台
    const platformPositions = [
      { x: 250, y: 480, minX: 200, maxX: 400 },
      { x: 450, y: 420, minX: 400, maxX: 600 },
      { x: 650, y: 360, minX: 550, maxX: 750 },
      { x: 200, y: 300, minX: 100, maxX: 350 },
      { x: 500, y: 250, minX: 400, maxX: 650 },
      { x: 700, y: 200, minX: 600, maxX: 750 },
      { x: 300, y: 150, minX: 200, maxX: 450 },
      { x: 550, y: 120, minX: 450, maxX: 700 },
      { x: 250, y: 80, minX: 150, maxX: 400 },
      { x: 600, y: 50, minX: 500, maxX: 700 }
    ];

    platformPositions.forEach((pos, index) => {
      const platform = this.platforms.create(pos.x, pos.y, 'platform');
      platform.setData('minX', pos.minX);
      platform.setData('maxX', pos.maxX);
      platform.setData('direction', 1);
      platform.setData('index', index + 1);
      platform.setData('passed', false);
      platform.body.setVelocityX(200);
    });

    // 创建终点
    this.goal = this.physics.add.sprite(650, 10, 'goal');
    this.goal.setImmovable(true);
    this.goal.body.setAllowGravity(false);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollision, null, this);
    this.physics.add.overlap(this.player, this.goal, this.onReachGoal, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });

    // 游戏说明
    this.add.text(400, 580, '方向键移动，空格/上键跳跃', {
      fontSize: '14px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 5, y: 3 }
    }).setOrigin(0.5);

    // 记录上一次站立的平台
    this.lastPlatformIndex = 0;
  }

  onPlatformCollision(player, platform) {
    // 检查玩家是否从上方落到平台上
    if (player.body.touching.down && platform.body.touching.up) {
      const platformIndex = platform.getData('index');
      if (platformIndex && !platform.getData('passed') && platformIndex > this.lastPlatformIndex) {
        platform.setData('passed', true);
        this.platformsPassed++;
        this.lastPlatformIndex = platformIndex;
      }
    }
  }

  onReachGoal(player, goal) {
    if (!this.isGameOver) {
      this.isGameOver = true;
      this.physics.pause();
      this.add.text(400, 300, '胜利！', {
        fontSize: '48px',
        fill: '#FFD700',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);
    }
  }

  update() {
    if (this.isGameOver) {
      return;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新平台移动
    this.platforms.getChildren().forEach(platform => {
      const minX = platform.getData('minX');
      const maxX = platform.getData('maxX');
      const direction = platform.getData('direction');

      if (direction !== 0) {
        if (platform.x <= minX && platform.body.velocity.x < 0) {
          platform.body.setVelocityX(200);
          platform.setData('direction', 1);
        } else if (platform.x >= maxX && platform.body.velocity.x > 0) {
          platform.body.setVelocityX(-200);
          platform.setData('direction', -1);
        }
      }
    });

    // 检查玩家是否掉落
    if (this.player.y > 620) {
      this.resetPlayer();
    }

    // 更新状态显示
    this.statusText.setText([
      `平台通过: ${this.platformsPassed}/${this.totalPlatforms}`,
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `速度: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `触地: ${this.player.body.touching.down ? '是' : '否'}`
    ]);
  }

  resetPlayer() {
    this.player.setPosition(100, 500);
    this.player.setVelocity(0, 0);
    this.platformsPassed = Math.max(0, this.platformsPassed - 1);
    this.lastPlatformIndex = 0;
    
    // 重置平台passed状态
    this.platforms.getChildren().forEach(platform => {
      platform.setData('passed', false);
    });
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