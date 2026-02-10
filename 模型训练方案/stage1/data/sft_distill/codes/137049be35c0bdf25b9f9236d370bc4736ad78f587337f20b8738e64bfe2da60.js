// 状态变量（用于验证）
let gameState = {
  playerX: 0,
  playerY: 0,
  platformX: 0,
  platformDirection: 1, // 1=右, -1=左
  isPlayerOnPlatform: false,
  frameCount: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 创建紫色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x9933ff, 1); // 紫色
    platformGraphics.fillRect(0, 0, 150, 30);
    platformGraphics.generateTexture('platform', 150, 30);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 30, '移动平台游戏', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 60, '方向键移动，空格跳跃', {
      fontSize: '16px',
      fill: '#cccccc'
    }).setOrigin(0.5);

    // 创建地面
    const ground = this.physics.add.sprite(400, 575, 'ground');
    ground.setImmovable(true);
    ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(200); // 初始速度向右
    this.platform.body.setCollideWorldBounds(true);
    this.platform.body.onWorldBounds = true;

    // 监听平台碰撞世界边界事件，实现往返移动
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject === this.platform) {
        // 反转速度方向
        this.platform.setVelocityX(-this.platform.body.velocity.x);
        gameState.platformDirection = this.platform.body.velocity.x > 0 ? 1 : -1;
      }
    });

    // 创建玩家
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);

    // 设置碰撞检测
    this.physics.add.collider(this.player, ground);
    this.platformCollider = this.physics.add.collider(this.player, this.platform);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 添加调试信息显示
    this.debugText = this.add.text(10, 100, '', {
      fontSize: '12px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    gameState.frameCount++;

    // 检测玩家是否在平台上
    const wasOnPlatform = gameState.isPlayerOnPlatform;
    gameState.isPlayerOnPlatform = this.player.body.touching.down && 
                                     this.platform.body.touching.up;

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，保持平台的速度（跟随移动）
      if (gameState.isPlayerOnPlatform) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 更新状态变量
    gameState.playerX = Math.round(this.player.x);
    gameState.playerY = Math.round(this.player.y);
    gameState.platformX = Math.round(this.platform.x);

    // 更新状态显示
    this.statusText.setText([
      `帧数: ${gameState.frameCount}`,
      `玩家位置: (${gameState.playerX}, ${gameState.playerY})`,
      `平台位置: ${gameState.platformX}`,
      `平台方向: ${gameState.platformDirection > 0 ? '右→' : '左←'}`,
      `在平台上: ${gameState.isPlayerOnPlatform ? '是' : '否'}`
    ]);

    // 更新调试信息
    this.debugText.setText([
      `玩家速度: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `平台速度: ${Math.round(this.platform.body.velocity.x)}`,
      `touching.down: ${this.player.body.touching.down}`,
      `platform.touching.up: ${this.platform.body.touching.up}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);

// 导出状态供外部验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gameState, game };
}