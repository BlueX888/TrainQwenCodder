class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformBounces = 0; // 平台反弹次数
    this.playerX = 0; // 玩家X坐标
    this.playerY = 0; // 玩家Y坐标
    this.isOnPlatform = false; // 玩家是否在平台上
  }

  preload() {
    // 创建黄色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xFFFF00, 1); // 黄色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088FF, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 40, 50);
    playerGraphics.generateTexture('player', 40, 50);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1); // 灰色
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面（静态平台）
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(240); // 设置初始速度
    
    // 平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.platformCollider = this.physics.add.collider(this.player, this.platform, () => {
      this.isOnPlatform = true;
    });
    this.physics.add.collider(this.player, this.ground);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 60, '方向键左右移动，空格跳跃', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 更新平台移动逻辑（往返移动）
    if (this.platform.x >= this.platformMaxX && this.platform.body.velocity.x > 0) {
      this.platform.setVelocityX(-240);
      this.platformBounces++;
    } else if (this.platform.x <= this.platformMinX && this.platform.body.velocity.x < 0) {
      this.platform.setVelocityX(240);
      this.platformBounces++;
    }

    // 检测玩家是否在平台上
    this.isOnPlatform = this.player.body.touching.down && this.platform.body.touching.up;

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，保持平台的速度（实现跟随效果）
      if (this.isOnPlatform) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新调试信息
    this.debugText.setText([
      `平台反弹次数: ${this.platformBounces}`,
      `玩家位置: (${this.playerX}, ${this.playerY})`,
      `在平台上: ${this.isOnPlatform ? '是' : '否'}`,
      `平台位置: ${Math.round(this.platform.x)}`,
      `平台速度: ${this.platform.body.velocity.x}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB', // 天蓝色背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 }, // 设置重力为 400
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);