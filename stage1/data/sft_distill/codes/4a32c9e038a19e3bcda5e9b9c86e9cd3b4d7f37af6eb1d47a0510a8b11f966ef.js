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

    // 使用 Graphics 生成地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 64, 32);
    groundGraphics.generateTexture('ground', 64, 32);
    groundGraphics.destroy();

    // 生成平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面组
    this.platforms = this.physics.add.staticGroup();

    // 添加主地面
    const ground = this.platforms.create(400, 584, 'ground');
    ground.setScale(12.5, 1).refreshBody();

    // 添加几个平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(750, 300, 'platform');
    this.platforms.create(300, 200, 'platform');

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加空格键用于跳跃
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示跳跃计数文本
    this.jumpText = this.add.text(16, 16, 'Jumps: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 添加控制说明
    this.add.text(16, 50, 'Arrow Keys: Move | Space/Up: Jump', {
      fontSize: '16px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');
  }

  update(time, delta) {
    // 检测玩家是否在地面上
    const touchingDown = this.player.body.touching.down;
    
    if (touchingDown) {
      this.isGrounded = true;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（空格键或上方向键）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.isGrounded) {
      this.player.setVelocityY(-400);
      this.jumpCount++;
      this.jumpText.setText('Jumps: ' + this.jumpCount);
      this.isGrounded = false;
    }

    // 如果玩家不在地面上，重置 isGrounded
    if (!touchingDown && this.player.body.velocity.y > 0) {
      this.isGrounded = false;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: PlatformScene,
  backgroundColor: '#87ceeb'
};

// 创建游戏实例
const game = new Phaser.Game(config);