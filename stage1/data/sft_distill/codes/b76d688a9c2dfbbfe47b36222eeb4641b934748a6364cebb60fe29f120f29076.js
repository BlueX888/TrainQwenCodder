// 完整的 Phaser3 平台跳跃游戏
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    // 可验证的状态信号
    this.jumpCount = 0;  // 跳跃次数
    this.isOnGround = false;  // 是否在地面上
    this.totalDistance = 0;  // 总移动距离
  }

  preload() {
    // 使用 Graphics 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 使用 Graphics 创建地面纹理（绿色方块）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00aa00, 1);
    groundGraphics.fillRect(0, 0, 64, 32);
    groundGraphics.generateTexture('ground', 64, 32);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色指示器
    this.add.rectangle(400, 300, 800, 600, 0x87ceeb);

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.body.setGravityY(500);  // 设置重力

    // 创建静态地面平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加主地面
    this.platforms.create(400, 568, 'ground').setScale(12.5, 1).refreshBody();

    // 添加几个平台
    this.platforms.create(600, 400, 'ground').setScale(2, 1).refreshBody();
    this.platforms.create(50, 350, 'ground').setScale(1.5, 1).refreshBody();
    this.platforms.create(750, 300, 'ground').setScale(1.5, 1).refreshBody();
    this.platforms.create(300, 250, 'ground').setScale(2, 1).refreshBody();

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isOnGround = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 记录上一帧位置用于计算移动距离
    this.lastX = this.player.x;
  }

  update(time, delta) {
    // 检测是否在地面上（通过速度判断）
    if (this.player.body.touching.down) {
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只能在地面上跳跃）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isOnGround) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
    }

    // 计算移动距离
    const distance = Math.abs(this.player.x - this.lastX);
    this.totalDistance += distance;
    this.lastX = this.player.x;

    // 更新状态显示
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `在地面: ${this.isOnGround ? '是' : '否'}`,
      `移动距离: ${Math.floor(this.totalDistance)}`,
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `速度: (${Math.floor(this.player.body.velocity.x)}, ${Math.floor(this.player.body.velocity.y)})`,
      '',
      '操作: ← → 移动, 空格 跳跃'
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 全局重力设为0，由玩家单独设置
      debug: false
    }
  },
  scene: PlatformScene
};

// 启动游戏
const game = new Phaser.Game(config);