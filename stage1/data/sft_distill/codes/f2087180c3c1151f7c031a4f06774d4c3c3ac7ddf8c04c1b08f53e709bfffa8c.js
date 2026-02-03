// 平台跳跃游戏场景类
class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('PlatformerScene');
    this.jumpCount = 0; // 可验证的状态：跳跃次数
    this.isGrounded = false; // 可验证的状态：是否在地面
    this.moveDistance = 0; // 可验证的状态：移动距离
  }

  preload() {
    // 使用 Graphics 创建角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 使用 Graphics 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 200, 32);
    groundGraphics.generateTexture('ground', 200, 32);
    groundGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 0, 150, 24);
    platformGraphics.generateTexture('platform', 150, 24);
    platformGraphics.destroy();
  }

  create() {
    // 添加背景色提示
    this.cameras.main.setBackgroundColor('#87ceeb');

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面和平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加主地面
    this.platforms.create(200, 568, 'ground');
    this.platforms.create(400, 568, 'ground');
    this.platforms.create(600, 568, 'ground');
    this.platforms.create(800, 568, 'ground');

    // 添加几个浮动平台
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(300, 300, 'platform');
    this.platforms.create(700, 250, 'platform');

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      // 当玩家接触地面时，重置跳跃状态
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

    // 添加操作提示
    this.add.text(16, 60, '操作: ← → 移动, 空格跳跃', {
      fontSize: '16px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });

    // 初始化移动距离记录
    this.lastX = this.player.x;
  }

  update(time, delta) {
    // 检测是否在地面
    this.isGrounded = this.player.body.touching.down;

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面时才能跳跃）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isGrounded) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
    }

    // 计算移动距离
    const deltaX = Math.abs(this.player.x - this.lastX);
    this.moveDistance += deltaX;
    this.lastX = this.player.x;

    // 更新状态显示
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `在地面: ${this.isGrounded ? '是' : '否'}`,
      `移动距离: ${Math.floor(this.moveDistance)}`,
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: PlatformerScene
};

// 创建游戏实例
const game = new Phaser.Game(config);