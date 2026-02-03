class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0;
    this.survivalTime = 0;
    this.isGameOver = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff6600, 1);
    platformGraphics.fillRect(0, 0, 150, 20);
    platformGraphics.generateTexture('platform', 150, 20);
    platformGraphics.destroy();
  }

  create() {
    // 状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 创建玩家
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });

    // 创建3个移动平台，形成路径
    const platformConfigs = [
      { x: 200, y: 500 },
      { x: 450, y: 450 },
      { x: 700, y: 400 }
    ];

    platformConfigs.forEach(config => {
      const platform = this.platforms.create(config.x, config.y, 'platform');
      platform.body.setVelocityX(-160);
      platform.startX = config.x;
    });

    // 玩家与平台碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 地面平台（初始站立位置）
    const ground = this.platforms.create(100, 550, 'platform');
    ground.body.setVelocityX(0);
    ground.setScale(1.5, 1);
    ground.refreshBody();

    // 游戏提示
    this.add.text(400, 100, 'Press SPACE to Jump', {
      fontSize: '24px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    this.add.text(400, 140, 'Survive as long as possible!', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;

    // 跳跃控制
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
    }

    // 平台循环逻辑
    this.platforms.children.entries.forEach(platform => {
      if (platform.body.velocity.x !== 0) { // 排除地面平台
        // 平台移出左边界后重置到右边
        if (platform.x < -100) {
          platform.x = 900;
          // 随机调整高度增加难度
          const randomY = Phaser.Math.Between(350, 500);
          platform.y = randomY;
        }
      }
    });

    // 检测玩家掉落
    if (this.player.y > 600) {
      this.isGameOver = true;
      this.gameOver();
    }

    // 更新状态显示
    this.statusText.setText([
      `Jumps: ${this.jumpCount}`,
      `Time: ${(this.survivalTime / 1000).toFixed(1)}s`,
      `Player Y: ${Math.floor(this.player.y)}`
    ]);
  }

  gameOver() {
    this.physics.pause();
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000'
    }).setOrigin(0.5);

    this.add.text(400, 360, `Total Jumps: ${this.jumpCount}`, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 400, `Survival Time: ${(this.survivalTime / 1000).toFixed(1)}s`, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 450, 'Refresh to Restart', {
      fontSize: '18px',
      fill: '#ffff00'
    }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);