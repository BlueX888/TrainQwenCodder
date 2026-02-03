class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformBounces = 0; // 状态信号：平台反弹次数
    this.playerOnPlatform = false; // 状态信号：玩家是否在平台上
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建黄色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffff00, 1); // 黄色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面（静态平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1); // 灰色
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建静态地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(300); // 初始向右移动，速度 300
    
    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform, () => {
      // 检测玩家是否在平台上方
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
      }
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(16, 550, '方向键移动，空格跳跃', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置平台状态
    const wasOnPlatform = this.playerOnPlatform;
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x >= this.platformMaxX && this.platform.body.velocity.x > 0) {
      this.platform.setVelocityX(-300); // 向左移动
      this.platformBounces++;
    } else if (this.platform.x <= this.platformMinX && this.platform.body.velocity.x < 0) {
      this.platform.setVelocityX(300); // 向右移动
      this.platformBounces++;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，保持平台的水平速度
      if (this.player.body.touching.down && 
          Phaser.Geom.Intersects.RectangleToRectangle(
            this.player.getBounds(), 
            this.platform.getBounds()
          )) {
        this.playerOnPlatform = true;
        // 玩家跟随平台移动
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新状态文本
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `平台反弹次数: ${this.platformBounces}`,
      `玩家在平台上: ${this.playerOnPlatform ? '是' : '否'}`,
      `平台位置: ${Math.round(this.platform.x)}`,
      `平台速度: ${this.platform.body.velocity.x}`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
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
      gravity: { y: 500 }, // 重力设置为 500
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);