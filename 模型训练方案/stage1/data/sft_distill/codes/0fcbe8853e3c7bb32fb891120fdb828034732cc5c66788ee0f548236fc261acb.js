class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已使用的跳跃次数
    this.totalJumps = 0; // 总跳跃计数（用于验证）
    this.maxJumps = 2; // 最大跳跃次数
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');
    this.ground.setSize(800, 50);
    this.ground.refreshBody();

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      // 当玩家与地面碰撞时，重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });

    // 添加键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.instructionText = this.add.text(400, 100, '按空格键跳跃（可双跳）', {
      fontSize: '24px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5);

    // 更新状态显示
    this.updateStatusText();
  }

  update(time, delta) {
    // 检测空格键按下（使用 justDown 避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleJump();
    }

    // 更新状态文本
    this.updateStatusText();

    // 显示玩家状态（用于调试）
    const onGround = this.player.body.touching.down;
    if (onGround && this.jumpCount > 0) {
      // 确保落地时重置跳跃次数
      this.jumpCount = 0;
    }
  }

  handleJump() {
    // 检查是否还有跳跃次数
    if (this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(-120); // 跳跃力度120
      this.jumpCount++;
      this.totalJumps++;
      
      // 添加视觉反馈
      this.tweens.add({
        targets: this.player,
        scaleX: 1.1,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    }
  }

  updateStatusText() {
    const remainingJumps = this.maxJumps - this.jumpCount;
    const onGround = this.player.body.touching.down ? '是' : '否';
    
    this.statusText.setText([
      `剩余跳跃次数: ${remainingJumps}/${this.maxJumps}`,
      `总跳跃计数: ${this.totalJumps}`,
      `在地面上: ${onGround}`,
      `玩家Y坐标: ${Math.round(this.player.y)}`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 }, // 重力500
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);