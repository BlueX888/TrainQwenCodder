class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformBounces = 0; // 状态信号：平台反弹次数
    this.playerOnPlatform = false; // 状态信号：玩家是否在平台上
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建橙色移动平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xFF8800, 1); // 橙色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00FF00, 1); // 绿色
    playerGraphics.fillRect(0, 0, 40, 60);
    playerGraphics.generateTexture('playerTex', 40, 60);
    playerGraphics.destroy();

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(200); // 初始向右移动，速度200

    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform, () => {
      this.playerOnPlatform = true;
    });

    // 创建地面（用于测试）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1); // 棕色地面
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('groundTex', 800, 50);
    groundGraphics.destroy();

    this.ground = this.physics.add.staticSprite(400, 575, 'groundTex');
    this.physics.add.collider(this.player, this.ground);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(400, 30, '使用方向键左右移动玩家', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 更新平台移动逻辑（往返移动）
    if (this.platform.x <= this.platformMinX) {
      this.platform.setVelocityX(200); // 向右移动
      this.platformBounces++;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platform.setVelocityX(-200); // 向左移动
      this.platformBounces++;
    }

    // 检测玩家是否在平台上
    const onPlatform = this.player.body.touching.down && 
                       this.platform.body.touching.up;
    
    if (onPlatform) {
      this.playerOnPlatform = true;
      // 玩家跟随平台移动
      // 通过碰撞检测，玩家会自动跟随平台移动
    } else {
      this.playerOnPlatform = false;
    }

    // 玩家左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果在平台上，保持平台的速度
      if (onPlatform) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 更新状态显示
    this.statusText.setText([
      `Platform Bounces: ${this.platformBounces}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Platform X: ${Math.round(this.platform.x)}`,
      `Player X: ${Math.round(this.player.x)}, Y: ${Math.round(this.player.y)}`
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
      gravity: { y: 1000 }, // 重力设置为1000
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);