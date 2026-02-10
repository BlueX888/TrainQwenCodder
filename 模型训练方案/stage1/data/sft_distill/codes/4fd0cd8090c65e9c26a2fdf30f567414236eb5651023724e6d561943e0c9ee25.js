class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 可验证状态：跳跃次数
    this.isOnGround = false; // 可验证状态：是否在地面
    this.moveDistance = 0; // 可验证状态：移动距离
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建角色纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（绿色方块）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建平台纹理（棕色方块）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建角色（物理精灵）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0); // 不反弹
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞

    // 创建地面（静态物理组）
    this.platforms = this.physics.add.staticGroup();
    
    // 添加底部地面
    this.platforms.create(400, 575, 'ground');
    
    // 添加几个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 350, 'platform');
    this.platforms.create(400, 250, 'platform');

    // 设置角色与地面的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      // 碰撞回调：检测是否在地面
      if (this.player.body.touching.down) {
        this.isOnGround = true;
      }
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加操作提示
    this.add.text(10, 550, '← → 移动  ↑ 跳跃', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 重置地面状态
    const wasOnGround = this.isOnGround;
    this.isOnGround = this.player.body.touching.down;

    // 左右移动（速度 300）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
      this.moveDistance += Math.abs(300 * delta / 1000);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
      this.moveDistance += Math.abs(300 * delta / 1000);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（仅在地面时可跳跃）
    if (this.cursors.up.isDown && this.isOnGround) {
      this.player.setVelocityY(-400); // 跳跃速度
      this.jumpCount++;
      this.isOnGround = false;
    }

    // 更新状态显示
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `在地面: ${this.isOnGround ? '是' : '否'}`,
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
  backgroundColor: '#87ceeb', // 天空蓝背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }, // 重力设置为 200
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);