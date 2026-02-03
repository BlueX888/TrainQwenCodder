class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已使用的跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.remainingJumps = 2; // 剩余跳跃次数（可验证状态）
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

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建地面平台
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 575, 'ground');

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      // 着地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        this.remainingJumps = this.maxJumps;
      }
    });

    // 添加键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(16, 50, '按空格键跳跃（最多2次）', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    this.updateStatusText();
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

    // 双跳逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      // 检查是否还有跳跃次数
      if (this.jumpCount < this.maxJumps) {
        this.player.setVelocityY(-120); // 跳跃力度120
        this.jumpCount++;
        this.remainingJumps = this.maxJumps - this.jumpCount;
        this.updateStatusText();
        
        console.log(`跳跃！当前跳跃次数: ${this.jumpCount}/${this.maxJumps}`);
      }
    }

    // 检测是否在地面上（用于调试）
    const onGround = this.player.body.touching.down;
    
    // 更新状态显示
    this.statusText.setText(
      `剩余跳跃次数: ${this.remainingJumps}/${this.maxJumps}\n` +
      `当前状态: ${onGround ? '在地面' : '在空中'}\n` +
      `Y速度: ${Math.round(this.player.body.velocity.y)}`
    );
  }

  updateStatusText() {
    // 更新状态文本
    if (this.statusText) {
      this.statusText.setText(
        `剩余跳跃次数: ${this.remainingJumps}/${this.maxJumps}`
      );
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
      gravity: { y: 1000 }, // 重力设置为1000
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);