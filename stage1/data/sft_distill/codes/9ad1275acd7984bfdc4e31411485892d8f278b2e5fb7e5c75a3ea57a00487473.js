class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformsPassed = 0;
    this.isOnPlatform = false;
    this.currentPlatformIndex = -1;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
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
    platformGraphics.fillStyle(0xff6600, 1);
    platformGraphics.fillRect(0, 0, 100, 20);
    platformGraphics.generateTexture('platform', 100, 20);
    platformGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });

    // 8个平台组成椭圆路径
    const centerX = 400;
    const centerY = 300;
    const radiusX = 250;
    const radiusY = 150;
    const platformCount = 8;
    
    this.platformObjects = [];
    
    for (let i = 0; i < platformCount; i++) {
      const angle = (i / platformCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radiusX;
      const y = centerY + Math.sin(angle) * radiusY;
      
      const platform = this.platforms.create(x, y, 'platform');
      platform.body.immovable = true;
      platform.body.allowGravity = false;
      platform.platformIndex = i;
      
      this.platformObjects.push(platform);
      
      // 创建循环移动的Tween
      // 速度120意味着每秒移动120像素
      // 计算椭圆周长近似值
      const perimeter = Math.PI * (3 * (radiusX + radiusY) - Math.sqrt((3 * radiusX + radiusY) * (radiusX + 3 * radiusY)));
      const duration = (perimeter / 120) * 1000; // 转换为毫秒
      
      // 使用延迟让平台错开
      const delay = (i / platformCount) * duration;
      
      this.tweens.add({
        targets: platform,
        duration: duration,
        delay: delay,
        repeat: -1,
        onUpdate: (tween, target) => {
          const progress = tween.progress;
          const currentAngle = progress * Math.PI * 2 + angle;
          target.x = centerX + Math.cos(currentAngle) * radiusX;
          target.y = centerY + Math.sin(currentAngle) * radiusY;
          
          // 更新物理body位置
          target.body.updateFromGameObject();
        }
      });
    }

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 550, 'Press SPACE or UP to Jump', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 绘制路径参考线
    const pathGraphics = this.add.graphics();
    pathGraphics.lineStyle(2, 0x444444, 0.5);
    pathGraphics.beginPath();
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radiusX;
      const y = centerY + Math.sin(angle) * radiusY;
      if (i === 0) {
        pathGraphics.moveTo(x, y);
      } else {
        pathGraphics.lineTo(x, y);
      }
    }
    pathGraphics.strokePath();

    this.updateStatus();
  }

  onPlatformCollision(player, platform) {
    // 检查玩家是否从上方落到平台上
    if (player.body.touching.down && platform.body.touching.up) {
      if (this.currentPlatformIndex !== platform.platformIndex) {
        this.currentPlatformIndex = platform.platformIndex;
        this.platformsPassed++;
        this.updateStatus();
      }
      this.isOnPlatform = true;
    }
  }

  update(time, delta) {
    // 跳跃控制
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
      this.isOnPlatform = false;
    }

    // 水平移动控制（可选，帮助玩家调整位置）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 检查玩家是否掉落
    if (this.player.y > 600) {
      this.resetPlayer();
    }

    this.updateStatus();
  }

  resetPlayer() {
    this.player.setPosition(400, 500);
    this.player.setVelocity(0, 0);
    this.platformsPassed = 0;
    this.currentPlatformIndex = -1;
    this.updateStatus();
  }

  updateStatus() {
    const statusInfo = [
      `Platforms Passed: ${this.platformsPassed}`,
      `Player Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `On Platform: ${this.isOnPlatform}`,
      `Current Platform: ${this.currentPlatformIndex >= 0 ? this.currentPlatformIndex : 'None'}`
    ];
    this.statusText.setText(statusInfo.join('\n'));
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