class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 状态信号：跳跃次数
    this.isGrounded = false; // 状态信号：是否在地面
  }

  preload() {
    // 使用 Graphics 生成角色纹理
    this.createPlayerTexture();
    // 使用 Graphics 生成地面纹理
    this.createPlatformTexture();
  }

  create() {
    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加主地面
    const ground = this.platforms.create(400, 568, 'platform');
    ground.setScale(2, 1).refreshBody();
    
    // 添加几个跳跃平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(750, 300, 'platform');
    this.platforms.create(300, 200, 'platform');

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示信息的文本
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加操作说明
    this.add.text(16, 550, '← → 移动  ↑ 跳跃', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 检测是否在地面上（通过速度判断）
    if (this.player.body.touching.down) {
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制：只有在地面上才能跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
      this.jumpCount++; // 增加跳跃计数
    }

    // 更新信息显示
    this.infoText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `在地面: ${this.isGrounded ? '是' : '否'}`,
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `速度: (${Math.floor(this.player.body.velocity.x)}, ${Math.floor(this.player.body.velocity.y)})`
    ]);
  }

  createPlayerTexture() {
    // 创建角色纹理（蓝色方块）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x4a90e2, 1);
    graphics.fillRect(0, 0, 32, 32);
    
    // 添加眼睛让角色更生动
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(10, 12, 4);
    graphics.fillCircle(22, 12, 4);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(10, 12, 2);
    graphics.fillCircle(22, 12, 2);
    
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  createPlatformTexture() {
    // 创建平台纹理（棕色矩形）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(0, 0, 200, 32);
    
    // 添加纹理细节
    graphics.fillStyle(0x654321, 1);
    for (let i = 0; i < 200; i += 20) {
      graphics.fillRect(i, 0, 2, 32);
    }
    
    graphics.generateTexture('platform', 200, 32);
    graphics.destroy();
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
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
new Phaser.Game(config);