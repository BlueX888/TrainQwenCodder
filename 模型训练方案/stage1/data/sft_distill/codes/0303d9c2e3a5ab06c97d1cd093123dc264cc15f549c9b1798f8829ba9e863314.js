class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.maxJumps = 2;
    this.jumpVelocity = -80;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用Graphics）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 60);
    groundGraphics.generateTexture('ground', 800, 60);
    groundGraphics.destroy();

    // 创建地面平台
    this.ground = this.physics.add.staticSprite(400, 570, 'ground');
    this.ground.setOrigin(0.5, 0.5);
    this.ground.refreshBody();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置玩家与地面的碰撞
    this.physics.add.collider(this.player, this.ground);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加文本显示跳跃次数
    this.jumpText = this.add.text(16, 16, 'Jump Count: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.instructionText = this.add.text(16, 50, 'Press SPACE to jump (max 2 jumps)', {
      fontSize: '16px',
      fill: '#cccccc'
    });

    // 添加状态文本
    this.statusText = this.add.text(16, 80, 'Status: On Ground', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 检测玩家是否在地面上
    const onGround = this.player.body.touching.down;

    // 如果在地面上，重置跳跃次数
    if (onGround) {
      this.jumpCount = 0;
      this.statusText.setText('Status: On Ground');
    } else {
      this.statusText.setText('Status: In Air');
    }

    // 检测空格键按下（使用justDown避免重复触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      // 如果跳跃次数未达到最大值，允许跳跃
      if (this.jumpCount < this.maxJumps) {
        this.player.setVelocityY(this.jumpVelocity);
        this.jumpCount++;
        this.jumpText.setText('Jump Count: ' + this.jumpCount);
        
        // 添加视觉反馈
        this.tweens.add({
          targets: this.player,
          scaleX: 1.1,
          scaleY: 0.9,
          duration: 100,
          yoyo: true
        });
      }
    }

    // 更新跳跃计数显示
    this.jumpText.setText('Jump Count: ' + this.jumpCount + '/' + this.maxJumps);
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
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: DoubleJumpScene
};

new Phaser.Game(config);