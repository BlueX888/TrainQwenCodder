class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 状态信号：当前跳跃次数
    this.isOnGround = true; // 状态信号：是否在地面
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpVelocity = -320; // 跳跃力度（负值向上）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00aa00, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 碰撞回调：玩家落地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        this.isOnGround = true;
      }
    });

    // 添加键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 50, '按空格键跳跃（可双跳）', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}/${this.maxJumps}`,
      `在地面: ${this.isOnGround}`,
      `Y速度: ${Math.round(this.player.body.velocity.y)}`
    ]);

    // 检测是否在地面
    this.isOnGround = this.player.body.touching.down;

    // 处理跳跃输入
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleJump();
    }

    // 水平移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }
  }

  handleJump() {
    // 双跳逻辑：只要跳跃次数小于最大次数就可以跳
    if (this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      this.isOnGround = false;
      
      console.log(`执行第 ${this.jumpCount} 次跳跃`);
    } else {
      console.log('已达到最大跳跃次数，需要落地');
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
      gravity: { y: 500 }, // 重力设置为500
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);