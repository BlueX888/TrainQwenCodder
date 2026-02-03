class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号：跳跃次数
    this.isGrounded = false; // 可验证的状态信号：是否在地面
    this.moveDistance = 0; // 可验证的状态信号：移动距离
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（绿色平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 200, 32);
    groundGraphics.generateTexture('ground', 200, 32);
    groundGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.1); // 轻微弹跳
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞
    
    // 创建地面平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加主地面
    this.platforms.create(400, 568, 'ground').setScale(4, 1).refreshBody();
    
    // 添加几个悬浮平台
    this.platforms.create(600, 450, 'ground');
    this.platforms.create(200, 450, 'ground');
    this.platforms.create(400, 350, 'ground');
    this.platforms.create(100, 250, 'ground');
    this.platforms.create(700, 250, 'ground');

    // 设置玩家与平台的碰撞
    this.collider = this.physics.add.collider(
      this.player, 
      this.platforms,
      this.onGroundCollision,
      null,
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加文本显示状态
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化状态
    this.isGrounded = false;
    this.lastX = this.player.x;
  }

  onGroundCollision(player, platform) {
    // 只有当玩家在平台上方时才算接地
    if (player.body.touching.down && platform.body.touching.up) {
      this.isGrounded = true;
    }
  }

  update(time, delta) {
    // 检测是否离开地面
    if (!this.player.body.touching.down) {
      this.isGrounded = false;
    }

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只能在地面时跳跃）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isGrounded) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
      this.isGrounded = false; // 跳跃后立即标记为离地
    }

    // 计算移动距离
    const deltaX = Math.abs(this.player.x - this.lastX);
    this.moveDistance += deltaX;
    this.lastX = this.player.x;

    // 更新状态文本
    this.statusText.setText([
      `Jump Count: ${this.jumpCount}`,
      `Grounded: ${this.isGrounded}`,
      `Move Distance: ${Math.floor(this.moveDistance)}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `Velocity: (${Math.floor(this.player.body.velocity.x)}, ${Math.floor(this.player.body.velocity.y)})`,
      '',
      'Controls:',
      '← → : Move',
      'SPACE: Jump'
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
new Phaser.Game(config);