class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformsReached = 0;
    this.currentPlatformIndex = 0;
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
    goalGraphics.generateTexture('goalPlatform', 120, 20);
    goalGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 平台配置（15个平台的路径）
    const platformConfigs = [
      { x: 100, y: 550, moveType: 'none' }, // 起始平台
      { x: 250, y: 500, moveType: 'horizontal', min: 200, max: 300 },
      { x: 400, y: 450, moveType: 'vertical', min: 400, max: 500 },
      { x: 550, y: 400, moveType: 'horizontal', min: 500, max: 650 },
      { x: 200, y: 350, moveType: 'vertical', min: 300, max: 400 },
      { x: 350, y: 300, moveType: 'horizontal', min: 300, max: 450 },
      { x: 500, y: 250, moveType: 'vertical', min: 200, max: 300 },
      { x: 650, y: 350, moveType: 'horizontal', min: 600, max: 750 },
      { x: 300, y: 200, moveType: 'vertical', min: 150, max: 250 },
      { x: 450, y: 180, moveType: 'horizontal', min: 400, max: 550 },
      { x: 600, y: 220, moveType: 'vertical', min: 170, max: 270 },
      { x: 250, y: 120, moveType: 'horizontal', min: 200, max: 350 },
      { x: 500, y: 100, moveType: 'vertical', min: 80, max: 150 },
      { x: 650, y: 120, moveType: 'horizontal', min: 600, max: 750 },
      { x: 400, y: 50, moveType: 'none', isGoal: true } // 目标平台
    ];

    // 创建平台
    platformConfigs.forEach((config, index) => {
      const texture = config.isGoal ? 'goalPlatform' : 'platform';
      const platform = this.platforms.create(config.x, config.y, texture);
      platform.body.setImmovable(true);
      platform.setData('index', index);
      platform.setData('moveType', config.moveType);
      platform.setData('isGoal', config.isGoal || false);

      // 设置移动参数
      if (config.moveType === 'horizontal') {
        platform.setData('minX', config.min);
        platform.setData('maxX', config.max);
        platform.setData('direction', 1);
        platform.body.setVelocityX(80);
      } else if (config.moveType === 'vertical') {
        platform.setData('minY', config.min);
        platform.setData('maxY', config.max);
        platform.setData('direction', 1);
        platform.body.setVelocityY(80);
      }
    });

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(600);

    // 玩家与平台碰撞
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollision, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });

    // 提示文本
    this.hintText = this.add.text(400, 300, 'Use Arrow Keys to Move\nSPACE to Jump\nReach the Yellow Platform!', {
      fontSize: '20px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 15, y: 10 },
      align: 'center'
    });
    this.hintText.setOrigin(0.5);

    // 3秒后隐藏提示
    this.time.delayedCall(3000, () => {
      this.hintText.setVisible(false);
    });

    this.updateStatusText();
  }

  onPlatformCollision(player, platform) {
    const platformIndex = platform.getData('index');
    if (platformIndex > this.currentPlatformIndex) {
      this.currentPlatformIndex = platformIndex;
      this.platformsReached = platformIndex + 1;
      this.updateStatusText();
    }

    // 检查是否到达目标平台
    if (platform.getData('isGoal') && !this.gameWon) {
      this.gameWon = true;
      this.showVictory();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Platforms Reached: ${this.platformsReached}/15\n` +
      `Current Platform: ${this.currentPlatformIndex + 1}\n` +
      `Game Won: ${this.gameWon}`
    );
  }

  showVictory() {
    const victoryText = this.add.text(400, 300, 'VICTORY!\nYou reached the goal!', {
      fontSize: '32px',
      fill: '#FFD700',
      backgroundColor: '#000',
      padding: { x: 20, y: 15 },
      align: 'center'
    });
    victoryText.setOrigin(0.5);
    victoryText.setDepth(100);

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);
  }

  update(time, delta) {
    if (this.gameWon) {
      return;
    }

    // 更新移动平台
    this.platforms.children.entries.forEach(platform => {
      const moveType = platform.getData('moveType');

      if (moveType === 'horizontal') {
        const minX = platform.getData('minX');
        const maxX = platform.getData('maxX');
        const direction = platform.getData('direction');

        if (platform.x <= minX && direction === -1) {
          platform.setData('direction', 1);
          platform.body.setVelocityX(80);
        } else if (platform.x >= maxX && direction === 1) {
          platform.setData('direction', -1);
          platform.body.setVelocityX(-80);
        }
      } else if (moveType === 'vertical') {
        const minY = platform.getData('minY');
        const maxY = platform.getData('maxY');
        const direction = platform.getData('direction');

        if (platform.y <= minY && direction === -1) {
          platform.setData('direction', 1);
          platform.body.setVelocityY(80);
        } else if (platform.y >= maxY && direction === 1) {
          platform.setData('direction', -1);
          platform.body.setVelocityY(-80);
        }
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

    // 跳跃（只能在地面或平台上跳跃）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 玩家掉落检测
    if (this.player.y > 650) {
      this.resetPlayer();
    }
  }

  resetPlayer() {
    this.player.setPosition(100, 500);
    this.player.setVelocity(0, 0);
    this.currentPlatformIndex = 0;
    this.platformsReached = 1;
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