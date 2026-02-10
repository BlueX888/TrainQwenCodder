class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已使用的跳跃次数
    this.totalJumps = 0; // 总跳跃计数（状态信号）
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpVelocity = -240; // 跳跃力度
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1);
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
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 575, 'ground');

    // 创建几个平台用于测试
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 350, 'platform');
    this.platforms.create(400, 250, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, this.onPlayerLand, null, this);
    this.physics.add.collider(this.player, this.platforms, this.onPlayerLand, null, this);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.handleJump();
    });

    // 创建UI文本显示状态
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.add.text(16, 60, '按空格键跳跃（最多2次）\n方向键左右移动', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新状态显示
    this.updateStatus();
  }

  handleJump() {
    // 检查是否还有跳跃次数
    if (this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      this.totalJumps++;
      this.updateStatus();
      
      console.log(`Jump ${this.jumpCount}/${this.maxJumps}, Total jumps: ${this.totalJumps}`);
    }
  }

  onPlayerLand(player, ground) {
    // 当玩家着地时，重置跳跃次数
    // 注意：这个回调在碰撞时持续触发，需要在update中处理
  }

  update(time, delta) {
    // 水平移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 检测玩家是否在地面上（通过检测垂直速度和body.touching）
    const onGround = this.player.body.touching.down || this.player.body.blocked.down;
    
    // 如果玩家在地面上且之前已经跳过，重置跳跃次数
    if (onGround && this.jumpCount > 0) {
      this.jumpCount = 0;
      this.updateStatus();
    }

    // 更新状态显示（实时显示速度信息）
    if (time % 100 < delta) { // 每100ms更新一次，减少性能开销
      this.updateStatus();
    }
  }

  updateStatus() {
    const onGround = this.player.body.touching.down || this.player.body.blocked.down;
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}/${this.maxJumps}`,
      `总跳跃计数: ${this.totalJumps}`,
      `着地状态: ${onGround ? '是' : '否'}`,
      `垂直速度: ${Math.round(this.player.body.velocity.y)}`
    ]);
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);