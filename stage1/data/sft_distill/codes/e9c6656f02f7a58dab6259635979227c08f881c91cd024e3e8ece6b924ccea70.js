class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpPower = -200; // 跳跃力度（负值向上）
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
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 落地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });

    // 添加键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建状态文本显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.add.text(16, 50, '按空格键跳跃（可双跳）', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新状态显示
    this.updateStatus();
  }

  update(time, delta) {
    // 检测空格键按下（使用 JustDown 避免长按连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.performJump();
    }

    // 更新状态显示
    this.updateStatus();
  }

  performJump() {
    // 检查是否还能跳跃
    if (this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(this.jumpPower);
      this.jumpCount++;
      
      // 在控制台输出跳跃信息（用于验证）
      console.log(`跳跃 ${this.jumpCount}/${this.maxJumps}`);
    }
  }

  updateStatus() {
    // 计算剩余跳跃次数
    const remainingJumps = this.maxJumps - this.jumpCount;
    
    // 更新状态文本
    this.statusText.setText(
      `剩余跳跃次数: ${remainingJumps}/${this.maxJumps}\n` +
      `玩家高度: ${Math.round(this.player.y)}\n` +
      `垂直速度: ${Math.round(this.player.body.velocity.y)}`
    );
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
      gravity: { y: 600 }, // 设置重力为600
      debug: false
    }
  },
  scene: DoubleJumpScene
};

// 创建游戏实例
new Phaser.Game(config);