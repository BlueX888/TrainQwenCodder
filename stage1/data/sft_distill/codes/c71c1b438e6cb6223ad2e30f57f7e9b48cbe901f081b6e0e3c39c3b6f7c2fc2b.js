class PlatformGameScene extends Phaser.Scene {
  constructor() {
    super('PlatformGameScene');
    this.score = 0;
    this.platformsPassed = 0;
    this.isGameOver = false;
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

    // 创建背景网格
    const bgGraphics = this.add.graphics();
    bgGraphics.lineStyle(1, 0x333333, 0.3);
    for (let i = 0; i < 800; i += 40) {
      bgGraphics.lineBetween(i, 0, i, 600);
    }
    for (let i = 0; i < 600; i += 40) {
      bgGraphics.lineBetween(0, i, 800, i);
    }
  }

  create() {
    this.isGameOver = false;
    this.score = 0;
    this.platformsPassed = 0;

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 50, 'Platforms Passed: 0/12', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    this.instructionText = this.add.text(400, 100, 'Arrow Keys: Move | Space: Jump', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 创建玩家
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(false);
    this.player.body.setGravity(0, 800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 定义12个平台的路径点（形成一个循环路径）
    this.platformPaths = [
      { start: { x: 100, y: 500 }, end: { x: 200, y: 500 } },
      { start: { x: 200, y: 500 }, end: { x: 300, y: 450 } },
      { start: { x: 300, y: 450 }, end: { x: 400, y: 400 } },
      { start: { x: 400, y: 400 }, end: { x: 500, y: 350 } },
      { start: { x: 500, y: 350 }, end: { x: 600, y: 300 } },
      { start: { x: 600, y: 300 }, end: { x: 700, y: 300 } },
      { start: { x: 700, y: 300 }, end: { x: 700, y: 400 } },
      { start: { x: 700, y: 400 }, end: { x: 600, y: 450 } },
      { start: { x: 600, y: 450 }, end: { x: 500, y: 480 } },
      { start: { x: 500, y: 480 }, end: { x: 400, y: 500 } },
      { start: { x: 400, y: 500 }, end: { x: 300, y: 520 } },
      { start: { x: 300, y: 520 }, end: { x: 200, y: 520 } }
    ];

    // 创建12个平台并设置移动动画
    this.platformPaths.forEach((path, index) => {
      const platform = this.platforms.create(path.start.x, path.start.y, 'platform');
      platform.body.setAllowGravity(false);
      platform.body.setImmovable(true);
      platform.setData('index', index);
      platform.setData('passed', false);

      // 计算移动距离和时间
      const distance = Phaser.Math.Distance.Between(
        path.start.x, path.start.y,
        path.end.x, path.end.y
      );
      const duration = (distance / 360) * 1000; // 速度360像素/秒

      // 创建循环移动动画
      this.tweens.add({
        targets: platform,
        x: path.end.x,
        y: path.end.y,
        duration: duration,
        delay: index * 200, // 错开启动时间
        yoyo: true,
        repeat: -1,
        ease: 'Linear',
        onUpdate: () => {
          // 更新物理体位置
          platform.body.updateFromGameObject();
        }
      });
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollide, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 重置键
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  onPlatformCollide(player, platform) {
    // 检查平台是否首次通过
    if (!platform.getData('passed') && player.body.touching.down) {
      platform.setData('passed', true);
      this.platformsPassed++;
      this.score += 10;
      this.updateUI();

      // 平台变色表示已通过
      platform.setTint(0x00ff00);
    }
  }

  updateUI() {
    this.scoreText.setText('Score: ' + this.score);
    this.statusText.setText('Platforms Passed: ' + this.platformsPassed + '/12');

    if (this.platformsPassed >= 12) {
      this.statusText.setText('Platforms Passed: 12/12 - YOU WIN!');
      this.statusText.setColor('#00ff00');
    }
  }

  update(time, delta) {
    if (this.isGameOver) {
      if (this.rKey.isDown) {
        this.scene.restart();
      }
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

    // 跳跃（只有在地面或平台上才能跳）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.player.body.touching.down || this.player.body.blocked.down) {
        this.player.setVelocityY(-400);
      }
    }

    // 检查掉落
    if (this.player.y > 650) {
      this.gameOver();
    }

    // 让玩家跟随平台移动（站在移动平台上）
    if (this.player.body.touching.down) {
      this.platforms.children.entries.forEach(platform => {
        if (this.physics.overlap(this.player, platform)) {
          // 简单的平台跟随逻辑
          const platformBody = platform.body;
          if (platformBody.velocity.x !== 0) {
            this.player.x += platformBody.velocity.x * delta / 1000;
          }
          if (platformBody.velocity.y !== 0 && platformBody.velocity.y > 0) {
            this.player.y += platformBody.velocity.y * delta / 1000;
          }
        }
      });
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.player.setTint(0xff0000);
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER\nPress R to Restart', {
      fontSize: '32px',
      fill: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: PlatformGameScene
};

new Phaser.Game(config);