// 平台跳跃游戏
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0;
    this.isGrounded = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.body.setSize(32, 48);

    // 创建地面和平台
    this.platforms = this.physics.add.staticGroup();
    
    // 主地面
    this.platforms.create(400, 575, 'ground');
    
    // 多个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(400, 300, 'platform');
    this.platforms.create(100, 200, 'platform');
    this.platforms.create(700, 250, 'platform');

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      // 检测是否着地
      if (this.player.body.touching.down) {
        this.isGrounded = true;
      }
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加文本显示
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化信号对象
    window.__signals__ = {
      playerX: this.player.x,
      playerY: this.player.y,
      velocityX: 0,
      velocityY: 0,
      jumpCount: 0,
      isGrounded: false,
      timestamp: Date.now()
    };

    console.log('[GAME_START]', JSON.stringify({
      gravity: 800,
      moveSpeed: 240,
      playerStartX: this.player.x,
      playerStartY: this.player.y
    }));
  }

  update(time, delta) {
    // 重置着地状态
    this.isGrounded = this.player.body.touching.down;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-240);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(240);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isGrounded) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
      
      console.log('[JUMP]', JSON.stringify({
        jumpCount: this.jumpCount,
        positionX: Math.round(this.player.x),
        positionY: Math.round(this.player.y),
        timestamp: Date.now()
      }));
    }

    // 更新信息显示
    this.infoText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `Jump Count: ${this.jumpCount}`,
      `Grounded: ${this.isGrounded}`,
      ``,
      `Controls:`,
      `← → : Move`,
      `SPACE: Jump`
    ]);

    // 更新信号
    window.__signals__ = {
      playerX: Math.round(this.player.x),
      playerY: Math.round(this.player.y),
      velocityX: Math.round(this.player.body.velocity.x),
      velocityY: Math.round(this.player.body.velocity.y),
      jumpCount: this.jumpCount,
      isGrounded: this.isGrounded,
      timestamp: Date.now()
    };

    // 每秒输出一次状态日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log('[STATE]', JSON.stringify(window.__signals__));
    }
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: PlatformScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出游戏实例供测试使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = game;
}