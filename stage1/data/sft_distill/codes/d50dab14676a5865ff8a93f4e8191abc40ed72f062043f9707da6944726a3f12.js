// 平台跳跃游戏
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.player = null;
    this.platforms = null;
    this.cursors = null;
    this.jumpKey = null;
    
    // 状态信号
    this.signals = {
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
    // 使用 Graphics 创建玩家纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 48);
    graphics.generateTexture('player', 32, 48);
    graphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 400, 32);
    platformGraphics.generateTexture('platform', 400, 32);
    platformGraphics.destroy();

    // 创建小平台纹理
    const smallPlatformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    smallPlatformGraphics.fillStyle(0x8b4513, 1);
    smallPlatformGraphics.fillRect(0, 0, 200, 32);
    smallPlatformGraphics.generateTexture('smallPlatform', 200, 32);
    smallPlatformGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87CEEB');

    // 创建静态平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加地面
    const ground = this.platforms.create(400, 568, 'platform');
    ground.setScale(2, 1).refreshBody();

    // 添加几个悬空平台
    this.platforms.create(600, 400, 'smallPlatform');
    this.platforms.create(50, 250, 'smallPlatform');
    this.platforms.create(750, 220, 'smallPlatform');
    this.platforms.create(400, 150, 'smallPlatform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加提示文本
    this.add.text(16, 16, '使用方向键移动，空格/上键跳跃', {
      fontSize: '18px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(16, 50, '', {
      fontSize: '14px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });

    // 初始化全局信号
    window.__signals__ = this.signals;

    console.log('[GAME_START]', JSON.stringify({
      timestamp: Date.now(),
      scene: 'PlatformScene',
      physics: 'arcade',
      gravity: 200
    }));
  }

  update(time, delta) {
    // 检测玩家是否在地面上
    const isOnGround = this.player.body.touching.down;
    this.signals.isOnGround = isOnGround;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.signals.moveDistance += Math.abs(200 * delta / 1000);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.signals.moveDistance += Math.abs(200 * delta / 1000);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只能在地面上跳跃）
    if ((this.cursors.up.isDown || this.jumpKey.isDown) && isOnGround) {
      this.player.setVelocityY(-400);
      this.signals.jumpCount++;
      
      console.log('[JUMP]', JSON.stringify({
        timestamp: Date.now(),
        jumpCount: this.signals.jumpCount,
        position: { x: this.player.x, y: this.player.y }
      }));
    }

    // 更新信号
    this.signals.playerX = Math.round(this.player.x);
    this.signals.playerY = Math.round(this.player.y);
    this.signals.velocityX = Math.round(this.player.body.velocity.x);
    this.signals.velocityY = Math.round(this.player.body.velocity.y);

    // 更新状态显示
    this.statusText.setText([
      `位置: (${this.signals.playerX}, ${this.signals.playerY})`,
      `速度: (${this.signals.velocityX}, ${this.signals.velocityY})`,
      `在地面: ${isOnGround ? '是' : '否'}`,
      `跳跃次数: ${this.signals.jumpCount}`,
      `移动距离: ${Math.round(this.signals.moveDistance)}`
    ]);

    // 每秒输出一次状态日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log('[STATUS]', JSON.stringify(this.signals));
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: PlatformScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出验证信号
window.__game__ = game;