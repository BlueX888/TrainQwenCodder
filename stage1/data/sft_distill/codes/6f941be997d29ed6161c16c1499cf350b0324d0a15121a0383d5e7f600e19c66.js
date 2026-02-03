class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformsPassed = 0;
    this.gameState = 'playing'; // playing, failed, completed
    this.currentPlatformIndex = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理
    this.createPlayerTexture();
    
    // 创建平台纹理
    this.createPlatformTexture();

    // 创建玩家
    this.player = this.physics.add.sprite(100, height - 150, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(false);
    this.player.body.setGravity(0, 800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });

    // 创建12个平台的路径配置
    this.platformConfigs = this.createPlatformPath(width, height);
    
    // 创建所有平台
    this.createPlatforms();

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 检测玩家掉落
    this.checkFallTimer = this.time.addEvent({
      delay: 100,
      callback: this.checkPlayerFall,
      callbackScope: this,
      loop: true
    });
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  createPlatformTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff6600, 1);
    graphics.fillRect(0, 0, 120, 20);
    graphics.lineStyle(2, 0xff3300, 1);
    graphics.strokeRect(0, 0, 120, 20);
    graphics.generateTexture('platform', 120, 20);
    graphics.destroy();
  }

  createPlatformPath(width, height) {
    // 创建12个平台的路径配置（蛇形路径）
    const configs = [];
    const platformWidth = 120;
    const verticalSpacing = 100;
    const startY = height - 100;
    
    for (let i = 0; i < 12; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const isEvenRow = row % 2 === 0;
      
      // 蛇形路径：偶数行从左到右，奇数行从右到左
      const xPos = isEvenRow 
        ? 150 + col * 250 
        : width - 150 - col * 250;
      
      const yPos = startY - row * verticalSpacing;

      // 计算移动路径（水平往返）
      const moveDistance = 150;
      const startX = xPos - moveDistance / 2;
      const endX = xPos + moveDistance / 2;

      configs.push({
        startX: startX,
        endX: endX,
        y: yPos,
        index: i
      });
    }

    return configs;
  }

  createPlatforms() {
    this.platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.startX, config.y, 'platform');
      platform.body.immovable = true;
      platform.body.allowGravity = false;
      platform.setData('index', config.index);
      platform.setData('passed', false);

      // 创建往返移动的Tween
      // 速度360像素/秒，计算移动时间
      const distance = Math.abs(config.endX - config.startX);
      const duration = (distance / 360) * 1000; // 转换为毫秒

      this.tweens.add({
        targets: platform,
        x: config.endX,
        duration: duration,
        ease: 'Linear',
        yoyo: true,
        repeat: -1,
        delay: index * 200 // 错开启动时间
      });
    });
  }

  update(time, delta) {
    if (this.gameState !== 'playing') {
      return;
    }

    // 玩家左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 检测玩家是否站在平台上并标记已通过
    this.platforms.children.entries.forEach(platform => {
      if (this.player.body.touching.down && 
          this.physics.overlap(this.player, platform)) {
        const platformIndex = platform.getData('index');
        const passed = platform.getData('passed');
        
        if (!passed && platformIndex > this.currentPlatformIndex) {
          platform.setData('passed', true);
          this.platformsPassed++;
          this.currentPlatformIndex = platformIndex;
          this.updateStatusText();

          // 检测是否完成所有平台
          if (this.platformsPassed >= 12) {
            this.gameState = 'completed';
            this.updateStatusText();
          }
        }
      }
    });
  }

  checkPlayerFall() {
    if (this.gameState !== 'playing') {
      return;
    }

    const { height } = this.cameras.main;
    
    // 玩家掉出屏幕底部
    if (this.player.y > height + 50) {
      this.gameState = 'failed';
      this.updateStatusText();
      
      // 2秒后重置
      this.time.delayedCall(2000, () => {
        this.resetGame();
      });
    }
  }

  resetGame() {
    this.platformsPassed = 0;
    this.currentPlatformIndex = 0;
    this.gameState = 'playing';
    
    // 重置玩家位置
    this.player.setPosition(100, this.cameras.main.height - 150);
    this.player.setVelocity(0, 0);

    // 重置所有平台的passed状态
    this.platforms.children.entries.forEach(platform => {
      platform.setData('passed', false);
    });

    this.updateStatusText();
  }

  updateStatusText() {
    let statusMsg = `Platforms Passed: ${this.platformsPassed}/12\n`;
    statusMsg += `State: ${this.gameState.toUpperCase()}\n`;
    
    if (this.gameState === 'completed') {
      statusMsg += 'YOU WIN! Press R to restart';
    } else if (this.gameState === 'failed') {
      statusMsg += 'FAILED! Resetting...';
    } else {
      statusMsg += 'Use ARROW KEYS to move, SPACE to jump';
    }

    this.statusText.setText(statusMsg);

    // 添加R键重启功能
    if (this.gameState === 'completed') {
      if (!this.rKey) {
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
      }
      if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
        this.resetGame();
      }
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
  scene: GameScene
};

new Phaser.Game(config);