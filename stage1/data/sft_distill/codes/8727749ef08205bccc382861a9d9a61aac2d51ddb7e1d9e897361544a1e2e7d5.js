// 简易平台跳跃游戏
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.player = null;
    this.platforms = null;
    this.cursors = null;
    this.jumpKey = null;
    
    // 状态信号
    this.gameState = {
      playerX: 0,
      playerY: 0,
      velocityX: 0,
      velocityY: 0,
      isOnGround: false,
      jumpCount: 0,
      moveDistance: 0,
      timestamp: 0
    };
    
    // 暴露到全局用于验证
    window.__signals__ = this.gameState;
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
  }

  create() {
    // 创建玩家纹理（32x32 蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4a90e2, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理（绿色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x2ecc71, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建地面纹理（棕色长条）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建静态平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加地面
    this.platforms.create(400, 575, 'ground').setScale(1).refreshBody();

    // 添加多个平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(200, 400, 'platform');
    this.platforms.create(400, 300, 'platform');
    this.platforms.create(100, 200, 'platform');
    this.platforms.create(650, 200, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800); // 设置重力为 800

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.gameState.isOnGround = this.player.body.touching.down;
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加说明文字
    this.add.text(16, 16, '控制说明：\n← → 移动\n↑ 或 空格 跳跃', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 添加状态显示
    this.statusText = this.add.text(16, 100, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log('[GAME_START]', JSON.stringify({
      type: 'game_start',
      timestamp: Date.now(),
      config: {
        gravity: 800,
        moveSpeed: 240
      }
    }));
  }

  update(time, delta) {
    // 检测是否在地面上
    this.gameState.isOnGround = this.player.body.touching.down;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-240); // 移动速度 240
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
        type: 'jump',
        timestamp: Date.now(),
        position: { x: this.player.x, y: this.player.y },
        jumpCount: this.gameState.jumpCount
      }));
    }

    // 更新状态信号
    this.gameState.playerX = Math.round(this.player.x);
    this.gameState.playerY = Math.round(this.player.y);
    this.gameState.velocityX = Math.round(this.player.body.velocity.x);
    this.gameState.velocityY = Math.round(this.player.body.velocity.y);
    this.gameState.timestamp = Date.now();

    // 更新状态显示
    this.statusText.setText(
      `位置: (${this.gameState.playerX}, ${this.gameState.playerY})\n` +
      `速度: (${this.gameState.velocityX}, ${this.gameState.velocityY})\n` +
      `在地面: ${this.gameState.isOnGround ? '是' : '否'}\n` +
      `跳跃次数: ${this.gameState.jumpCount}\n` +
      `移动距离: ${Math.round(this.gameState.moveDistance)}`
    );

    // 每秒输出一次状态日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log('[STATE]', JSON.stringify({
        type: 'state',
        timestamp: Date.now(),
        state: this.gameState
      }));
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb', // 天蓝色背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 场景重力设为0，由玩家自身控制
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露游戏实例用于验证
window.__game__ = game;