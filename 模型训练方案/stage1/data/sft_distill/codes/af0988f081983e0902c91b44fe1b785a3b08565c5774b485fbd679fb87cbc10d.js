// 简易平台跳跃游戏
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号：跳跃次数
    this.playerX = 0;   // 可验证的状态信号：玩家X坐标
    this.playerY = 0;   // 可验证的状态信号：玩家Y坐标
    this.isGrounded = false; // 可验证的状态信号：是否在地面
  }

  preload() {
    // 程序化生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 程序化生成平台纹理（绿色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x00ff00, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 程序化生成地面纹理（棕色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建玩家精灵
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    
    // 创建静态平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加地面
    this.platforms.create(400, 580, 'ground').setScale(1).refreshBody();
    
    // 添加多个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 350, 'platform');
    this.platforms.create(100, 250, 'platform');
    this.platforms.create(600, 250, 'platform');
    this.platforms.create(350, 150, 'platform');

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      // 碰撞回调，用于检测是否在地面
      if (this.player.body.touching.down) {
        this.isGrounded = true;
      }
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加调试文本显示状态
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加控制说明
    this.add.text(16, 560, '← → 移动  空格/↑ 跳跃', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 检测是否在地面（用于限制跳跃）
    const onGround = this.player.body.touching.down;
    
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只有在地面时才能跳）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && onGround) {
      this.player.setVelocityY(-500);
      this.jumpCount++; // 增加跳跃计数
      this.isGrounded = false;
    }

    // 更新isGrounded状态
    if (onGround) {
      this.isGrounded = true;
    }

    // 更新状态文本
    this.statusText.setText([
      `位置: (${this.playerX}, ${this.playerY})`,
      `跳跃次数: ${this.jumpCount}`,
      `在地面: ${this.isGrounded ? '是' : '否'}`,
      `速度: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`
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
      gravity: { y: 1000 }, // 设置重力为1000
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
const game = new Phaser.Game(config);