class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformBounces = 0; // 状态信号：平台反弹次数
    this.playerOnPlatform = false; // 玩家是否在平台上
  }

  preload() {
    // 创建粉色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff69b4, 1); // 粉色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4169e1, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 40, 50);
    playerGraphics.generateTexture('player', 40, 50);
    playerGraphics.destroy();
  }

  create() {
    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platform');
    this.platform.setImmovable(true); // 平台不可被推动
    this.platform.body.allowGravity = false; // 平台不受重力影响
    this.platform.setVelocityX(300); // 初始速度向右300

    // 创建玩家
    this.player = this.physics.add.sprite(200, 200, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建地面（用于对比）
    const ground = this.add.graphics();
    ground.fillStyle(0x808080, 1);
    ground.fillRect(0, 580, 800, 20);
    ground.generateTexture('ground', 800, 20);
    ground.destroy();
    
    this.ground = this.physics.add.sprite(400, 590, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 设置碰撞
    this.physics.add.collider(this.player, this.platform, () => {
      this.playerOnPlatform = true;
    });
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 50, '使用方向键移动玩家\n站在粉色平台上体验跟随移动', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText(
      `平台反弹次数: ${this.platformBounces}\n` +
      `玩家在平台上: ${this.playerOnPlatform ? '是' : '否'}\n` +
      `平台位置: ${Math.round(this.platform.x)}\n` +
      `平台速度: ${this.platform.body.velocity.x}`
    );

    // 重置平台状态标志
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x >= 700 && this.platform.body.velocity.x > 0) {
      // 到达右边界，向左移动
      this.platform.setVelocityX(-300);
      this.platformBounces++;
    } else if (this.platform.x <= 100 && this.platform.body.velocity.x < 0) {
      // 到达左边界，向右移动
      this.platform.setVelocityX(300);
      this.platformBounces++;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，保持平台的水平速度
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb', // 天蓝色背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }, // 重力300
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);