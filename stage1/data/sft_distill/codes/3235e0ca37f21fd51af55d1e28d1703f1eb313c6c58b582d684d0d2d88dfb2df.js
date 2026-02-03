class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformDirection = 1; // 1: 向右, -1: 向左
    this.platformSpeed = 240;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 生成蓝色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x0066ff, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platformTex', 200, 32);
    platformGraphics.destroy();

    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('playerTex', 32, 48);
    playerGraphics.destroy();

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platformTex');
    this.platform.setImmovable(true); // 平台不受碰撞影响
    this.platform.body.allowGravity = false; // 平台不受重力影响
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面（静态平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('groundTex', 800, 50);
    groundGraphics.destroy();

    this.ground = this.physics.add.sprite(400, 575, 'groundTex');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform);
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加边界线用于调试
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xff0000, 1);
    bounds.strokeRect(100, 0, 600, 600);
  }

  update(time, delta) {
    // 更新平台移动逻辑
    // 检测平台是否到达边界（左边界100，右边界700）
    if (this.platform.x <= 200) {
      this.platformDirection = 1; // 向右移动
      this.platform.x = 200; // 修正位置
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    } else if (this.platform.x >= 600) {
      this.platformDirection = -1; // 向左移动
      this.platform.x = 600; // 修正位置
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家站在平台上，保持平台的速度
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

    // 更新状态文本
    this.statusText.setText([
      `Platform X: ${Math.round(this.platform.x)}`,
      `Platform Direction: ${this.platformDirection === 1 ? 'Right' : 'Left'}`,
      `Platform Speed: ${this.platformSpeed}`,
      `Player X: ${Math.round(this.player.x)}`,
      `Player Y: ${Math.round(this.player.y)}`,
      `Player on Platform: ${this.player.body.touching.down && this.platform.body.touching.up}`,
      `Use Arrow Keys to Move, Up to Jump`
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);