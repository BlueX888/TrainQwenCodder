// 平台跳跃游戏场景
class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('PlatformerScene');
    this.player = null;
    this.platforms = null;
    this.cursors = null;
    this.jumpKey = null;
    
    // 可验证的状态信号
    this.gameState = {
      playerX: 0,
      playerY: 0,
      velocityX: 0,
      velocityY: 0,
      isOnGround: false,
      jumpCount: 0,
      moveDistance: 0
    };
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4444ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理（绿色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x44ff44, 1);
    platformGraphics.fillRect(0, 0, 400, 32);
    platformGraphics.generateTexture('platform', 400, 32);
    platformGraphics.destroy();

    // 创建小平台纹理
    const smallPlatformGraphics = this.add.graphics();
    smallPlatformGraphics.fillStyle(0x44ff44, 1);
    smallPlatformGraphics.fillRect(0, 0, 200, 32);
    smallPlatformGraphics.generateTexture('smallPlatform', 200, 32);
    smallPlatformGraphics.destroy();

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 地面平台
    this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();
    
    // 悬浮平台
    this.platforms.create(600, 400, 'smallPlatform');
    this.platforms.create(50, 250, 'smallPlatform');
    this.platforms.create(750, 220, 'smallPlatform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    
    // 设置玩家物理体
    this.player.body.setGravityY(800);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加控制说明文本
    this.add.text(16, 16, '控制: ← → 移动, ↑ 或 空格 跳跃', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(16, 50, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化全局信号对象
    window.__signals__ = this.gameState;

    console.log('[GAME_INIT]', JSON.stringify({
      timestamp: Date.now(),
      scene: 'PlatformerScene',
      playerPosition: { x: 100, y: 450 },
      gravity: 800,
      moveSpeed: 240
    }));
  }

  update(time, delta) {
    // 检测玩家是否在地面上
    this.gameState.isOnGround = this.player.body.touching.down;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-240);
      this.gameState.moveDistance += Math.abs(240 * delta / 1000);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(240);
      this.gameState.moveDistance += Math.abs(240 * delta / 1000);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只能在地面上跳跃）
    if ((this.cursors.up.isDown || this.jumpKey.isDown) && this.gameState.isOnGround) {
      this.player.setVelocityY(-500);
      this.gameState.jumpCount++;
      
      console.log('[JUMP]', JSON.stringify({
        timestamp: Date.now(),
        jumpCount: this.gameState.jumpCount,
        position: { x: Math.round(this.player.x), y: Math.round(this.player.y) }
      }));
    }

    // 更新状态信号
    this.gameState.playerX = Math.round(this.player.x * 100) / 100;
    this.gameState.playerY = Math.round(this.player.y * 100) / 100;
    this.gameState.velocityX = Math.round(this.player.body.velocity.x * 100) / 100;
    this.gameState.velocityY = Math.round(this.player.body.velocity.y * 100) / 100;

    // 更新状态显示
    this.statusText.setText([
      `位置: (${this.gameState.playerX}, ${this.gameState.playerY})`,
      `速度: (${this.gameState.velocityX}, ${this.gameState.velocityY})`,
      `在地面: ${this.gameState.isOnGround ? '是' : '否'}`,
      `跳跃次数: ${this.gameState.jumpCount}`,
      `移动距离: ${Math.round(this.gameState.moveDistance)}`
    ].join('\n'));

    // 每秒输出一次状态日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log('[STATE]', JSON.stringify(this.gameState));
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
      gravity: { y: 0 }, // 重力在玩家身上单独设置
      debug: false
    }
  },
  scene: PlatformerScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出游戏启动信号
console.log('[GAME_START]', JSON.stringify({
  timestamp: Date.now(),
  config: {
    width: config.width,
    height: config.height,
    physics: 'arcade'
  }
}));