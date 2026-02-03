class PlatformJumpScene extends Phaser.Scene {
  constructor() {
    super('PlatformJumpScene');
    this.score = 0;
    this.jumps = 0;
    this.platformsPassed = 0;
    this.gameState = 'playing'; // playing, won, lost
  }

  preload() {
    // 使用程序化生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();

    // 创建终点纹理
    const goalGraphics = this.add.graphics();
    goalGraphics.fillStyle(0xffd700, 1);
    goalGraphics.fillRect(0, 0, 80, 100);
    goalGraphics.generateTexture('goal', 80, 100);
    goalGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(false);
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });

    // 定义8个平台的路径配置（每个平台在不同高度和位置循环移动）
    this.platformConfigs = [
      { startX: 100, startY: 550, endX: 200, endY: 550, speed: 80 },
      { startX: 250, startY: 500, endX: 350, endY: 450, speed: 80 },
      { startX: 400, startY: 420, endX: 500, endY: 420, speed: 80 },
      { startX: 550, startY: 380, endX: 650, endY: 350, speed: 80 },
      { startX: 700, startY: 320, endX: 750, endY: 380, speed: 80 },
      { startX: 800, startY: 400, endX: 900, endY: 350, speed: 80 },
      { startX: 950, startY: 320, endX: 1050, endY: 300, speed: 80 },
      { startX: 1100, startY: 280, endX: 1200, endY: 280, speed: 80 }
    ];

    // 创建8个移动平台
    this.movingPlatforms = [];
    this.platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.startX, config.startY, 'platform');
      platform.body.immovable = true;
      platform.body.allowGravity = false;
      
      // 为每个平台创建往返移动的补间动画
      this.tweens.add({
        targets: platform,
        x: config.endX,
        y: config.endY,
        duration: Phaser.Math.Distance.Between(config.startX, config.startY, config.endX, config.endY) / config.speed * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Linear'
      });

      this.movingPlatforms.push({
        sprite: platform,
        passed: false,
        index: index
      });
    });

    // 创建终点
    this.goal = this.physics.add.sprite(1250, 230, 'goal');
    this.goal.body.allowGravity = false;
    this.goal.body.immovable = true;

    // 碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollide, null, this);
    this.physics.add.overlap(this.player, this.goal, this.onGoalReached, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // UI文本
    this.scoreText = this.add.text(16, 16, 'Platforms Passed: 0/8', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.jumpText = this.add.text(16, 50, 'Jumps: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 16, '', {
      fontSize: '24px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(16, 84, 'Arrow Keys: Move | Space: Jump', {
      fontSize: '16px',
      fill: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 摄像机跟随玩家
    this.cameras.main.setBounds(0, 0, 1400, 600);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // 世界边界
    this.physics.world.setBounds(0, 0, 1400, 650);

    // 用于跟踪是否在地面
    this.isGrounded = false;
  }

  onPlatformCollide(player, platform) {
    // 检查玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      this.isGrounded = true;
      
      // 检查是否是新通过的平台
      this.movingPlatforms.forEach(p => {
        if (p.sprite === platform && !p.passed) {
          p.passed = true;
          this.platformsPassed++;
          this.scoreText.setText(`Platforms Passed: ${this.platformsPassed}/8`);
        }
      });
    }
  }

  onGoalReached(player, goal) {
    if (this.gameState === 'playing') {
      this.gameState = 'won';
      this.statusText.setText('Victory! Press R to Restart');
      this.statusText.setX(400 - this.statusText.width / 2);
      this.physics.pause();
      
      // 添加重启功能
      this.input.keyboard.once('keydown-R', () => {
        this.scene.restart();
      });
    }
  }

  update(time, delta) {
    if (this.gameState !== 'playing') {
      return;
    }

    // 检查玩家是否掉落
    if (this.player.y > 650) {
      this.gameState = 'lost';
      this.statusText.setText('Game Over! Press R to Restart');
      this.statusText.setX(400 - this.statusText.width / 2);
      this.physics.pause();
      
      this.input.keyboard.once('keydown-R', () => {
        this.scene.restart();
      });
      return;
    }

    // 重置地面状态
    if (!this.player.body.touching.down) {
      this.isGrounded = false;
    }

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只有在地面或平台上才能跳）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isGrounded) {
      this.player.setVelocityY(-400);
      this.jumps++;
      this.jumpText.setText(`Jumps: ${this.jumps}`);
    }

    // 更新UI位置（固定在屏幕上）
    this.scoreText.setScrollFactor(0);
    this.jumpText.setScrollFactor(0);
    this.statusText.setScrollFactor(0);
    this.instructionText.setScrollFactor(0);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: PlatformJumpScene
};

new Phaser.Game(config);