class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformBounces = 0; // 状态信号：平台反弹次数
    this.playerOnPlatform = false; // 状态信号：玩家是否在平台上
  }

  preload() {
    // 创建粉色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xFF69B4, 1); // 粉色
    platformGraphics.fillRect(0, 0, 150, 20);
    platformGraphics.generateTexture('platform', 150, 20);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00FF00, 1); // 绿色
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1); // 棕色
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加状态文本显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建地面
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(80); // 初始速度向右
    
    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platform, () => {
      // 当玩家站在平台上时，标记状态
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
      }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(400, 50, '使用方向键移动玩家', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 80, '站在粉色平台上体验移动', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 重置平台状态标记
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platform.setVelocityX(80); // 向右移动
      this.platformBounces++;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platform.setVelocityX(-80); // 向左移动
      this.platformBounces++;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      // 如果玩家在平台上，跟随平台移动
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新状态显示
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
  backgroundColor: '#87CEEB', // 天蓝色背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 }, // 设置重力为600
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);