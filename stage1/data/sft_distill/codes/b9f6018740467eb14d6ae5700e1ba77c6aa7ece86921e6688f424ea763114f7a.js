class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号：跳跃次数
    this.isOnGround = false; // 是否在地面上
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（棕色方块）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 400, 32);
    groundGraphics.generateTexture('ground', 400, 32);
    groundGraphics.destroy();

    // 创建平台纹理（灰色方块）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x808080, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0); // 不反弹
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞

    // 创建地面和平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加主地面
    this.platforms.create(200, 584, 'ground').setScale(2).refreshBody();
    this.platforms.create(600, 584, 'ground').setScale(2).refreshBody();
    
    // 添加跳跃平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(750, 300, 'platform');
    this.platforms.create(400, 200, 'platform');

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isOnGround = true;
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加空格键用于跳跃
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(16, 60, '← → 移动  ↑ 或 空格 跳跃', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText(
      `跳跃次数: ${this.jumpCount}\n` +
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})\n` +
      `在地面: ${this.isOnGround ? '是' : '否'}`
    );

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360); // 向左移动，速度 360
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360); // 向右移动，速度 360
    } else {
      this.player.setVelocityX(0); // 停止水平移动
    }

    // 跳跃控制（上箭头或空格键）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.isOnGround) {
      this.player.setVelocityY(-500); // 向上跳跃
      this.jumpCount++; // 增加跳跃计数
      this.isOnGround = false; // 离开地面
    }

    // 检测是否在地面上（通过速度判断）
    if (this.player.body.velocity.y > 0) {
      // 正在下落，重置地面状态
      this.isOnGround = false;
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB', // 天蓝色背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }, // 重力设置为 200
      debug: false
    }
  },
  scene: PlatformScene
};

new Phaser.Game(config);