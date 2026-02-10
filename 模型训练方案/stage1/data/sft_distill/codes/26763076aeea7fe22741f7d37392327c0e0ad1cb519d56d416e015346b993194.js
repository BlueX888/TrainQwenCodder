class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('PlatformerScene');
    // 状态信号变量
    this.jumpCount = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.isOnGround = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 60);
    groundGraphics.generateTexture('ground', 800, 60);
    groundGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家物理精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    
    // 创建地面和平台静态组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加地面
    this.platforms.create(400, 570, 'ground').setScale(1).refreshBody();
    
    // 添加多个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(400, 300, 'platform');
    this.platforms.create(100, 250, 'platform');
    this.platforms.create(700, 200, 'platform');

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isOnGround = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(100);

    // 添加操作说明
    this.add.text(16, 60, 'Controls:\n← → Arrow keys to move\nSPACE or ↑ to jump', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    
    // 检查是否在地面上（通过速度判断）
    if (this.player.body.touching.down) {
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（空格键或上方向键）
    if ((Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
         Phaser.Input.Keyboard.JustDown(this.cursors.up)) && 
        this.player.body.touching.down) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
    }

    // 更新状态显示
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Jump Count: ${this.jumpCount}`,
      `On Ground: ${this.isOnGround}`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: PlatformerScene
};

// 创建游戏实例
new Phaser.Game(config);