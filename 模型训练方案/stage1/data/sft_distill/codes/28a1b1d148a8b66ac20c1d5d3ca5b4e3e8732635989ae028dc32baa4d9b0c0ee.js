class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformDirection = 1; // 1=右, -1=左
    this.platformPosition = 0;
    this.playerOnPlatform = false;
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    const { width, height } = this.sys.game.config;

    // 创建紫色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x9b59b6, 1); // 紫色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x2ecc71, 1); // 绿色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTex', 40, 40);
    playerGraphics.destroy();

    // 创建静态地面（用于参考）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1); // 棕色
    groundGraphics.fillRect(0, height - 40, width, 40);
    const ground = this.physics.add.staticImage(width / 2, height - 20, null);
    ground.setDisplaySize(width, 40);
    ground.refreshBody();

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(240); // 初始速度 240
    
    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = width - 100;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 设置玩家与平台的碰撞
    this.platformCollider = this.physics.add.collider(
      this.player, 
      this.platform,
      this.onPlayerPlatformCollide,
      null,
      this
    );

    // 设置玩家与地面的碰撞
    this.physics.add.collider(this.player, ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(width / 2, 50, '使用方向键移动玩家\n站在紫色平台上会跟随移动', {
      fontSize: '18px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  onPlayerPlatformCollide(player, platform) {
    // 检测玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    // 更新平台位置状态
    this.platformPosition = this.platform.x;

    // 检测平台边界并反转速度
    if (this.platform.x <= this.platformMinX) {
      this.platform.setVelocityX(240);
      this.platformDirection = 1;
      this.platform.x = this.platformMinX; // 防止穿透
    } else if (this.platform.x >= this.platformMaxX) {
      this.platform.setVelocityX(-240);
      this.platformDirection = -1;
      this.platform.x = this.platformMaxX; // 防止穿透
    }

    // 检测玩家是否在平台上
    const wasOnPlatform = this.playerOnPlatform;
    this.playerOnPlatform = false;

    if (this.player.body.touching.down && this.platform.body.touching.up) {
      // 玩家在平台上，添加平台速度
      const overlapX = Math.abs(
        this.player.body.center.x - this.platform.body.center.x
      );
      const platformHalfWidth = this.platform.body.width / 2;
      
      if (overlapX < platformHalfWidth + this.player.body.halfWidth) {
        this.playerOnPlatform = true;
        // 让玩家跟随平台移动
        this.player.x += this.platform.body.velocity.x * (delta / 1000);
      }
    }

    // 玩家左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果在平台上，保持平台速度；否则停止
      if (!this.playerOnPlatform) {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新状态显示
    this.statusText.setText([
      `平台位置: ${Math.round(this.platformPosition)}`,
      `平台方向: ${this.platformDirection === 1 ? '右' : '左'}`,
      `玩家在平台上: ${this.playerOnPlatform ? '是' : '否'}`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#34495e',
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