class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformX = 0;
    this.platformDirection = 1; // 1 = right, -1 = left
    this.movementCycles = 0; // 状态信号：往返次数
    this.platformMinX = 100;
    this.platformMaxX = 600;
  }

  preload() {
    // 创建蓝色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x0000ff, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 50);
    playerGraphics.generateTexture('player', 40, 50);
    playerGraphics.destroy();

    // 创建灰色地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建静态地面
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(300, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(120 * this.platformDirection);

    // 创建玩家
    this.player = this.physics.add.sprite(300, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, this.platform);
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文字
    this.add.text(400, 50, '使用方向键移动玩家\n站在蓝色平台上体验移动', {
      fontSize: '18px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 更新平台移动逻辑
    this.platformX = this.platform.x;

    // 检测平台是否到达边界，反向移动
    if (this.platform.x >= this.platformMaxX && this.platformDirection === 1) {
      this.platformDirection = -1;
      this.platform.setVelocityX(120 * this.platformDirection);
      this.movementCycles++;
    } else if (this.platform.x <= this.platformMinX && this.platformDirection === -1) {
      this.platformDirection = 1;
      this.platform.setVelocityX(120 * this.platformDirection);
      this.movementCycles++;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，保持平台的速度
      if (this.physics.world.overlap(this.player, this.platform)) {
        const touching = this.player.body.touching.down && this.platform.body.touching.up;
        if (touching) {
          this.player.setVelocityX(this.platform.body.velocity.x);
        } else {
          this.player.setVelocityX(0);
        }
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新状态显示
    const onPlatform = this.physics.world.overlap(this.player, this.platform) && 
                       this.player.body.touching.down && 
                       this.platform.body.touching.up;
    
    this.statusText.setText([
      `平台位置: ${Math.round(this.platformX)}`,
      `平台方向: ${this.platformDirection === 1 ? '右' : '左'}`,
      `往返次数: ${this.movementCycles}`,
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `站在平台上: ${onPlatform ? '是' : '否'}`
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);