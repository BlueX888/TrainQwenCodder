// 完整的 Phaser3 移动平台游戏
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    // 状态信号变量
    this.platformDirection = 1; // 1=右移, -1=左移
    this.platformPosition = 0;
    this.playerOnPlatform = false;
    this.platformSpeed = 200;
  }

  preload() {
    // 创建紫色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x9933ff, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 50);
    playerGraphics.generateTexture('player', 40, 50);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建静态地面
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(300, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.body.setVelocityX(this.platformSpeed);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform, () => {
      this.playerOnPlatform = true;
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 50, '使用方向键移动玩家\n空格键跳跃', {
      fontSize: '14px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置玩家在平台上的状态
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x >= 700) {
      this.platformDirection = -1;
      this.platform.body.setVelocityX(-this.platformSpeed);
    } else if (this.platform.x <= 100) {
      this.platformDirection = 1;
      this.platform.body.setVelocityX(this.platformSpeed);
    }

    this.platformPosition = this.platform.x;

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检测玩家是否在平台上
    if (this.player.body.touching.down && 
        this.physics.overlap(this.player, this.platform)) {
      this.playerOnPlatform = true;
      
      // 玩家跟随平台移动
      if (this.cursors.left.isUp && this.cursors.right.isUp) {
        this.player.x += this.platform.body.velocity.x * (delta / 1000);
      }
    }

    // 更新调试信息
    this.debugText.setText([
      `平台位置: ${Math.round(this.platformPosition)}`,
      `平台方向: ${this.platformDirection === 1 ? '右' : '左'}`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `玩家在平台上: ${this.playerOnPlatform ? '是' : '否'}`
    ]);
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: PlatformScene
};

// 启动游戏
new Phaser.Game(config);