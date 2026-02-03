class PlatformJumpScene extends Phaser.Scene {
  constructor() {
    super('PlatformJumpScene');
    this.signals = {
      jumps: 0,
      platformTouches: 0,
      survivalTime: 0,
      isAlive: true,
      currentPlatform: -1
    };
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
    platformGraphics.fillStyle(0xff6600, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();
  }

  create() {
    // 暴露信号到全局
    window.__signals__ = this.signals;

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 创建8个移动平台，组成路径
    const platformConfigs = [
      { x: 100, y: 500, velocityX: 200, velocityY: 0 },
      { x: 300, y: 450, velocityX: 0, velocityY: -150 },
      { x: 500, y: 350, velocityX: 200, velocityY: 0 },
      { x: 700, y: 300, velocityX: 0, velocityY: 150 },
      { x: 650, y: 500, velocityX: -200, velocityY: 0 },
      { x: 450, y: 550, velocityX: 0, velocityY: -150 },
      { x: 250, y: 400, velocityX: -200, velocityY: 0 },
      { x: 100, y: 350, velocityX: 0, velocityY: 150 }
    ];

    platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.x, config.y, 'platform');
      platform.setVelocity(config.velocityX, config.velocityY);
      platform.body.setSize(120, 20);
      platform.platformId = index;
      
      // 存储移动范围
      platform.startX = config.x;
      platform.startY = config.y;
      platform.velocityConfig = { x: config.velocityX, y: config.velocityY };
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, (player, platform) => {
      if (player.body.touching.down) {
        if (this.signals.currentPlatform !== platform.platformId) {
          this.signals.platformTouches++;
          this.signals.currentPlatform = platform.platformId;
          console.log(JSON.stringify({
            event: 'platform_touch',
            platformId: platform.platformId,
            totalTouches: this.signals.platformTouches,
            time: this.signals.survivalTime
          }));
        }
      }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 计时器
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.signals.isAlive) {
          this.signals.survivalTime += 0.1;
        }
      },
      loop: true
    });

    // 添加文本显示
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加地面（防止玩家掉落）
    const ground = this.add.rectangle(400, 590, 800, 20, 0x8b4513);
    this.physics.add.existing(ground, true);
    this.physics.add.collider(this.player, ground);

    console.log(JSON.stringify({
      event: 'game_start',
      platformCount: 8,
      platformSpeed: 200
    }));
  }

  update(time, delta) {
    if (!this.signals.isAlive) return;

    // 玩家左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
      this.signals.jumps++;
      console.log(JSON.stringify({
        event: 'jump',
        jumpCount: this.signals.jumps,
        position: { x: Math.floor(this.player.x), y: Math.floor(this.player.y) }
      }));
    }

    // 更新平台循环移动
    this.platforms.children.entries.forEach(platform => {
      const body = platform.body;
      const config = platform.velocityConfig;

      // 水平移动边界检测
      if (config.x !== 0) {
        if (config.x > 0 && platform.x > 750) {
          platform.x = 50;
        } else if (config.x < 0 && platform.x < 50) {
          platform.x = 750;
        }
      }

      // 垂直移动边界检测
      if (config.y !== 0) {
        if (config.y > 0 && platform.y > 550) {
          platform.setVelocityY(-Math.abs(config.y));
          platform.velocityConfig.y = -Math.abs(config.y);
        } else if (config.y < 0 && platform.y < 250) {
          platform.setVelocityY(Math.abs(config.y));
          platform.velocityConfig.y = Math.abs(config.y);
        }
      }
    });

    // 检查玩家是否掉落
    if (this.player.y > 600) {
      this.signals.isAlive = false;
      console.log(JSON.stringify({
        event: 'game_over',
        finalStats: this.signals
      }));
    }

    // 更新信息显示
    this.infoText.setText([
      `Jumps: ${this.signals.jumps}`,
      `Platform Touches: ${this.signals.platformTouches}`,
      `Time: ${this.signals.survivalTime.toFixed(1)}s`,
      `Status: ${this.signals.isAlive ? 'Playing' : 'Game Over'}`,
      `\nControls: Arrow Keys / SPACE to jump`
    ]);

    // 如果玩家不在平台上，重置当前平台ID
    if (!this.player.body.touching.down) {
      this.signals.currentPlatform = -1;
    }
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
  scene: PlatformJumpScene
};

const game = new Phaser.Game(config);