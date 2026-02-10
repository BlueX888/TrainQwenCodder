class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformPosition = 0;
    this.playerOnPlatform = false;
    this.platformDirection = 1; // 1: 向右, -1: 向左
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xFF69B4, 1); // 粉色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000FF, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建地面（用于参考）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1);
    groundGraphics.fillRect(0, 550, 800, 50);
    groundGraphics.generateTexture('groundTex', 800, 50);
    groundGraphics.destroy();

    // 创建地面物理对象
    this.ground = this.physics.add.sprite(400, 575, 'groundTex');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.body.setVelocityX(300); // 初始速度向右
    
    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform, () => {
      // 检测玩家是否在平台上方
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
      }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置平台状态
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x >= this.platformMaxX) {
      this.platform.body.setVelocityX(-300);
      this.platformDirection = -1;
    } else if (this.platform.x <= this.platformMinX) {
      this.platform.body.setVelocityX(300);
      this.platformDirection = 1;
    }

    // 记录平台位置
    this.platformPosition = Math.round(this.platform.x);

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，跟随平台移动
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新调试信息
    this.debugText.setText([
      `Platform Position: ${this.platformPosition}`,
      `Platform Direction: ${this.platformDirection === 1 ? 'Right' : 'Left'}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Player Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Platform Velocity: ${Math.round(this.platform.body.velocity.x)}`,
      '',
      'Controls: Arrow Keys to Move, Up to Jump'
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);