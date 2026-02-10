class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpVelocity = -320; // 跳跃速度（负值向上）
    this.totalJumps = 0; // 总跳跃次数（用于验证）
  }

  preload() {
    // 创建角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();
  }

  create() {
    // 创建地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建平台
    this.platform1 = this.physics.add.sprite(200, 450, 'platform');
    this.platform1.setImmovable(true);
    this.platform1.body.allowGravity = false;

    this.platform2 = this.physics.add.sprite(600, 350, 'platform');
    this.platform2.setImmovable(true);
    this.platform2.body.allowGravity = false;

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, this.onPlayerLand, null, this);
    this.physics.add.collider(this.player, this.platform1, this.onPlayerLand, null, this);
    this.physics.add.collider(this.player, this.platform2, this.onPlayerLand, null, this);

    // 创建键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.jumpText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(16, 50, '', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(400, 100, 'Press SPACE to jump (max 2 jumps)\nArrow keys to move', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      align: 'center'
    });
    this.instructionText.setOrigin(0.5, 0);

    // 更新UI
    this.updateUI();
  }

  update(time, delta) {
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.attemptJump();
    }

    // 更新UI
    this.updateUI();
  }

  attemptJump() {
    // 检查是否还能跳跃
    if (this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      this.totalJumps++;
      
      // 视觉反馈：改变颜色
      if (this.jumpCount === 1) {
        this.player.setTint(0x00ff00); // 绿色：第一次跳跃
      } else if (this.jumpCount === 2) {
        this.player.setTint(0xffff00); // 黄色：第二次跳跃
      }
    }
  }

  onPlayerLand(player, ground) {
    // 只有当玩家正在下落时才重置跳跃次数
    if (player.body.velocity.y >= 0) {
      this.jumpCount = 0;
      this.player.clearTint(); // 恢复原色
    }
  }

  updateUI() {
    const remainingJumps = this.maxJumps - this.jumpCount;
    const isGrounded = this.player.body.touching.down;
    
    this.jumpText.setText(
      `Jumps Available: ${remainingJumps}/${this.maxJumps}\n` +
      `Total Jumps: ${this.totalJumps}`
    );

    this.statusText.setText(
      `Status: ${isGrounded ? 'GROUNDED' : 'AIRBORNE'}\n` +
      `Current Jump Count: ${this.jumpCount}\n` +
      `Velocity Y: ${Math.round(this.player.body.velocity.y)}`
    );
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
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);