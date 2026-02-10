class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformDirection = 1; // 状态信号：1为右移，-1为左移
    this.playerOnPlatform = false; // 状态信号：玩家是否在平台上
  }

  preload() {
    // 使用Graphics创建纯色纹理，避免外部资源依赖
  }

  create() {
    // 创建蓝色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x0000ff, 1); // 蓝色
    platformGraphics.fillRect(0, 0, 150, 20);
    platformGraphics.generateTexture('platformTex', 150, 20);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1); // 绿色
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('playerTex', 32, 48);
    playerGraphics.destroy();

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platformTex');
    this.platform.setImmovable(true); // 平台不受碰撞影响
    this.platform.body.allowGravity = false; // 平台不受重力影响
    this.platform.setVelocityX(80); // 初始速度向右80

    // 设置平台移动边界
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'playerTex');
    this.player.setCollideWorldBounds(true); // 玩家不能离开世界边界
    this.player.setBounce(0); // 无弹跳

    // 添加平台与玩家的碰撞检测
    this.physics.add.collider(this.player, this.platform, () => {
      this.playerOnPlatform = true;
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加地面（可选，用于玩家落地）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1); // 灰色地面
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('groundTex', 800, 40);
    groundGraphics.destroy();

    this.ground = this.physics.add.staticSprite(400, 580, 'groundTex');
    this.physics.add.collider(this.player, this.ground);

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 重置玩家在平台上的状态
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x >= this.platformMaxX && this.platform.body.velocity.x > 0) {
      // 到达右边界，向左移动
      this.platform.setVelocityX(-80);
      this.platformDirection = -1;
    } else if (this.platform.x <= this.platformMinX && this.platform.body.velocity.x < 0) {
      // 到达左边界，向右移动
      this.platform.setVelocityX(80);
      this.platformDirection = 1;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      // 如果玩家在平台上，保持平台的水平速度
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-300);
    }

    // 更新状态显示
    this.statusText.setText([
      `Platform Direction: ${this.platformDirection === 1 ? 'RIGHT' : 'LEFT'}`,
      `Platform X: ${Math.round(this.platform.x)}`,
      `Platform Velocity: ${this.platform.body.velocity.x}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Player Y: ${Math.round(this.player.y)}`,
      'Controls: Arrow Keys to Move, UP to Jump'
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
      gravity: { y: 400 }, // 重力设置为400
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);