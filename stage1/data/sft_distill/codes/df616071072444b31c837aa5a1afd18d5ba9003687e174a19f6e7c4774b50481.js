class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.platformsPassed = 0;
    this.gameOver = false;
    this.isJumping = false;
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

    // 创建目标平台纹理
    const goalGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    goalGraphics.fillStyle(0xffff00, 1);
    goalGraphics.fillRect(0, 0, 150, 30);
    goalGraphics.generateTexture('goal', 150, 30);
    goalGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 创建15个移动平台
    this.createPlatforms();

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollide, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#000',
      fontStyle: 'bold'
    });

    this.platformText = this.add.text(16, 50, 'Platforms Passed: 0/15', {
      fontSize: '20px',
      fill: '#000',
      fontStyle: 'bold'
    });

    this.instructionText = this.add.text(400, 16, 'SPACE/UP to Jump | Reach Yellow Platform!', {
      fontSize: '18px',
      fill: '#000',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // 游戏状态文本
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 平台移动配置
    this.platformConfigs = [];
  }

  createPlatforms() {
    // 起始平台（静止）
    const startPlatform = this.platforms.create(100, 200, 'platform');
    startPlatform.body.setVelocity(0, 0);
    startPlatform.setTint(0x00ff00);
    this.platformConfigs.push({ 
      platform: startPlatform, 
      type: 'static',
      index: 0
    });

    // 创建14个移动平台
    const patterns = [
      // 水平移动平台
      { x: 250, y: 200, vx: 240, vy: 0, rangeX: [200, 400], rangeY: null },
      { x: 450, y: 250, vx: -240, vy: 0, rangeX: [350, 550], rangeY: null },
      { x: 600, y: 200, vx: 240, vy: 0, rangeX: [550, 700], rangeY: null },
      
      // 垂直移动平台
      { x: 750, y: 150, vx: 0, vy: 240, rangeX: null, rangeY: [100, 300] },
      { x: 850, y: 300, vx: 0, vy: -240, rangeX: null, rangeY: [150, 350] },
      
      // 对角移动平台
      { x: 950, y: 200, vx: 180, vy: 180, rangeX: [900, 1050], rangeY: [150, 300] },
      { x: 1100, y: 250, vx: -180, vy: -180, rangeX: [1000, 1150], rangeY: [150, 300] },
      
      // 更多水平平台
      { x: 1250, y: 200, vx: 240, vy: 0, rangeX: [1200, 1400], rangeY: null },
      { x: 1450, y: 280, vx: -240, vy: 0, rangeX: [1350, 1550], rangeY: null },
      { x: 1600, y: 180, vx: 240, vy: 0, rangeX: [1550, 1700], rangeY: null },
      
      // 垂直平台
      { x: 1750, y: 200, vx: 0, vy: 240, rangeX: null, rangeY: [120, 320] },
      { x: 1850, y: 250, vx: 0, vy: -240, rangeX: null, rangeY: [150, 350] },
      
      // 最后几个平台
      { x: 1950, y: 200, vx: 180, vy: 120, rangeX: [1900, 2000], rangeY: [150, 280] },
      { x: 2100, y: 220, vx: -240, vy: 0, rangeX: [2000, 2150], rangeY: null }
    ];

    patterns.forEach((config, index) => {
      const platform = this.platforms.create(config.x, config.y, 'platform');
      platform.body.setVelocity(config.vx, config.vy);
      this.platformConfigs.push({
        platform: platform,
        type: 'moving',
        vx: config.vx,
        vy: config.vy,
        rangeX: config.rangeX,
        rangeY: config.rangeY,
        index: index + 1
      });
    });

    // 终点平台（静止）
    const goalPlatform = this.platforms.create(2250, 200, 'goal');
    goalPlatform.body.setVelocity(0, 0);
    goalPlatform.isGoal = true;
    this.platformConfigs.push({
      platform: goalPlatform,
      type: 'goal',
      index: 15
    });
  }

  onPlatformCollide(player, platform) {
    if (platform.isGoal && !this.gameOver) {
      this.gameOver = true;
      this.statusText.setText('YOU WIN!').setVisible(true);
      this.score += 1000;
      this.updateUI();
      this.physics.pause();
    }
  }

  update(time, delta) {
    if (this.gameOver) {
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
    const onGround = this.player.body.touching.down;
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && onGround) {
      this.player.setVelocityY(-500);
      this.isJumping = true;
      this.score += 10;
      this.updateUI();
    }

    if (!onGround) {
      this.isJumping = true;
    } else if (this.isJumping) {
      this.isJumping = false;
    }

    // 更新移动平台
    this.platformConfigs.forEach(config => {
      if (config.type === 'moving') {
        const platform = config.platform;
        
        // 水平边界检测
        if (config.rangeX) {
          if (platform.x <= config.rangeX[0] && config.vx < 0) {
            platform.body.setVelocityX(-config.vx);
            config.vx = -config.vx;
          } else if (platform.x >= config.rangeX[1] && config.vx > 0) {
            platform.body.setVelocityX(-config.vx);
            config.vx = -config.vx;
          }
        }

        // 垂直边界检测
        if (config.rangeY) {
          if (platform.y <= config.rangeY[0] && config.vy < 0) {
            platform.body.setVelocityY(-config.vy);
            config.vy = -config.vy;
          } else if (platform.y >= config.rangeY[1] && config.vy > 0) {
            platform.body.setVelocityY(-config.vy);
            config.vy = -config.vy;
          }
        }
      }
    });

    // 计算通过的平台数
    let passedCount = 0;
    this.platformConfigs.forEach(config => {
      if (this.player.x > config.platform.x + 60) {
        passedCount++;
      }
    });

    if (passedCount !== this.platformsPassed) {
      this.platformsPassed = passedCount;
      this.score += 50;
      this.updateUI();
    }

    // 相机跟随玩家
    this.cameras.main.scrollX = Phaser.Math.Clamp(this.player.x - 300, 0, 2400 - 800);

    // 掉落检测
    if (this.player.y > 600) {
      this.gameOver = true;
      this.statusText.setText('GAME OVER!').setVisible(true);
      this.physics.pause();
    }
  }

  updateUI() {
    this.scoreText.setText('Score: ' + this.score);
    this.platformText.setText('Platforms Passed: ' + this.platformsPassed + '/15');
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