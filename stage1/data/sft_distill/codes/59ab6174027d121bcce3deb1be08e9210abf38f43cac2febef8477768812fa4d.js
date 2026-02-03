// 平台跳跃游戏场景
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号：跳跃次数
    this.isGrounded = false; // 是否在地面上
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（棕色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1);
    groundGraphics.fillRect(0, 0, 200, 40);
    groundGraphics.generateTexture('ground', 200, 40);
    groundGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x808080, 1);
    platformGraphics.fillRect(0, 0, 150, 30);
    platformGraphics.generateTexture('platform', 150, 30);
    platformGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建玩家精灵
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true); // 限制在世界边界内
    this.player.setBounce(0); // 不反弹

    // 创建地面和平台静态组
    this.platforms = this.physics.add.staticGroup();

    // 添加地面
    this.platforms.create(100, 580, 'ground');
    this.platforms.create(300, 580, 'ground');
    this.platforms.create(500, 580, 'ground');
    this.platforms.create(700, 580, 'ground');

    // 添加平台
    this.platforms.create(400, 450, 'platform');
    this.platforms.create(600, 350, 'platform');
    this.platforms.create(200, 300, 'platform');
    this.platforms.create(700, 250, 'platform');

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      // 碰撞时标记为在地面上
      if (this.player.body.touching.down) {
        this.isGrounded = true;
      }
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);

    // 添加说明文本
    this.add.text(16, 50, '← → 移动  空格/↑ 跳跃', {
      fontSize: '16px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置地面状态
    if (!this.player.body.touching.down) {
      this.isGrounded = false;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-120);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(120);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（空格键或上方向键）
    if ((Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
         Phaser.Input.Keyboard.JustDown(this.cursors.up)) && 
        this.isGrounded) {
      this.player.setVelocityY(-500); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
      this.isGrounded = false;
      this.updateStatusText();
    }

    // 更新状态文本
    if (time % 100 < delta) { // 每100ms更新一次
      this.updateStatusText();
    }
  }

  updateStatusText() {
    const velocity = Math.abs(this.player.body.velocity.x).toFixed(0);
    const posY = this.player.y.toFixed(0);
    this.statusText.setText(
      `跳跃次数: ${this.jumpCount} | 速度: ${velocity} | 高度: ${posY} | ${this.isGrounded ? '地面' : '空中'}`
    );
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
      gravity: { y: 1000 }, // 重力设置为 1000
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
const game = new Phaser.Game(config);