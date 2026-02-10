// 平台跳跃游戏场景
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false;
  }

  preload() {
    // 使用 Graphics 生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 生成地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 200, 40);
    groundGraphics.generateTexture('ground', 200, 40);
    groundGraphics.destroy();

    // 生成平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 0, 150, 30);
    platformGraphics.generateTexture('platform', 150, 30);
    platformGraphics.destroy();
  }

  create() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建地面静态组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加底部地面
    this.platforms.create(100, 580, 'ground');
    this.platforms.create(300, 580, 'ground');
    this.platforms.create(500, 580, 'ground');
    this.platforms.create(700, 580, 'ground');
    
    // 添加悬浮平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 350, 'platform');
    this.platforms.create(650, 250, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    
    // 设置玩家物理属性
    this.player.body.setGravityY(400);

    // 设置玩家与平台的碰撞
    this.collider = this.physics.add.collider(
      this.player, 
      this.platforms,
      this.onPlayerLand,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 50, '← → 移动  空格/↑ 跳跃', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.updateStatus();
  }

  onPlayerLand(player, platform) {
    // 玩家着地时的回调
    this.isGrounded = true;
  }

  update(time, delta) {
    // 检查玩家是否在地面上
    const touchingDown = this.player.body.touching.down;
    
    if (touchingDown) {
      this.isGrounded = true;
    }

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    const jumpPressed = this.cursors.up.isDown || this.spaceKey.isDown;
    
    if (jumpPressed && this.isGrounded) {
      this.player.setVelocityY(-400);
      this.jumpCount++;
      this.isGrounded = false;
      this.updateStatus();
    }

    // 更新接地状态
    if (!touchingDown && this.player.body.velocity.y > 0) {
      this.isGrounded = false;
    }

    // 更新状态显示
    if (time % 100 < delta) { // 每100ms更新一次
      this.updateStatus();
    }
  }

  updateStatus() {
    const velocityY = Math.round(this.player.body.velocity.y);
    const velocityX = Math.round(this.player.body.velocity.x);
    const posY = Math.round(this.player.y);
    
    this.statusText.setText(
      `跳跃次数: ${this.jumpCount}\n` +
      `位置: (${Math.round(this.player.x)}, ${posY})\n` +
      `速度: (${velocityX}, ${velocityY})\n` +
      `着地: ${this.isGrounded ? '是' : '否'}`
    );
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
      gravity: { y: 0 }, // 重力在玩家身上单独设置
      debug: false
    }
  },
  scene: PlatformScene
};

// 启动游戏
const game = new Phaser.Game(config);