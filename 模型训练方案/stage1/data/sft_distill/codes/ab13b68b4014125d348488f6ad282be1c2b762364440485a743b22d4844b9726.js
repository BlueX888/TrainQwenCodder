class PlatformJumpScene extends Phaser.Scene {
  constructor() {
    super('PlatformJumpScene');
    this.platformsCrossed = 0;
    this.currentPlatformIndex = 0;
    this.gameCompleted = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0xff6600, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();

    // 创建目标区域纹理
    const goalGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    goalGraphics.fillStyle(0xffff00, 1);
    goalGraphics.fillRect(0, 0, 100, 40);
    goalGraphics.generateTexture('goal', 100, 40);
    goalGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 定义8个平台的路径配置
    const platformConfigs = [
      { startX: 50, startY: 200, endX: 200, endY: 200 },
      { startX: 250, startY: 250, endX: 400, endY: 250 },
      { startX: 450, startY: 200, endX: 600, endY: 200 },
      { startX: 650, startY: 300, endX: 750, endY: 300 },
      { startX: 700, startY: 400, endX: 550, endY: 400 },
      { startX: 500, startY: 450, endX: 350, endY: 450 },
      { startX: 300, startY: 500, endX: 150, endY: 500 },
      { startX: 100, startY: 550, endX: 250, endY: 550 }
    ];

    // 创建8个移动平台
    this.platformObjects = [];
    platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.startX, config.startY, 'platform');
      platform.body.setVelocityX(120);
      platform.setData('startX', config.startX);
      platform.setData('endX', config.endX);
      platform.setData('startY', config.startY);
      platform.setData('endY', config.endY);
      platform.setData('movingRight', true);
      platform.setData('index', index);
      this.platformObjects.push(platform);
    });

    // 创建起始平台（固定）
    this.startPlatform = this.physics.add.sprite(100, 150, 'platform');
    this.startPlatform.body.setImmovable(true);
    this.startPlatform.body.allowGravity = false;

    // 创建目标区域（固定）
    this.goal = this.physics.add.sprite(200, 580, 'goal');
    this.goal.body.setImmovable(true);
    this.goal.body.allowGravity = false;

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.startPlatform);
    this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示UI文本
    this.scoreText = this.add.text(16, 16, 'Platforms Crossed: 0/8', {
      fontSize: '20px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(400, 50, 'Use ARROW KEYS to move, SPACE to jump', {
      fontSize: '16px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 追踪已经踩过的平台
    this.touchedPlatforms = new Set();
  }

  update(time, delta) {
    if (this.gameCompleted) return;

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新平台移动
    this.platformObjects.forEach(platform => {
      const startX = platform.getData('startX');
      const endX = platform.getData('endX');
      const startY = platform.getData('startY');
      const endY = platform.getData('endY');
      const movingRight = platform.getData('movingRight');

      // 水平移动
      if (startX !== endX) {
        if (movingRight) {
          if (platform.x >= endX) {
            platform.setData('movingRight', false);
            platform.body.setVelocityX(-120);
          }
        } else {
          if (platform.x <= startX) {
            platform.setData('movingRight', true);
            platform.body.setVelocityX(120);
          }
        }
      }

      // 垂直移动
      if (startY !== endY) {
        const movingDown = platform.getData('movingDown') || false;
        if (!movingDown) {
          if (platform.y >= endY) {
            platform.setData('movingDown', true);
            platform.body.setVelocityY(-120);
          }
        } else {
          if (platform.y <= startY) {
            platform.setData('movingDown', false);
            platform.body.setVelocityY(120);
          }
        }
      }

      // 检测玩家是否站在平台上
      if (this.player.body.touching.down && platform.body.touching.up) {
        const platformIndex = platform.getData('index');
        if (!this.touchedPlatforms.has(platformIndex)) {
          this.touchedPlatforms.add(platformIndex);
          this.platformsCrossed = this.touchedPlatforms.size;
          this.scoreText.setText(`Platforms Crossed: ${this.platformsCrossed}/8`);
        }
      }
    });

    // 玩家掉落重置
    if (this.player.y > 620) {
      this.resetPlayer();
    }
  }

  resetPlayer() {
    this.player.setPosition(100, 100);
    this.player.setVelocity(0, 0);
    this.touchedPlatforms.clear();
    this.platformsCrossed = 0;
    this.scoreText.setText('Platforms Crossed: 0/8');
  }

  reachGoal(player, goal) {
    if (this.platformsCrossed >= 8 && !this.gameCompleted) {
      this.gameCompleted = true;
      this.player.setVelocity(0, 0);
      
      const winText = this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '48px',
        fill: '#00ff00',
        backgroundColor: '#000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);

      console.log('Game completed! All platforms crossed.');
    }
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
  scene: PlatformJumpScene,
  backgroundColor: '#87CEEB'
};

new Phaser.Game(config);