// 完整的 Phaser3 红色移动平台游戏
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformSpeed = 200;
    this.platformDirection = 1; // 1表示向右，-1表示向左
    this.playerOnPlatform = false;
    this.platformBounces = 0; // 平台反弹次数
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建红色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff0000, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTex', 40, 40);
    playerGraphics.destroy();

    // 创建静态地面（用于参考）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
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
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 设置平台移动范围（100到700之间）
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.platformCollider = this.physics.add.collider(
      this.player, 
      this.platform,
      this.onPlayerPlatformCollide,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 50, '使用左右箭头键移动玩家\n站在红色平台上体验移动', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  onPlayerPlatformCollide(player, platform) {
    // 检测玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    // 更新平台移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platformDirection = 1;
      this.platform.x = this.platformMinX;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platformBounces++;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platformDirection = -1;
      this.platform.x = this.platformMaxX;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platformBounces++;
    }

    // 检测玩家是否离开平台
    if (this.playerOnPlatform) {
      if (!this.player.body.touching.down || !this.platform.body.touching.up) {
        this.playerOnPlatform = false;
      }
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，跟随平台移动
      if (this.playerOnPlatform) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 更新状态显示
    this.statusText.setText([
      `平台速度: ${this.platformSpeed}`,
      `平台方向: ${this.platformDirection === 1 ? '向右' : '向左'}`,
      `平台位置: ${Math.round(this.platform.x)}`,
      `玩家在平台上: ${this.playerOnPlatform ? '是' : '否'}`,
      `平台反弹次数: ${this.platformBounces}`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);
  }
}

// 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);