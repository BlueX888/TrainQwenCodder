class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.platformsPassed = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 使用Graphics生成纹理
    this.createTextures();
  }

  createTextures() {
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

    // 创建起始平台纹理
    const startPlatformGraphics = this.add.graphics();
    startPlatformGraphics.fillStyle(0x0066ff, 1);
    startPlatformGraphics.fillRect(0, 0, 150, 20);
    startPlatformGraphics.generateTexture('startPlatform', 150, 20);
    startPlatformGraphics.destroy();

    // 创建终点平台纹理
    const endPlatformGraphics = this.add.graphics();
    endPlatformGraphics.fillStyle(0xffff00, 1);
    endPlatformGraphics.fillRect(0, 0, 150, 20);
    endPlatformGraphics.generateTexture('endPlatform', 150, 20);
    endPlatformGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建起始平台（固定）
    this.startPlatform = this.physics.add.sprite(100, 550, 'startPlatform');
    this.startPlatform.setImmovable(true);
    this.startPlatform.body.allowGravity = false;

    // 创建移动平台组
    this.platforms = this.physics.add.group();
    
    // 创建10个移动平台，形成路径
    const platformData = [
      { x: 250, y: 500, moveX: 250, moveY: 450 },
      { x: 400, y: 450, moveX: 400, moveY: 400 },
      { x: 550, y: 400, moveX: 550, moveY: 350 },
      { x: 700, y: 350, moveX: 700, moveY: 300 },
      { x: 600, y: 300, moveX: 500, moveY: 300 },
      { x: 450, y: 250, moveX: 450, moveY: 200 },
      { x: 300, y: 200, moveX: 300, moveY: 250 },
      { x: 200, y: 250, moveX: 200, moveY: 300 },
      { x: 350, y: 350, moveX: 450, moveY: 350 },
      { x: 600, y: 400, moveX: 600, moveY: 450 }
    ];

    this.platformObjects = [];
    platformData.forEach((data, index) => {
      const platform = this.physics.add.sprite(data.x, data.y, 'platform');
      platform.setImmovable(true);
      platform.body.allowGravity = false;
      platform.platformIndex = index;
      platform.passed = false;
      
      // 创建移动补间动画，速度200像素/秒
      const distance = Phaser.Math.Distance.Between(data.x, data.y, data.moveX, data.moveY);
      const duration = (distance / 200) * 1000; // 转换为毫秒
      
      this.tweens.add({
        targets: platform,
        x: data.moveX,
        y: data.moveY,
        duration: duration,
        yoyo: true,
        repeat: -1,
        ease: 'Linear'
      });
      
      this.platforms.add(platform);
      this.platformObjects.push(platform);
    });

    // 创建终点平台
    this.endPlatform = this.physics.add.sprite(700, 500, 'endPlatform');
    this.endPlatform.setImmovable(true);
    this.endPlatform.body.allowGravity = false;

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.startPlatform);
    this.physics.add.collider(this.player, this.platforms, this.checkPlatformPassed, null, this);
    this.physics.add.collider(this.player, this.endPlatform, this.reachEnd, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // UI文本
    this.scoreText = this.add.text(16, 16, 'Platforms Passed: 0/10', {
      fontSize: '20px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(400, 50, 'Use Arrow Keys to Move, SPACE to Jump', {
      fontSize: '16px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5);

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 添加调试信息
    console.log('Game Started - 10 platforms created with speed 200');
  }

  checkPlatformPassed(player, platform) {
    // 检查玩家是否站在平台上且该平台未被标记为通过
    if (!platform.passed && player.body.touching.down && platform.body.touching.up) {
      platform.passed = true;
      this.platformsPassed++;
      this.score += 10;
      this.scoreText.setText(`Platforms Passed: ${this.platformsPassed}/10`);
      
      // 平台变色表示已通过
      platform.setTint(0x00ff00);
      
      console.log(`Platform ${platform.platformIndex + 1} passed! Total: ${this.platformsPassed}/10`);
    }
  }

  reachEnd(player, endPlatform) {
    if (!this.gameWon && this.platformsPassed >= 10) {
      this.gameWon = true;
      this.gameOver = true;
      this.statusText.setText('YOU WIN!\nAll Platforms Passed!');
      this.statusText.setVisible(true);
      this.physics.pause();
      console.log('Game Won! Final Score:', this.score);
    }
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家掉落检测
    if (this.player.y > 600) {
      this.gameOver = true;
      this.statusText.setText('GAME OVER!\nFell Off!');
      this.statusText.setVisible(true);
      this.physics.pause();
      console.log('Game Over - Player fell. Platforms passed:', this.platformsPassed);
      return;
    }

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只能在接触地面时跳跃）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
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
  scene: GameScene
};

const game = new Phaser.Game(config);