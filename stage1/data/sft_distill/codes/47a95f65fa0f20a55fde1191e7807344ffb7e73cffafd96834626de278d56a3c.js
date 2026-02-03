class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformSpeed = 360;
    this.score = 0;
    this.health = 100;
    this.level = 1;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建灰色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x808080, 1); // 灰色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建地面（静止平台）
    const ground = this.physics.add.sprite(400, 550, 'platformTex');
    ground.setImmovable(true);
    ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(300, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed);

    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform);
    this.physics.add.collider(this.player, ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
    this.updateStatusText();

    // 添加说明文本
    this.add.text(10, 50, 'Use Arrow Keys to move', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platform.setVelocityX(this.platformSpeed);
    } else if (this.platform.x >= this.platformMaxX) {
      this.platform.setVelocityX(-this.platformSpeed);
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新状态（示例：根据玩家位置更新分数）
    if (this.player.body.touching.down) {
      this.score += delta * 0.01;
    }

    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText(
      `Score: ${Math.floor(this.score)} | Health: ${this.health} | Level: ${this.level}\n` +
      `Player Y: ${Math.floor(this.player.y)} | Platform X: ${Math.floor(this.platform.x)}`
    );
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);