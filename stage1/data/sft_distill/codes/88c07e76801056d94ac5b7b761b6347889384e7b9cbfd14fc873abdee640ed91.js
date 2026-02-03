class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformX = 0;
    this.platformDirection = 1; // 1表示向右，-1表示向左
    this.playerOnPlatform = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xFFFF00, 1); // 黄色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000FF, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTex', 40, 40);
    playerGraphics.destroy();

    // 创建地面（用于对比）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1); // 灰色
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
    this.platform.setVelocityX(240); // 初始向右移动，速度240
    
    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform, this.onPlatformCollide, null, this);

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 50, 'Arrow Keys to Move\nJump on Yellow Platform', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  onPlatformCollide(player, platform) {
    // 检测玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    // 更新平台位置状态
    this.platformX = this.platform.x;

    // 平台往返移动逻辑
    if (this.platform.x >= this.platformMaxX) {
      this.platform.setVelocityX(-240); // 向左移动
      this.platformDirection = -1;
    } else if (this.platform.x <= this.platformMinX) {
      this.platform.setVelocityX(240); // 向右移动
      this.platformDirection = 1;
    }

    // 检测玩家是否还在平台上
    const onPlatformNow = this.player.body.touching.down && 
                          this.platform.body.touching.up &&
                          Math.abs(this.player.x - this.platform.x) < 120;

    // 如果玩家在平台上，让玩家跟随平台移动
    if (onPlatformNow) {
      this.playerOnPlatform = true;
      // 玩家跟随平台的水平速度
      const platformVelocity = this.platform.body.velocity.x;
      this.player.x += platformVelocity * (delta / 1000);
    } else {
      this.playerOnPlatform = false;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果在平台上，保持平台速度；否则停止
      if (!onPlatformNow) {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-350);
    }

    // 更新状态显示
    this.statusText.setText(
      `Platform X: ${Math.round(this.platformX)}\n` +
      `Platform Dir: ${this.platformDirection > 0 ? 'RIGHT' : 'LEFT'}\n` +
      `Player on Platform: ${this.playerOnPlatform}\n` +
      `Player X: ${Math.round(this.player.x)}, Y: ${Math.round(this.player.y)}`
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
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);