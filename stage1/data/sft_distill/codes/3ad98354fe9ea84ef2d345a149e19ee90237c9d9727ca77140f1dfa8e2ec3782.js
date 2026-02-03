class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.player = null;
    this.ground = null;
    this.cursors = null;
    this.jumpKey = null;
    
    // 可验证的状态信号
    window.__signals__ = {
      playerX: 0,
      playerY: 0,
      velocityX: 0,
      velocityY: 0,
      isOnGround: false,
      jumpCount: 0,
      moveDistance: 0
    };
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建角色纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（棕色长方形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1);
    groundGraphics.fillRect(0, 0, 800, 60);
    groundGraphics.generateTexture('ground', 800, 60);
    groundGraphics.destroy();

    // 创建玩家物理精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面静态平台
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 570, 'ground');

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log('[GAME_START]', JSON.stringify({
      timestamp: Date.now(),
      playerPosition: { x: this.player.x, y: this.player.y },
      gravity: 200
    }));
  }

  update(time, delta) {
    // 重置水平速度
    this.player.setVelocityX(0);

    // 左右移动控制（速度 200）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      window.__signals__.moveDistance += Math.abs(-200 * delta / 1000);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      window.__signals__.moveDistance += Math.abs(200 * delta / 1000);
    }

    // 跳跃控制（仅在地面时可跳跃）
    const isOnGround = this.player.body.touching.down;
    
    if ((this.cursors.up.isDown || this.jumpKey.isDown) && isOnGround) {
      this.player.setVelocityY(-400);
      window.__signals__.jumpCount++;
      
      console.log('[JUMP]', JSON.stringify({
        timestamp: Date.now(),
        jumpCount: window.__signals__.jumpCount,
        position: { x: this.player.x, y: this.player.y }
      }));
    }

    // 更新状态信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.velocityX = Math.round(this.player.body.velocity.x);
    window.__signals__.velocityY = Math.round(this.player.body.velocity.y);
    window.__signals__.isOnGround = isOnGround;

    // 更新调试文本
    this.debugText.setText([
      `Position: (${window.__signals__.playerX}, ${window.__signals__.playerY})`,
      `Velocity: (${window.__signals__.velocityX}, ${window.__signals__.velocityY})`,
      `On Ground: ${window.__signals__.isOnGround}`,
      `Jumps: ${window.__signals__.jumpCount}`,
      `Move Distance: ${Math.round(window.__signals__.moveDistance)}`,
      '',
      'Controls:',
      'Arrow Keys: Move Left/Right',
      'Up Arrow or Space: Jump'
    ].join('\n'));

    // 每秒输出一次状态日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log('[STATE]', JSON.stringify(window.__signals__));
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: PlatformScene
};

const game = new Phaser.Game(config);