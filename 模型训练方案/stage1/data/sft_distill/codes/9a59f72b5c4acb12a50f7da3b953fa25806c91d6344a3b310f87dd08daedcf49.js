class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformSpeed = 120;
    this.platformDirection = 1; // 1: right, -1: left
    this.platformPosition = 0;
    this.playerOnPlatform = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成黄色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffff00, 1); // 黄色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 生成蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 40, 50);
    playerGraphics.generateTexture('playerTex', 40, 50);
    playerGraphics.destroy();

    // 生成地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1); // 灰色
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('groundTex', 800, 50);
    groundGraphics.destroy();

    // 创建地面（静态平台）
    this.ground = this.physics.add.sprite(400, 575, 'groundTex');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground);
    this.platformCollider = this.physics.add.collider(
      this.player, 
      this.platform,
      null,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 50, '使用方向键移动，空格跳跃', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 空格键跳跃
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(time, delta) {
    // 检测玩家是否站在平台上
    this.playerOnPlatform = this.player.body.touching.down && 
                            this.platform.body.touching.up;

    // 平台移动逻辑 - 在左右边界反转
    if (this.platform.x <= 100) {
      this.platformDirection = 1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    } else if (this.platform.x >= 700) {
      this.platformDirection = -1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    }

    // 记录平台位置
    this.platformPosition = Math.round(this.platform.x);

    // 玩家左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果站在平台上，保持平台的水平速度
      if (this.playerOnPlatform) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新调试信息
    this.debugText.setText([
      `平台位置: ${this.platformPosition}`,
      `平台速度: ${Math.round(this.platform.body.velocity.x)}`,
      `平台方向: ${this.platformDirection > 0 ? '右' : '左'}`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `站在平台上: ${this.playerOnPlatform ? '是' : '否'}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);