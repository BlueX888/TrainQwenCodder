class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0;
    this.currentPlatform = 0;
    this.isOnGround = false;
    this.gameWon = false;
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
    platformGraphics.fillRect(0, 0, 100, 20);
    platformGraphics.generateTexture('platform', 100, 20);
    platformGraphics.destroy();

    // 创建目标平台纹理
    const goalGraphics = this.add.graphics();
    goalGraphics.fillStyle(0xffff00, 1);
    goalGraphics.fillRect(0, 0, 120, 20);
    goalGraphics.generateTexture('goal', 120, 20);
    goalGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.physics.world.gravity.y = 800;

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 平台配置：8个移动平台
    const platformConfigs = [
      { x: 100, y: 550, vx: 80, vy: 0, rangeX: 150, rangeY: 0 },
      { x: 250, y: 480, vx: 0, vy: 80, rangeX: 0, rangeY: 100 },
      { x: 400, y: 420, vx: -80, vy: 0, rangeX: 120, rangeY: 0 },
      { x: 520, y: 350, vx: 0, vy: -80, rangeX: 0, rangeY: 80 },
      { x: 380, y: 280, vx: 80, vy: 0, rangeX: 140, rangeY: 0 },
      { x: 250, y: 220, vx: 0, vy: 80, rangeX: 0, rangeY: 90 },
      { x: 450, y: 160, vx: -80, vy: 0, rangeX: 100, rangeY: 0 },
      { x: 600, y: 100, vx: 0, vy: 0, rangeX: 0, rangeY: 0, isGoal: true }
    ];

    this.platformObjects = [];
    platformConfigs.forEach((config, index) => {
      const texture = config.isGoal ? 'goal' : 'platform';
      const platform = this.platforms.create(config.x, config.y, texture);
      platform.body.setVelocity(config.vx, config.vy);
      
      // 存储平台的初始位置和移动范围
      platform.startX = config.x;
      platform.startY = config.y;
      platform.vx = config.vx;
      platform.vy = config.vy;
      platform.rangeX = config.rangeX;
      platform.rangeY = config.rangeY;
      platform.isGoal = config.isGoal || false;
      
      this.platformObjects.push(platform);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollision, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // UI文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });

    this.updateInfoText();

    // 胜利文本（初始隐藏）
    this.winText = this.add.text(400, 300, 'YOU WIN!', {
      fontSize: '48px',
      fill: '#FFD700',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);
  }

  onPlatformCollision(player, platform) {
    // 检测玩家是否从上方落在平台上
    if (player.body.touching.down && platform.body.touching.up) {
      this.isOnGround = true;
      
      // 检测是否到达目标平台
      if (platform.isGoal && !this.gameWon) {
        this.gameWon = true;
        this.winText.setVisible(true);
        this.player.setVelocity(0, 0);
      }
    }
  }

  update(time, delta) {
    if (this.gameWon) {
      return;
    }

    // 更新平台位置
    this.platformObjects.forEach(platform => {
      if (platform.rangeX > 0) {
        // 水平移动
        if (Math.abs(platform.x - platform.startX) >= platform.rangeX) {
          platform.body.setVelocityX(-platform.body.velocity.x);
        }
      }
      
      if (platform.rangeY > 0) {
        // 垂直移动
        if (Math.abs(platform.y - platform.startY) >= platform.rangeY) {
          platform.body.setVelocityY(-platform.body.velocity.y);
        }
      }
    });

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isOnGround) {
      this.player.setVelocityY(-400);
      this.jumpCount++;
      this.isOnGround = false;
      this.updateInfoText();
    }

    // 检测是否离开地面
    if (!this.player.body.touching.down) {
      this.isOnGround = false;
    }

    // 玩家掉落重置
    if (this.player.y > 650) {
      this.player.setPosition(100, 500);
      this.player.setVelocity(0, 0);
      this.jumpCount = 0;
      this.updateInfoText();
    }

    this.updateInfoText();
  }

  updateInfoText() {
    const onGround = this.isOnGround ? 'YES' : 'NO';
    this.infoText.setText(
      `Jumps: ${this.jumpCount}\n` +
      `On Ground: ${onGround}\n` +
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})\n` +
      `Goal: Reach yellow platform!`
    );
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