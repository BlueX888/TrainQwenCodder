class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformDirection = 1; // 1为右，-1为左
    this.playerOnPlatform = false;
    this.platformMoveCount = 0; // 平台方向改变次数
  }

  preload() {
    // 创建橙色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff8800, 1); // 橙色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(120 * this.platformDirection);

    // 设置平台移动边界
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platformDirection = 1;
      this.platform.setVelocityX(120);
      this.platformMoveCount++;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platformDirection = -1;
      this.platform.setVelocityX(-120);
      this.platformMoveCount++;
    }

    // 检测玩家是否站在平台上
    const playerBottom = this.player.body.bottom;
    const platformTop = this.platform.body.top;
    const playerCenterX = this.player.body.center.x;
    const platformLeft = this.platform.body.left;
    const platformRight = this.platform.body.right;

    // 判断玩家是否在平台上方且接触平台
    const onPlatform = 
      this.player.body.touching.down &&
      this.platform.body.touching.up &&
      Math.abs(playerBottom - platformTop) < 5 &&
      playerCenterX >= platformLeft &&
      playerCenterX <= platformRight;

    this.playerOnPlatform = onPlatform;

    // 玩家在平台上时，同步平台的水平速度
    if (this.playerOnPlatform) {
      // 保存玩家的垂直速度
      const playerVelocityY = this.player.body.velocity.y;
      
      // 玩家跟随平台移动
      this.player.x += this.platform.body.velocity.x * (delta / 1000);
      
      // 确保玩家不超出世界边界
      if (this.player.x < 16) this.player.x = 16;
      if (this.player.x > 784) this.player.x = 784;
    }

    // 玩家左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新调试信息
    this.debugText.setText([
      `Platform X: ${Math.round(this.platform.x)}`,
      `Platform Direction: ${this.platformDirection > 0 ? 'RIGHT' : 'LEFT'}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Platform Move Count: ${this.platformMoveCount}`,
      `Player X: ${Math.round(this.player.x)}, Y: ${Math.round(this.player.y)}`,
      `Use Arrow Keys to Move and Jump`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
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